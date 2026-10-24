import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { LANGUAGE_TRACKS, getPublicTrack } from '../data/tracks.js';
import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { RecommendationModel, SkillProfileModel, TrackProgressModel, UserModel } from '../models/index.js';
import { CodeLanguage, IDailyMission, IRecommendation, ISkillProfile, ITrackMistake, ITrackProgress } from '../types/index.js';
import { recordActivity } from '../services/activityService.js';
import { runCode } from '../services/codeRunner.js';
import { SEED_COMPANIES } from '../data/seedCompanies.js';

const getProgress = async (userId: string, trackId: CodeLanguage): Promise<any> => {
  if (isMongoActive()) return TrackProgressModel.findOne({ userId, trackId });
  return jsonStore.findOne('trackProgress', progress => progress.userId === userId && progress.trackId === trackId);
};

const createProgress = async (userId: string, trackId: CodeLanguage): Promise<any> => {
  const track = LANGUAGE_TRACKS.find(item => item.id === trackId)!;
  const initial: Omit<ITrackProgress, 'id'> = {
    userId,
    trackId,
    currentModuleId: track.modules[0].id,
    completedModuleIds: [],
    quizAttempts: [],
    mistakes: [],
    startedAt: new Date(),
    updatedAt: new Date()
  };
  if (isMongoActive()) return TrackProgressModel.create(initial);
  return jsonStore.insert('trackProgress', { id: `track_${userId}_${trackId}`, ...initial });
};

const ensureProgress = async (userId: string, trackId: CodeLanguage): Promise<any> =>
  (await getProgress(userId, trackId)) || createProgress(userId, trackId);

const saveProgress = async (userId: string, trackId: CodeLanguage, updates: Partial<ITrackProgress>): Promise<any> => {
  if (isMongoActive()) {
    return TrackProgressModel.findOneAndUpdate(
      { userId, trackId },
      { $set: updates, $setOnInsert: { userId, trackId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }
  return jsonStore.updateOne('trackProgress', progress => progress.userId === userId && progress.trackId === trackId, updates);
};

const getProfileObject = async (userId: string): Promise<any> => {
  if (isMongoActive()) {
    const profile = await SkillProfileModel.findOne({ userId });
    return profile?.toObject() || null;
  }
  return jsonStore.findOne('skillProfiles', profile => profile.userId === userId) || null;
};

const updateLearningSignals = async (
  userId: string,
  trackId: CodeLanguage,
  completedModule: boolean,
  questionResults: { topic: string; correct: boolean }[]
): Promise<ISkillProfile> => {
  const [user, storedProfile] = await Promise.all([
    isMongoActive() ? UserModel.findById(userId).select('targetCompany') : Promise.resolve(jsonStore.findById('users', userId)),
    getProfileObject(userId)
  ]);
  const profile = storedProfile || {
    id: `prof_${userId}`,
    userId,
    overallReadinessScore: 0,
    assessmentCompleted: false,
    categories: { aptitude: 0, languages: 0, dsa: 0, coreCs: 0, interview: 0 },
    topicBreakdown: [],
    strongTopics: [],
    weakTopics: [],
    targetCompanyFit: { score: 0, matchLevel: 'Needs Work', missingCompetencies: [], readinessTier: 'Foundational' }
  };
  const now = new Date();
  profile.categories.languages = Math.min(100, Number(profile.categories.languages || 0) + (completedModule ? 5 : 0));
  const topicBreakdown = [...(profile.topicBreakdown || [])];
  const strongTopics = new Set<string>(profile.strongTopics || []);
  const weakTopics = new Set<string>(profile.weakTopics || []);

  for (const result of questionResults) {
    const existing = topicBreakdown.find(item => item.topic === result.topic && item.category === 'Languages');
    if (existing) {
      const previousAttempts = Number(existing.attempts || 0);
      const priorCorrect = Math.round(Number(existing.accuracy || 0) * previousAttempts / 100);
      existing.attempts = previousAttempts + 1;
      existing.accuracy = Math.round((priorCorrect + (result.correct ? 1 : 0)) / existing.attempts * 100);
      existing.score = existing.accuracy;
      existing.lastPracticed = now;
    } else {
      topicBreakdown.push({ topic: result.topic, category: 'Languages', score: result.correct ? 100 : 0, accuracy: result.correct ? 100 : 0, attempts: 1, lastPracticed: now });
    }
    const mastery = topicBreakdown.find(item => item.topic === result.topic && item.category === 'Languages');
    if (mastery && mastery.accuracy >= 70) {
      strongTopics.add(result.topic);
      weakTopics.delete(result.topic);
    } else {
      weakTopics.add(result.topic);
      strongTopics.delete(result.topic);
    }
  }

  const targetCompanyName = String(user?.targetCompany || 'Google');
  const company = SEED_COMPANIES.find(item => item.name.toLowerCase() === targetCompanyName.toLowerCase()) || SEED_COMPANIES[0];
  const weights = company.skillWeightage;
  const categories = profile.categories;
  const overallReadinessScore = Math.round(
    categories.aptitude * weights.aptitude / 100 +
    categories.dsa * weights.dsa / 100 +
    categories.languages * weights.languages / 100 +
    categories.coreCs * weights.coreCs / 100 +
    categories.interview * weights.interview / 100
  );
  const fitScore = Math.max(25, Math.min(98, Math.round(overallReadinessScore * 0.95 + strongTopics.size * 2)));
  const updatedProfile = {
    ...profile,
    categories,
    overallReadinessScore,
    topicBreakdown,
    strongTopics: [...strongTopics],
    weakTopics: [...weakTopics],
    targetCompanyFit: {
      score: fitScore,
      matchLevel: fitScore >= 75 ? 'High' : fitScore >= 50 ? 'Moderate' : 'Needs Work',
      missingCompetencies: profile.targetCompanyFit?.missingCompetencies || [],
      readinessTier: fitScore >= 75 ? 'Tier 1 Ready' : fitScore >= 50 ? 'Tier 2 Ready' : 'Foundational'
    },
    lastUpdated: now
  };

  await updateRecommendations(userId, trackId, questionResults.filter(result => !result.correct).map(result => result.topic));
  if (isMongoActive()) {
    const saved = await SkillProfileModel.findOneAndUpdate({ userId }, { $set: updatedProfile, $setOnInsert: { userId } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return { ...saved.toObject(), id: String(saved._id), userId: String(saved.userId) } as ISkillProfile;
  }
  const saved = jsonStore.findOne('skillProfiles', item => item.userId === userId)
    ? jsonStore.updateOne('skillProfiles', item => item.userId === userId, updatedProfile)
    : jsonStore.insert('skillProfiles', updatedProfile);

  return saved as ISkillProfile;
};

const updateRecommendations = async (userId: string, trackId: CodeLanguage, mistakeTopics: string[]): Promise<void> => {
  if (mistakeTopics.length === 0) return;
  let recommendation: any;
  if (isMongoActive()) recommendation = await RecommendationModel.findOne({ userId });
  else recommendation = jsonStore.findOne('recommendations', item => item.userId === userId);

  const dailyMissions: IDailyMission[] = [...(recommendation?.dailyMissions || [])];
  for (const topic of [...new Set(mistakeTopics)]) {
    const id = `track-review-${trackId}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (dailyMissions.some(mission => mission.id === id)) continue;
    dailyMissions.unshift({
      id,
      title: `Review ${topic} in your ${trackId} track`,
      module: 'language',
      priority: 'High',
      reason: `A recent quiz answer showed a gap in ${topic}. Review the concept and retry the quiz.`,
      estimatedMinutes: 10,
      actionUrl: `/learn/${trackId}`,
      isCompleted: false,
      topic
    });
  }
  const updates: Partial<IRecommendation> = {
    dailyMissions: dailyMissions.slice(0, 12),
    summaryInsight: `Review your recent language-track mistakes in ${[...new Set(mistakeTopics)].slice(0, 3).join(', ')}. Revisit the concepts before continuing.`,
    updatedAt: new Date()
  };
  if (isMongoActive()) {
    if (recommendation) await RecommendationModel.findOneAndUpdate({ userId }, updates, { new: true });
    else await RecommendationModel.create({ userId, dailyMissions: updates.dailyMissions, roadmap: [], summaryInsight: updates.summaryInsight });
    return;
  }
  if (recommendation) jsonStore.updateOne('recommendations', item => item.userId === userId, updates);
  else jsonStore.insert('recommendations', { userId, dailyMissions: updates.dailyMissions, roadmap: [], summaryInsight: updates.summaryInsight });
};

const toClientProgress = (progress: any, trackId: CodeLanguage, currentModuleId?: string) => ({
  trackId,
  started: true,
  currentModuleId: progress?.currentModuleId || currentModuleId,
  completedModuleIds: progress?.completedModuleIds || [],
  quizAttempts: progress?.quizAttempts || [],
  mistakes: progress?.mistakes || []
});

export const getTracks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    const progressRecords = isMongoActive()
      ? await TrackProgressModel.find({ userId }).lean()
      : jsonStore.find('trackProgress', item => item.userId === userId);
    const progressById = new Map(progressRecords.map(item => [item.trackId, item]));
    res.json({ success: true, tracks: LANGUAGE_TRACKS.map(track => {
      const progress = progressById.get(track.id);
      return {
        id: track.id,
        name: track.name,
        level: track.level,
        topics: track.topics,
        totalModules: track.totalModules,
        started: !!progress,
        completedCount: progress?.completedModuleIds.length || 0
      };
    }) });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unable to load language tracks.' });
  }
};

export const getTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const track = LANGUAGE_TRACKS.find(item => item.id === req.params.id);
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    if (!track) { res.status(404).json({ success: false, message: 'Language track not found.' }); return; }
    const progress = await getProgress(userId, track.id);
    res.json({ success: true, track: getPublicTrack(track), progress: toClientProgress(progress, track.id, track.modules[0].id) });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unable to load this language track.' });
  }
};

export const startTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const track = LANGUAGE_TRACKS.find(item => item.id === req.params.id);
  if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  if (!track) { res.status(404).json({ success: false, message: 'Language track not found.' }); return; }
  const progress = await ensureProgress(userId, track.id);
  res.json({ success: true, progress: toClientProgress(progress, track.id, track.modules[0].id) });
};

export const runTrackModule = async (req: AuthRequest, res: Response): Promise<void> => {
  const track = LANGUAGE_TRACKS.find(item => item.id === req.params.id);
  const module = track?.modules.find(item => item.id === req.params.moduleId);
  if (!req.user?.userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  if (!track || !module) { res.status(404).json({ success: false, message: 'Track module not found.' }); return; }
  if (module.comingSoon || !module.playground) { res.status(409).json({ success: false, message: 'This module is coming soon.' }); return; }
  const previousModule = track.modules[module.number - 2];
  if (previousModule) {
    const progress = await getProgress(req.user.userId, track.id);
    if (!progress?.completedModuleIds.includes(previousModule.id)) {
      res.status(403).json({ success: false, message: 'Complete the previous module to unlock this playground.' });
      return;
    }
  }
  if (typeof req.body?.code !== 'string' || !req.body.code.trim() || req.body.code.length > 20000) {
    res.status(400).json({ success: false, message: 'Provide code under 20,000 characters.' }); return;
  }
  const result = await runCode(track.language, req.body.code, [{ input: module.playground.input, expectedOutput: module.playground.expectedOutput }]);
  res.json({ success: true, ...result });
};

export const submitTrackQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const track = LANGUAGE_TRACKS.find(item => item.id === req.params.id);
    const module = track?.modules.find(item => item.id === req.params.moduleId);
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    if (!track || !module) { res.status(404).json({ success: false, message: 'Track module not found.' }); return; }
    if (module.comingSoon || !module.quiz?.length) { res.status(409).json({ success: false, message: 'This module is coming soon.' }); return; }

    let progress = await ensureProgress(userId, track.id);
    const previousModule = track.modules[module.number - 2];
    if (previousModule && !progress.completedModuleIds.includes(previousModule.id)) {
      res.status(403).json({ success: false, message: 'Complete the previous module to unlock this quiz.' }); return;
    }
    const answers = req.body?.answers;
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      res.status(400).json({ success: false, message: 'Quiz answers must be an object keyed by question ID.' }); return;
    }

    const questionResults = module.quiz.map(question => {
      const selectedOptionId = answers[question.id];
      const selectedOption = question.options.find(option => option.id === selectedOptionId);
      const correctOption = question.options.find(option => option.id === question.correctOptionId)!;
      const correct = selectedOptionId === question.correctOptionId;
      return {
        questionId: question.id,
        topic: question.topic,
        prompt: question.prompt,
        selectedOption: selectedOption?.text || 'Skipped',
        correctOptionId: question.correctOptionId,
        correctAnswer: correctOption.text,
        correct,
        explanation: question.explanation
      };
    });
    const correctCount = questionResults.filter(result => result.correct).length;
    const score = Math.round(correctCount / questionResults.length * 100);
    const passed = score >= 60;
    const now = new Date();
    const mistakes = [...(progress.mistakes || [])] as ITrackMistake[];
    for (const result of questionResults.filter(item => !item.correct)) {
      const existing = mistakes.find(item => item.moduleId === module.id && item.questionId === result.questionId);
      if (existing) {
        existing.selectedOption = result.selectedOption;
        existing.attempts += 1;
        existing.lastAttemptedAt = now;
      } else {
        mistakes.push({
          moduleId: module.id,
          questionId: result.questionId,
          topic: result.topic,
          prompt: result.prompt,
          selectedOption: result.selectedOption,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
          attempts: 1,
          lastAttemptedAt: now
        });
      }
    }
    const wasCompleted = progress.completedModuleIds.includes(module.id);
    const completedModuleIds = [...new Set<string>([...(progress.completedModuleIds || []), ...(passed ? [module.id] : [])])];
    const nextReadyModule = track.modules.find(item => !item.comingSoon && !completedModuleIds.includes(item.id));
    const nextModuleId = passed ? (nextReadyModule?.id || module.id) : module.id;
    const quizAttempts = [...(progress.quizAttempts || []), { moduleId: module.id, score, passed, attemptedAt: now }].slice(-100);
    progress = await saveProgress(userId, track.id, { currentModuleId: nextModuleId, completedModuleIds, quizAttempts, mistakes, updatedAt: now });

    await Promise.all(questionResults.map(result => recordActivity({
      userId,
      category: 'programming',
      solved: result.correct,
      difficulty: 'medium'
    })));
    const skillProfile = await updateLearningSignals(userId, track.id, passed && !wasCompleted, questionResults.map(result => ({ topic: result.topic, correct: result.correct })));

    res.json({
      success: true,
      score,
      correctCount,
      totalQuestions: questionResults.length,
      passMark: 60,
      passed,
      completedModuleIds,
      currentModuleId: nextModuleId,
      feedback: questionResults,
      mistakes,
      skillProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unable to grade this quiz.' });
  }
};