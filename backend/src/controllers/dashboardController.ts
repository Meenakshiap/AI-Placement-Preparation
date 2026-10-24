import { Response } from 'express';
import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { UserModel, SkillProfileModel, RecommendationModel, AttemptModel } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { SEED_COMPANIES } from '../data/seedCompanies.js';

export const getDashboardOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user: any;
    let profile: any;
    let recommendation: any;
    let attempts: any[] = [];

    if (isMongoActive()) {
      user = await UserModel.findById(userId).select('-passwordHash').lean();
      profile = await SkillProfileModel.findOne({ userId }).lean();
      recommendation = await RecommendationModel.findOne({ userId }).lean();
      attempts = await AttemptModel.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
    } else {
      user = jsonStore.findById('users', userId);
      if (user) {
        user = { ...user };
        delete user.passwordHash;
      }
      profile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
      recommendation = jsonStore.findOne('recommendations', r => r.userId === userId);
      attempts = jsonStore.find('attempts', a => a.userId === userId).slice(-10).reverse();
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const targetCompany = SEED_COMPANIES.find(c => c.name.toLowerCase() === (user.targetCompany || '').toLowerCase()) || SEED_COMPANIES[0];

    res.json({
      success: true,
      dashboard: {
        user,
        targetCompany,
        skillProfile: profile || {
          overallReadinessScore: 0,
          assessmentCompleted: false,
          categories: { aptitude: 0, languages: 0, dsa: 0, coreCs: 0, interview: 0 },
          topicBreakdown: [],
          strongTopics: [],
          weakTopics: [],
          targetCompanyFit: { score: 0, matchLevel: 'Needs Work', missingCompetencies: ['Take Diagnostic Test'], readinessTier: 'Foundational' }
        },
        recommendation: recommendation || {
          dailyMissions: [],
          roadmap: [],
          summaryInsight: 'Complete your initial Diagnostic Skill Assessment to unlock personalized learning plans.'
        },
        recentActivity: attempts
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching dashboard data.' });
  }
};

export const toggleMission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { missionId } = req.params;

    if (!userId || !missionId) {
      res.status(400).json({ success: false, message: 'Invalid request.' });
      return;
    }

    let recommendation: any;

    if (isMongoActive()) {
      recommendation = await RecommendationModel.findOne({ userId });
      if (recommendation) {
        const mission = recommendation.dailyMissions.find((m: any) => m.id === missionId);
        if (mission) {
          mission.isCompleted = !mission.isCompleted;
          await recommendation.save();
        }
      }
    } else {
      recommendation = jsonStore.findOne('recommendations', r => r.userId === userId);
      if (recommendation) {
        const mission = recommendation.dailyMissions.find((m: any) => m.id === missionId);
        if (mission) {
          mission.isCompleted = !mission.isCompleted;
          jsonStore.updateOne('recommendations', r => r.userId === userId, { dailyMissions: recommendation.dailyMissions });
        }
      }
    }

    res.json({
      success: true,
      message: 'Mission status updated.',
      recommendation
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating mission.' });
  }
};
