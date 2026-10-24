import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { SkillProfileModel, RecommendationModel, CompanyModel, UserModel } from '../models/index.js';
import { ISkillProfile, IRecommendation, IDailyMission, IRoadmapStage, ITopicMastery, IUser } from '../types/index.js';
import { SEED_COMPANIES } from '../data/seedCompanies.js';

export class RecommendationEngine {
  
  public static async evaluateDiagnosticAssessment(
    userId: string,
    answers: { questionId: string; selectedOption: string; timeSpentSeconds?: number }[]
  ): Promise<{ profile: ISkillProfile; recommendation: IRecommendation; scoreSummary: any }> {
    // 1. Fetch user data to understand target company and role
    let user: IUser | null = null;
    if (isMongoActive()) {
      user = await UserModel.findById(userId).lean();
    } else {
      user = jsonStore.findById('users', userId);
    }

    const targetCompanyName = user?.targetCompany || 'Google';
    const targetCompany = SEED_COMPANIES.find(c => c.name.toLowerCase() === targetCompanyName.toLowerCase()) || SEED_COMPANIES[0];

    // 2. Fetch questions to evaluate answers
    let allQuestions = jsonStore.get('questions');
    if (!allQuestions || allQuestions.length === 0) {
      const { SEED_QUESTIONS } = await import('../data/seedQuestions.js');
      allQuestions = SEED_QUESTIONS;
    }

    const categoryStats: Record<string, { correct: number; total: number; topics: Record<string, { correct: number; total: number }> }> = {
      aptitude: { correct: 0, total: 0, topics: {} },
      languages: { correct: 0, total: 0, topics: {} },
      dsa: { correct: 0, total: 0, topics: {} },
      coreCs: { correct: 0, total: 0, topics: {} },
      interview: { correct: 0, total: 0, topics: {} }
    };

    let totalCorrect = 0;
    const evaluatedAnswers: any[] = [];

    answers.forEach(ans => {
      const q = allQuestions.find(item => item.id === ans.questionId);
      if (!q) return;

      const isCorrect = (q.correctAnswer?.trim().toLowerCase() === ans.selectedOption?.trim().toLowerCase());
      if (isCorrect) totalCorrect++;

      evaluatedAnswers.push({
        questionId: q.id,
        title: q.title,
        category: q.category,
        subTopic: q.subTopic,
        selectedOption: ans.selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      });

      // Map to category buckets
      let catKey = 'aptitude';
      if (['Quantitative', 'Logical', 'Verbal', 'Data Interpretation'].includes(q.category)) {
        catKey = 'aptitude';
      } else if (['Python', 'Java', 'C++', 'JavaScript'].includes(q.category)) {
        catKey = 'languages';
      } else if (q.category === 'DSA') {
        catKey = 'dsa';
      } else if (q.category === 'CoreCS') {
        catKey = 'coreCs';
      } else if (['SystemDesign', 'HR'].includes(q.category)) {
        catKey = 'interview';
      }

      categoryStats[catKey].total += 1;
      if (isCorrect) categoryStats[catKey].correct += 1;

      if (!categoryStats[catKey].topics[q.subTopic]) {
        categoryStats[catKey].topics[q.subTopic] = { correct: 0, total: 0 };
      }
      categoryStats[catKey].topics[q.subTopic].total += 1;
      if (isCorrect) categoryStats[catKey].topics[q.subTopic].correct += 1;
    });

    // Compute category percentages
    const calcCatScore = (key: string) => {
      const stat = categoryStats[key];
      return stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 50;
    };

    const categories = {
      aptitude: calcCatScore('aptitude'),
      languages: calcCatScore('languages'),
      dsa: calcCatScore('dsa'),
      coreCs: calcCatScore('coreCs'),
      interview: calcCatScore('interview')
    };

    // Calculate Overall Readiness weighted by Target Company profile
    const w = targetCompany.skillWeightage;
    const weightedScore = Math.round(
      (categories.aptitude * (w.aptitude / 100)) +
      (categories.dsa * (w.dsa / 100)) +
      (categories.languages * (w.languages / 100)) +
      (categories.coreCs * (w.coreCs / 100)) +
      (categories.interview * (w.interview / 100))
    );

    // Build Topic Breakdown & identify Strengths / Weaknesses
    const topicBreakdown: ITopicMastery[] = [];
    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    Object.entries(categoryStats).forEach(([catKey, data]) => {
      const mappedCategoryName = catKey === 'coreCs' ? 'CoreCS' : catKey.charAt(0).toUpperCase() + catKey.slice(1) as any;
      Object.entries(data.topics).forEach(([topicName, tStat]) => {
        const accuracy = Math.round((tStat.correct / tStat.total) * 100);
        topicBreakdown.push({
          topic: topicName,
          category: mappedCategoryName,
          score: accuracy,
          accuracy: accuracy,
          attempts: tStat.total,
          lastPracticed: new Date()
        });

        if (accuracy >= 70) {
          strongTopics.push(topicName);
        } else {
          weakTopics.push(topicName);
        }
      });
    });

    // Determine missing competencies for target company
    const missingCompetencies: string[] = [];
    if (categories.dsa < 65 && w.dsa >= 30) missingCompetencies.push('Advanced Data Structures & Graph Algorithms');
    if (categories.aptitude < 65 && w.aptitude >= 30) missingCompetencies.push('Speed Aptitude & Quantitative Shortcuts');
    if (categories.languages < 60) missingCompetencies.push('Language Memory Model & Concurrency');
    if (categories.coreCs < 60) missingCompetencies.push('OS Concurrency & DBMS Normalization');
    if (categories.interview < 60) missingCompetencies.push('System Design Trade-offs & Communication');

    const companyFitScore = Math.max(25, Math.min(98, Math.round(weightedScore * 0.95 + (strongTopics.length * 2))));
    const matchLevel = companyFitScore >= 75 ? 'High' : companyFitScore >= 50 ? 'Moderate' : 'Needs Work';
    const readinessTier = companyFitScore >= 75 ? 'Tier 1 Ready' : companyFitScore >= 50 ? 'Tier 2 Ready' : 'Foundational';

    const skillProfile: ISkillProfile = {
      id: 'prof_' + userId,
      userId: userId,
      overallReadinessScore: weightedScore,
      assessmentCompleted: true,
      categories,
      topicBreakdown,
      strongTopics,
      weakTopics,
      targetCompanyFit: {
        score: companyFitScore,
        matchLevel,
        missingCompetencies,
        readinessTier
      },
      lastUpdated: new Date()
    };

    // Generate Adaptive Daily Missions & 4-Week Roadmap
    const dailyMissions = this.generateDailyMissions(skillProfile, targetCompany);
    const roadmap = this.generateRoadmap(skillProfile, targetCompany);

    const recommendation: IRecommendation = {
      id: 'rec_' + userId,
      userId: userId,
      dailyMissions,
      roadmap,
      summaryInsight: `Based on your diagnostic benchmark for ${targetCompany.name}, your highest potential score gain lies in mastering ${weakTopics.length > 0 ? weakTopics.slice(0, 2).join(' & ') : 'Advanced Problem Solving'}. Follow your personalized daily missions to boost readiness.`,
      updatedAt: new Date()
    };

    // Save to database / jsonStore
    if (isMongoActive()) {
      await SkillProfileModel.findOneAndUpdate({ userId }, skillProfile, { upsert: true, new: true });
      await RecommendationModel.findOneAndUpdate({ userId }, recommendation, { upsert: true, new: true });
    } else {
      const existingProfile = jsonStore.findOne('skillProfiles', p => p.userId === userId);
      if (existingProfile) {
        jsonStore.updateOne('skillProfiles', p => p.userId === userId, skillProfile);
      } else {
        jsonStore.insert('skillProfiles', skillProfile);
      }

      const existingRec = jsonStore.findOne('recommendations', r => r.userId === userId);
      if (existingRec) {
        jsonStore.updateOne('recommendations', r => r.userId === userId, recommendation);
      } else {
        jsonStore.insert('recommendations', recommendation);
      }
    }

    return {
      profile: skillProfile,
      recommendation,
      scoreSummary: {
        totalQuestions: answers.length,
        totalCorrect,
        percentageScore: Math.round((totalCorrect / Math.max(answers.length, 1)) * 100),
        weightedScore,
        evaluatedAnswers
      }
    };
  }

  public static generateDailyMissions(profile: ISkillProfile, company: any): IDailyMission[] {
    const missions: IDailyMission[] = [];

    // Priority 1: Address highest weighted weakness
    if (profile.categories.dsa < 70) {
      missions.push({
        id: 'mission_dsa_1',
        title: 'Master Two-Pointer & Sliding Window Techniques',
        module: 'coding',
        priority: 'High',
        reason: `Frequently tested in ${company.name} Technical Round 1. Current DSA rating is ${profile.categories.dsa}%.`,
        estimatedMinutes: 25,
        actionUrl: '/coding?topic=TwoPointers',
        isCompleted: false,
        topic: 'Arrays & Two Pointers'
      });
    }

    // Priority 2: Aptitude Drill or Language Lesson
    if (profile.categories.aptitude < 70) {
      missions.push({
        id: 'mission_apt_1',
        title: 'Complete 10 Timed Quantitative & Speed Drills',
        module: 'aptitude',
        priority: 'High',
        reason: `Crucial for clearing the ${company.name} Online Assessment cutoff.`,
        estimatedMinutes: 15,
        actionUrl: '/aptitude?type=speed_drill',
        isCompleted: false,
        topic: 'Time & Work, Speed Math'
      });
    } else {
      missions.push({
        id: 'mission_lang_1',
        title: 'Deep Dive: Memory Models & Async Event Loop',
        module: 'language',
        priority: 'Medium',
        reason: 'Sharpen core language mechanics to ace coding dry-runs.',
        estimatedMinutes: 20,
        actionUrl: '/learn?track=javascript',
        isCompleted: false,
        topic: 'Event Loop & Promises'
      });
    }

    // Priority 3: Mock Interview or Company Syllabus Drill
    missions.push({
      id: 'mission_ai_int',
      title: `Take a 5-Minute AI Technical Mock for ${company.name}`,
      module: 'interview',
      priority: 'Medium',
      reason: 'Improve live communication clarity and technical structuring.',
      estimatedMinutes: 10,
      actionUrl: '/interview?type=technical',
      isCompleted: false,
      topic: 'Live Technical Communication'
    });

    missions.push({
      id: 'mission_comp_prep',
      title: `Review ${company.name} Round 1 Syllabus & Patterns`,
      module: 'company',
      priority: 'Low',
      reason: `Understand the exact evaluation rubrics used by ${company.name} interviewers.`,
      estimatedMinutes: 10,
      actionUrl: `/company-prep?company=${company.name.toLowerCase()}`,
      isCompleted: false,
      topic: 'Hiring Round Intelligence'
    });

    return missions;
  }

  public static generateRoadmap(profile: ISkillProfile, company: any): IRoadmapStage[] {
    return [
      {
        weekNumber: 1,
        title: 'Foundational Diagnostics & Core Mastery',
        focusArea: 'Aptitude Speed & Programming Language Deep Dive',
        status: 'in_progress',
        milestones: [
          { title: 'Take diagnostic baseline assessment', completed: true },
          { title: 'Revise language scoping, pointers & OOP mechanics', completed: false },
          { title: 'Solve 20 Quantitative & Logical questions', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: 'Algorithmic Problem Solving & Data Structures',
        focusArea: 'Arrays, HashMaps, Two Pointers & Recursion',
        status: 'upcoming',
        milestones: [
          { title: 'Solve 15 LeetCode-style medium DSA challenges', completed: false },
          { title: 'Master Sliding Window and Binary Search variants', completed: false },
          { title: 'Take 1 Full-Length Timed Coding Assessment', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: `${company.name} Company-Specific Blueprint Drill`,
        focusArea: `${company.name} Past Year OA Patterns & Core CS`,
        status: 'upcoming',
        milestones: [
          { title: `Complete ${company.name} Online Assessment Mock`, completed: false },
          { title: 'Revise OS Concurrency, Deadlocks & DBMS Indexing', completed: false },
          { title: 'Solve top 10 frequently asked company questions', completed: false }
        ]
      },
      {
        weekNumber: 4,
        title: 'AI Face-to-Face Interview & Final Placement Readiness',
        focusArea: 'Live Technical & HR Mock Interviews with AI Scoring',
        status: 'upcoming',
        milestones: [
          { title: 'Complete 3 AI Face-to-Face Technical Mock Sessions', completed: false },
          { title: 'Practice STAR method for HR / Behavioral questions', completed: false },
          { title: 'Achieve 80%+ Placement Readiness Score on Dashboard', completed: false }
        ]
      }
    ];
  }
}
