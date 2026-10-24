import { Response } from 'express';
import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { QuestionModel, SkillProfileModel, AttemptModel } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { SEED_QUESTIONS } from '../data/seedQuestions.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';
import { recordActivity } from '../services/activityService.js';

export const getDiagnosticQuestions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let questions: any[] = [];
    if (isMongoActive()) {
      questions = await QuestionModel.find({ type: 'diagnostic' }).lean();
    } else {
      questions = jsonStore.find('questions', q => q.type === 'diagnostic');
    }

    if (!questions || questions.length === 0) {
      questions = SEED_QUESTIONS.filter(q => q.type === 'diagnostic');
    }

    // Sanitize correct answers and explanations for testing session
    const sanitizedQuestions = questions.map(q => ({
      id: q.id || q._id,
      title: q.title,
      type: q.type,
      category: q.category,
      subTopic: q.subTopic,
      difficulty: q.difficulty,
      description: q.description,
      options: q.options,
      hints: q.hints || [],
      companiesTagged: q.companiesTagged || []
    }));

    res.json({
      success: true,
      totalQuestions: sanitizedQuestions.length,
      estimatedMinutes: 15,
      questions: sanitizedQuestions
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching diagnostic questions.' });
  }
};

export const submitDiagnosticAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid or empty answers payload.' });
      return;
    }

    // Record individual attempts
    for (const ans of answers) {
      const q = SEED_QUESTIONS.find(item => item.id === ans.questionId);
      const isCorrect = q ? (q.correctAnswer?.trim().toLowerCase() === ans.selectedOption?.trim().toLowerCase()) : false;
      const attemptData = {
        userId,
        questionId: ans.questionId,
        module: 'diagnostic',
        userSubmission: ans.selectedOption || '',
        isCorrect,
        scoreAwarded: isCorrect ? 10 : 0,
        timeSpentSeconds: ans.timeSpentSeconds || 30,
        feedback: isCorrect ? 'Correct!' : (q?.explanation || 'Incorrect')
      };

      if (isMongoActive()) {
        await AttemptModel.create(attemptData);
      } else {
        jsonStore.insert('attempts', attemptData);
      }

      const programmingCategories = ['Python', 'Java', 'C++', 'JavaScript', 'DSA', 'CoreCS', 'SystemDesign'];
      const category = q && programmingCategories.includes(q.category) ? 'programming' : 'aptitude';
      const difficulty = q?.difficulty?.toLowerCase() as 'easy' | 'medium' | 'hard' || 'medium';
      await recordActivity({
        userId,
        category,
        solved: isCorrect,
        difficulty
      });
    }

    // Evaluate diagnostic through Recommendation Engine
    const result = await RecommendationEngine.evaluateDiagnosticAssessment(userId, answers);

    res.json({
      success: true,
      message: 'Diagnostic skill assessment evaluated successfully!',
      profile: result.profile,
      recommendation: result.recommendation,
      scoreSummary: result.scoreSummary
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error submitting assessment.' });
  }
};

export const getAssessmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let profile: any;
    if (isMongoActive()) {
      profile = await SkillProfileModel.findOne({ userId });
    } else {
      profile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
    }

    res.json({
      success: true,
      isCompleted: profile?.assessmentCompleted || false,
      skillProfile: profile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching assessment status.' });
  }
};
