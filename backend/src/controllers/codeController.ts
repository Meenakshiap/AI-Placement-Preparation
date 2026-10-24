import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { CodingAttemptModel, SkillProfileModel, UserModel } from '../models/index.js';
import { isMongoActive } from '../config/db.js';
import { jsonStore } from '../store/jsonStore.js';
import { PROBLEMS } from '../data/problems.js';
import { CodeLanguage, ISkillProfile } from '../types/index.js';
import { runCode as executeCode } from '../services/codeRunner.js';
import { recordActivity } from '../services/activityService.js';
import { SEED_COMPANIES } from '../data/seedCompanies.js';

const LANGUAGES: CodeLanguage[] = ['python', 'java', 'cpp', 'javascript'];

const updateReadiness = async (userId: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<any> => {
  const mongo = isMongoActive();
  const user = mongo
    ? await UserModel.findById(userId).select('targetCompany')
    : jsonStore.findById('users', userId);
  const existing = mongo
    ? await SkillProfileModel.findOne({ userId })
    : jsonStore.findOne('skillProfiles', profile => profile.userId === userId);
  const profile = existing?.toObject ? existing.toObject() : existing;
  const categories = {
    aptitude: Number(profile?.categories?.aptitude || 0),
    languages: Number(profile?.categories?.languages || 0),
    dsa: Math.min(100, Number(profile?.categories?.dsa || 0) + (difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 6 : 8)),
    coreCs: Number(profile?.categories?.coreCs || 0),
    interview: Number(profile?.categories?.interview || 0)
  };
  const company = SEED_COMPANIES.find(item => item.name.toLowerCase() === String(user?.targetCompany || '').toLowerCase()) || SEED_COMPANIES[0];
  const weights = company.skillWeightage;
  const overallReadinessScore = Math.round(
    categories.aptitude * weights.aptitude / 100 +
    categories.dsa * weights.dsa / 100 +
    categories.languages * weights.languages / 100 +
    categories.coreCs * weights.coreCs / 100 +
    categories.interview * weights.interview / 100
  );
  const fitScore = Math.max(25, Math.min(98, Math.round(overallReadinessScore * 0.95 + ((profile?.strongTopics || []).length * 2))));
  const updates = {
    categories,
    overallReadinessScore,
    targetCompanyFit: {
      score: fitScore,
      matchLevel: fitScore >= 75 ? 'High' : fitScore >= 50 ? 'Moderate' : 'Needs Work',
      missingCompetencies: profile?.targetCompanyFit?.missingCompetencies || [],
      readinessTier: fitScore >= 75 ? 'Tier 1 Ready' : fitScore >= 50 ? 'Tier 2 Ready' : 'Foundational'
    },
    assessmentCompleted: profile?.assessmentCompleted || false,
    topicBreakdown: profile?.topicBreakdown || [],
    strongTopics: profile?.strongTopics || [],
    weakTopics: profile?.weakTopics || [],
    lastUpdated: new Date()
  };

  if (mongo) {
    const saved = await SkillProfileModel.findOneAndUpdate(
      { userId },
      { $set: updates, $setOnInsert: { userId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return { ...saved.toObject(), id: String(saved._id), userId: String(saved.userId) };
  }

  const saved = existing
    ? jsonStore.updateOne('skillProfiles', item => item.userId === userId, updates)
    : jsonStore.insert('skillProfiles', { id: `skill_${userId}`, userId, ...updates });
  return saved;
};

const submitCode = async (req: AuthRequest, res: Response, submit: boolean): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { problemId, language, code } = req.body || {};
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (typeof problemId !== 'string' || !LANGUAGES.includes(language) || typeof code !== 'string' || !code.trim() || code.length > 20000) {
      res.status(400).json({ success: false, message: 'Provide a problem, supported language, and code under 20,000 characters.' });
      return;
    }

    const problem = PROBLEMS.find(item => item.id === problemId);
    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found.' });
      return;
    }

    const cases = submit ? [...problem.visibleTestCases, ...problem.hiddenTestCases] : problem.visibleTestCases;
    const run = await executeCode(language, code, cases);
    const passedCount = run.results.filter(result => result.passed).length;
    const isCorrect = cases.length > 0 && passedCount === cases.length && !run.compileError && !run.runtimeError;

    let skillProfile;
    if (submit) {
      const solvedBefore = isMongoActive()
        ? await CodingAttemptModel.exists({ userId, problemId, isCorrect: true })
        : jsonStore.findOne('codingAttempts', attempt => attempt.userId === userId && attempt.problemId === problemId && attempt.isCorrect);
      const totalRuntime = run.results.reduce((total, result) => total + result.runtimeMs, run.runtimeMs);
      const attempt = {
        userId,
        problemId,
        language,
        source: code,
        isCorrect,
        testCasesPassed: passedCount,
        totalTestCases: cases.length,
        executionTimeMs: totalRuntime,
        feedback: isCorrect ? 'All test cases passed.' : `${passedCount} of ${cases.length} test cases passed.`
      };
      if (isMongoActive()) await CodingAttemptModel.create(attempt);
      else jsonStore.insert('codingAttempts', attempt);

      await recordActivity({
        userId,
        category: 'programming',
        solved: isCorrect,
        difficulty: problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
      });
      if (isCorrect && !solvedBefore) skillProfile = await updateReadiness(userId, problem.difficulty);
    }

    const results = run.results.map((result, index) => {
      const hidden = submit && index >= problem.visibleTestCases.length;
      return {
        caseNumber: index + 1,
        hidden,
        passed: result.passed,
        input: hidden ? undefined : result.input,
        expectedOutput: hidden ? undefined : result.expectedOutput,
        actualOutput: hidden ? undefined : result.actualOutput,
        runtimeMs: result.runtimeMs,
        error: hidden ? (result.error ? 'Hidden test case failed.' : undefined) : result.error
      };
    });

    res.json({
      success: true,
      submitted: submit,
      solved: submit && isCorrect,
      passedCount,
      totalTestCases: cases.length,
      results,
      compileError: run.compileError,
      runtimeError: run.runtimeError,
      skillProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unable to run the submission.' });
  }
};

export const runCode = (req: AuthRequest, res: Response): Promise<void> => submitCode(req, res, false);
export const submitCodeForEvaluation = (req: AuthRequest, res: Response): Promise<void> => submitCode(req, res, true);