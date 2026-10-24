import { Response } from 'express';
import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { UserModel, SkillProfileModel, CompanyModel, AttemptModel, ActivityLogModel } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { SEED_COMPANIES } from '../data/seedCompanies.js';
import { SEED_QUESTIONS } from '../data/seedQuestions.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user: any;
    let profile: any;
    let attempts: any[] = [];

    if (isMongoActive()) {
      user = await UserModel.findById(userId).select('-passwordHash');
      profile = await SkillProfileModel.findOne({ userId });
      attempts = await AttemptModel.find({ userId }).sort({ createdAt: -1 }).lean();
    } else {
      user = jsonStore.findById('users', userId);
      if (user) {
        user = { ...user };
        delete user.passwordHash;
      }
      profile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
      attempts = jsonStore.find('attempts', attempt => attempt.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const enrichedAttempts = attempts.map(attempt => {
      const question = SEED_QUESTIONS.find(item =>
        item.id === attempt.questionId || String(item.id) === String(attempt.questionId)
      );
      return {
        ...attempt,
        category: question?.category,
        difficulty: question?.difficulty
      };
    });

    res.json({
      success: true,
      user,
      skillProfile: profile,
      attempts: enrichedAttempts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error loading profile.' });
  }
};

export const getActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const category = req.query.category;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (category !== 'programming' && category !== 'aptitude') {
      res.status(400).json({ success: false, message: 'Category must be programming or aptitude.' });
      return;
    }

    const endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 83);
    const startDateString = startDate.toISOString().slice(0, 10);
    const endDateString = endDate.toISOString().slice(0, 10);

    let records: any[];
    if (isMongoActive()) {
      records = await ActivityLogModel.find({
        userId,
        category,
        date: { $gte: startDateString, $lte: endDateString }
      }).sort({ date: 1 }).lean();
    } else {
      records = jsonStore.find(
        'activityLogs',
        activity =>
          activity.userId === userId &&
          activity.category === category &&
          activity.date >= startDateString &&
          activity.date <= endDateString
      ).sort((a, b) => a.date.localeCompare(b.date));
    }

    const recordByDate = new Map(records.map(record => [record.date, record]));
    const activity = Array.from({ length: 84 }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + index);
      const dateString = date.toISOString().slice(0, 10);
      const record = recordByDate.get(dateString);

      return {
        date: dateString,
        solvedCount: record?.solvedCount || 0,
        attemptedCount: record?.attemptedCount || 0,
        difficulty: record?.difficulty || { easy: 0, medium: 0, hard: 0 }
      };
    });

    res.json({
      success: true,
      category,
      startDate: startDateString,
      endDate: endDateString,
      activity
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error loading activity.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, targetCompany, targetRole, preferredTechStack, experienceLevel, graduationYear, college } = req.body;

    let updatedUser: any;
    const updatePayload: any = {};
    if (name) updatePayload.name = name;
    if (targetCompany) updatePayload.targetCompany = targetCompany;
    if (targetRole) updatePayload.targetRole = targetRole;
    if (preferredTechStack) updatePayload.preferredTechStack = preferredTechStack;
    if (experienceLevel) updatePayload.experienceLevel = experienceLevel;
    if (graduationYear) updatePayload.graduationYear = graduationYear;
    if (college) updatePayload.college = college;

    if (isMongoActive()) {
      updatedUser = await UserModel.findByIdAndUpdate(userId, updatePayload, { new: true }).select('-passwordHash');
    } else {
      updatedUser = jsonStore.update('users', userId, updatePayload);
      if (updatedUser) {
        updatedUser = { ...updatedUser };
        delete updatedUser.passwordHash;
      }
    }

    // If target company was updated, recalculate company fit & recommendations
    const company = SEED_COMPANIES.find(c => c.name.toLowerCase() === (targetCompany || updatedUser.targetCompany || '').toLowerCase()) || SEED_COMPANIES[0];
    
    let profile: any;
    if (isMongoActive()) {
      profile = await SkillProfileModel.findOne({ userId });
    } else {
      profile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
    }

    if (profile && profile.assessmentCompleted) {
      const w = company.skillWeightage;
      const weightedScore = Math.round(
        (profile.categories.aptitude * (w.aptitude / 100)) +
        (profile.categories.dsa * (w.dsa / 100)) +
        (profile.categories.languages * (w.languages / 100)) +
        (profile.categories.coreCs * (w.coreCs / 100)) +
        (profile.categories.interview * (w.interview / 100))
      );

      const companyFitScore = Math.max(25, Math.min(98, Math.round(weightedScore * 0.95 + (profile.strongTopics.length * 2))));
      const matchLevel = companyFitScore >= 75 ? 'High' : companyFitScore >= 50 ? 'Moderate' : 'Needs Work';
      const readinessTier = companyFitScore >= 75 ? 'Tier 1 Ready' : companyFitScore >= 50 ? 'Tier 2 Ready' : 'Foundational';

      const missingCompetencies: string[] = [];
      if (profile.categories.dsa < 65 && w.dsa >= 30) missingCompetencies.push('Advanced Data Structures & Graph Algorithms');
      if (profile.categories.aptitude < 65 && w.aptitude >= 30) missingCompetencies.push('Speed Aptitude & Quantitative Shortcuts');
      if (profile.categories.languages < 60) missingCompetencies.push('Language Memory Model & Concurrency');
      if (profile.categories.coreCs < 60) missingCompetencies.push('OS Concurrency & DBMS Normalization');
      if (profile.categories.interview < 60) missingCompetencies.push('System Design Trade-offs & Communication');

      const profileUpdates = {
        overallReadinessScore: weightedScore,
        targetCompanyFit: {
          score: companyFitScore,
          matchLevel,
          missingCompetencies,
          readinessTier
        },
        lastUpdated: new Date()
      };

      if (isMongoActive()) {
        profile = await SkillProfileModel.findOneAndUpdate({ userId }, profileUpdates, { new: true });
      } else {
        profile = jsonStore.updateOne('skillProfiles', p => p.userId === userId, profileUpdates);
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
      skillProfile: profile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating profile.' });
  }
};

export const getCompanies = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let companies: any[] = [];
    if (isMongoActive()) {
      companies = await CompanyModel.find().lean();
    } else {
      companies = jsonStore.get('companies');
    }

    if (!companies || companies.length === 0) {
      companies = SEED_COMPANIES;
    }

    res.json({
      success: true,
      companies
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error loading companies.' });
  }
};
