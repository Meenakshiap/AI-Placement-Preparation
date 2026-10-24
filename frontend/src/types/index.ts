export interface IUser {
  id: string;
  name: string;
  email: string;
  targetCompany: string;
  targetRole: string;
  preferredTechStack: string[];
  experienceLevel: 'Fresher' | '1-2 Years' | 'Final Year' | 'Pre-final Year';
  graduationYear: number;
  college?: string;
  avatar?: string;
}

export interface ITopicMastery {
  topic: string;
  category: 'Aptitude' | 'Languages' | 'DSA' | 'CoreCS' | 'SystemDesign' | 'Interview';
  score: number;
  accuracy: number;
  attempts: number;
  lastPracticed: string;
}

export interface ISkillProfile {
  id: string;
  userId: string;
  overallReadinessScore: number;
  assessmentCompleted: boolean;
  categories: {
    aptitude: number;
    languages: number;
    dsa: number;
    coreCs: number;
    interview: number;
  };
  topicBreakdown: ITopicMastery[];
  strongTopics: string[];
  weakTopics: string[];
  targetCompanyFit: {
    score: number;
    matchLevel: 'High' | 'Moderate' | 'Needs Work';
    missingCompetencies: string[];
    readinessTier: 'Tier 1 Ready' | 'Tier 2 Ready' | 'Foundational';
  };
  lastUpdated: string;
}

export interface IQuestion {
  id: string;
  title: string;
  type: string;
  category: string;
  subTopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  options?: string[];
  hints?: string[];
  companiesTagged?: string[];
}

export type CodeLanguage = 'python' | 'java' | 'cpp' | 'javascript';

export interface IProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  companies: string[];
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  hints: string[];
  starterCode: Record<CodeLanguage, string>;
  visibleTestCases: { input: string; expectedOutput: string }[];
  isSolved?: boolean;
}

export interface ITrackQuizOption {
  id: string;
  text: string;
}

export interface ITrackQuizQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: ITrackQuizOption[];
}

export interface ITrackModule {
  id: string;
  number: number;
  title: string;
  topic: string;
  comingSoon: boolean;
  concept?: string;
  examples?: { title: string; code: string; explanation: string }[];
  commonMistakes?: string[];
  playground?: { starterCode: string; input: string; expectedOutput: string };
  quiz?: ITrackQuizQuestion[];
}

export interface ILanguageTrack {
  id: CodeLanguage;
  name: string;
  level: string;
  language: CodeLanguage;
  totalModules: number;
  topics: string[];
  modules?: ITrackModule[];
  started?: boolean;
  completedCount?: number;
}

export interface ITrackMistake {
  moduleId: string;
  questionId: string;
  topic: string;
  prompt: string;
  selectedOption: string;
  correctAnswer: string;
  explanation: string;
  attempts: number;
  lastAttemptedAt: string;
}

export interface ITrackProgress {
  trackId: CodeLanguage;
  started: boolean;
  currentModuleId: string;
  completedModuleIds: string[];
  quizAttempts: { moduleId: string; score: number; passed: boolean; attemptedAt: string }[];
  mistakes: ITrackMistake[];
}

export interface IDailyMission {
  id: string;
  title: string;
  module: 'diagnostic' | 'language' | 'coding' | 'aptitude' | 'interview' | 'company';
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  estimatedMinutes: number;
  actionUrl: string;
  isCompleted: boolean;
  topic: string;
}

export interface IRoadmapStage {
  weekNumber: number;
  title: string;
  focusArea: string;
  milestones: { title: string; completed: boolean }[];
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface IRecommendation {
  id: string;
  userId: string;
  dailyMissions: IDailyMission[];
  roadmap: IRoadmapStage[];
  summaryInsight: string;
  updatedAt: string;
}

export interface ICompanyBlueprint {
  id: string;
  name: string;
  logo?: string;
  tier: 'Dream' | 'Super Dream' | 'Service/Mass' | 'Core Tech';
  description: string;
  targetRoles: string[];
  hiringRounds: {
    roundNumber: number;
    name: string;
    type: string;
    description: string;
    keyTopics: string[];
    tips: string[];
  }[];
  skillWeightage: {
    aptitude: number;
    dsa: number;
    languages: number;
    coreCs: number;
    interview: number;
  };
  sde1SkillWeightage?: {
    aptitude: number;
    dsa: number;
    languages: number;
    coreCs: number;
    interview: number;
  };
  frequentlyAskedTopics: string[];
  samplePastQuestions?: { topic: string; question: string }[];
  cutoffBenchmark?: { assessment: string; benchmark: string; notes: string };
  difficultyLevel: 'Moderate' | 'Hard' | 'Extreme';
}

export interface IDashboardData {
  user: IUser;
  targetCompany: ICompanyBlueprint;
  skillProfile: ISkillProfile;
  recommendation: IRecommendation;
  recentActivity: any[];
}
