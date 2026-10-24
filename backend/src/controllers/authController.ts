import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { UserModel, SkillProfileModel, RecommendationModel } from '../models/index.js';
import { IUser, ISkillProfile, IRecommendation } from '../types/index.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_placement_prep_jwt_key_2026';

const generateToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, targetCompany, targetRole, preferredTechStack, experienceLevel, graduationYear } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let createdUser: any;
    let userId: string;

    if (isMongoActive()) {
      const existing = await UserModel.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const userDoc = new UserModel({
        name,
        email: email.toLowerCase(),
        passwordHash,
        targetCompany: targetCompany || 'Google',
        targetRole: targetRole || 'Software Development Engineer (SDE-1)',
        preferredTechStack: preferredTechStack || ['Python', 'JavaScript'],
        experienceLevel: experienceLevel || 'Final Year',
        graduationYear: graduationYear || 2026
      });

      await userDoc.save();
      createdUser = userDoc.toObject();
      userId = createdUser._id.toString();
    } else {
      const existing = jsonStore.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      createdUser = jsonStore.insert('users', {
        name,
        email: email.toLowerCase(),
        passwordHash,
        targetCompany: targetCompany || 'Google',
        targetRole: targetRole || 'Software Development Engineer (SDE-1)',
        preferredTechStack: preferredTechStack || ['Python', 'JavaScript'],
        experienceLevel: experienceLevel || 'Final Year',
        graduationYear: graduationYear || 2026
      });
      userId = createdUser.id;
    }

    // Initialize baseline Skill Profile
    const initialSkillProfile: ISkillProfile = {
      id: 'prof_' + userId,
      userId: userId,
      overallReadinessScore: 0,
      assessmentCompleted: false,
      categories: {
        aptitude: 0,
        languages: 0,
        dsa: 0,
        coreCs: 0,
        interview: 0
      },
      topicBreakdown: [],
      strongTopics: [],
      weakTopics: [],
      targetCompanyFit: {
        score: 0,
        matchLevel: 'Needs Work',
        missingCompetencies: ['Complete Initial Diagnostic Assessment to identify gap areas'],
        readinessTier: 'Foundational'
      },
      lastUpdated: new Date()
    };

    if (isMongoActive()) {
      await SkillProfileModel.create(initialSkillProfile);
    } else {
      jsonStore.insert('skillProfiles', initialSkillProfile);
    }

    const token = generateToken(userId, email);

    const safeUser = { ...createdUser };
    delete safeUser.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: safeUser,
      skillProfile: initialSkillProfile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server registration error.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    let user: any;
    let userId: string;

    if (isMongoActive()) {
      user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }
      userId = user._id.toString();
    } else {
      user = jsonStore.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }
      userId = user.id;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    let profile: any;
    if (isMongoActive()) {
      profile = await SkillProfileModel.findOne({ userId });
    } else {
      profile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
    }

    const token = generateToken(userId, user.email);

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser,
      skillProfile: profile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server login error.' });
  }
};

export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const demoEmail = 'student.candidate@demo.com';
    let user: any;
    let userId: string;

    if (isMongoActive()) {
      user = await UserModel.findOne({ email: demoEmail });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Demo@1234', salt);
        user = await UserModel.create({
          name: 'Rithika Candidate (Demo)',
          email: demoEmail,
          passwordHash,
          targetCompany: 'Google',
          targetRole: 'Software Development Engineer (SDE-1)',
          preferredTechStack: ['Python', 'JavaScript', 'SQL'],
          experienceLevel: 'Final Year',
          graduationYear: 2026,
          college: 'National Institute of Technology'
        });
      }
      userId = user._id.toString();
    } else {
      user = jsonStore.findOne('users', u => u.email === demoEmail);
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Demo@1234', salt);
        user = jsonStore.insert('users', {
          id: 'usr_demo_student_01',
          name: 'Rithika Candidate (Demo)',
          email: demoEmail,
          passwordHash,
          targetCompany: 'Google',
          targetRole: 'Software Development Engineer (SDE-1)',
          preferredTechStack: ['Python', 'JavaScript', 'SQL'],
          experienceLevel: 'Final Year',
          graduationYear: 2026,
          college: 'National Institute of Technology'
        });
      }
      userId = user.id;
    }

    let profile: any;
    if (isMongoActive()) {
      profile = await SkillProfileModel.findOne({ userId });
    } else {
      profile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
    }

    if (!profile) {
      const initialProfile: ISkillProfile = {
        id: 'prof_' + userId,
        userId: userId,
        overallReadinessScore: 0,
        assessmentCompleted: false,
        categories: { aptitude: 0, languages: 0, dsa: 0, coreCs: 0, interview: 0 },
        topicBreakdown: [],
        strongTopics: [],
        weakTopics: [],
        targetCompanyFit: {
          score: 0,
          matchLevel: 'Needs Work',
          missingCompetencies: ['Complete Initial Diagnostic Assessment'],
          readinessTier: 'Foundational'
        },
        lastUpdated: new Date()
      };

      if (isMongoActive()) {
        await SkillProfileModel.create(initialProfile);
      } else {
        jsonStore.insert('skillProfiles', initialProfile);
      }
      profile = initialProfile;
    }

    const token = generateToken(userId, user.email);

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'Demo login active!',
      token,
      user: safeUser,
      skillProfile: profile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Demo login error.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user: any;
    let profile: any;

    if (isMongoActive()) {
      user = await UserModel.findById(userId).select('-passwordHash');
      profile = await SkillProfileModel.findOne({ userId });
    } else {
      user = jsonStore.findById('users', userId);
      if (user) {
        user = { ...user };
        delete user.passwordHash;
      }
      profile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user,
      skillProfile: profile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching user profile.' });
  }
};
