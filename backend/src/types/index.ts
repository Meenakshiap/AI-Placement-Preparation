export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  targetCompany: string;
  targetRole: string;
  preferredTechStack: string[];
  experienceLevel: 'Fresher' | '1-2 Years' | 'Final Year' | 'Pre-final Year';
  graduationYear: number;
  college?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicMastery {
  topic: string;
  category: 'Aptitude' | 'Languages' | 'DSA' | 'CoreCS' | 'SystemDesign' | 'Interview';
  score: number; // 0 - 100
  accuracy: number; // 0 - 100
  attempts: number;
  lastPracticed: Date;
}

export interface ISkillProfile {
  id: string;
  userId: string;
  overallReadinessScore: number; // 0 - 100
  assessmentCompleted: boolean;
  categories: {
    aptitude: number; // 0 - 100
    languages: number; // 0 - 100
    dsa: number; // 0 - 100
    coreCs: number; // 0 - 100
    interview: number; // 0 - 100
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
  lastUpdated: Date;
}

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface ICodeTemplate {
  language: 'python' | 'javascript' | 'java' | 'cpp';
  starterCode: string;
  solution?: string;
}

export interface IQuestion {
  id: string;
  title: string;
  type: 'diagnostic' | 'aptitude' | 'language_quiz' | 'coding' | 'interview_q';
  category: 'Quantitative' | 'Logical' | 'Verbal' | 'Data Interpretation' | 'Python' | 'Java' | 'C++' | 'JavaScript' | 'DSA' | 'CoreCS' | 'SystemDesign' | 'HR';
  subTopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  options?: string[]; // for MCQs
  correctAnswer?: string; // for MCQs
  explanation?: string;
  hints?: string[];
  companiesTagged?: string[];
  codeTemplates?: ICodeTemplate[];
  testCases?: ITestCase[];
}

export type CodeLanguage = 'python' | 'java' | 'cpp' | 'javascript';

export interface IProblemTestCase {
  input: string;
  expectedOutput: string;
}

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
  visibleTestCases: IProblemTestCase[];
  hiddenTestCases: IProblemTestCase[];
}

export interface ICodingAttempt {
  id: string;
  userId: string;
  problemId: string;
  language: CodeLanguage;
  source: string;
  isCorrect: boolean;
  testCasesPassed: number;
  totalTestCases: number;
  executionTimeMs: number;
  feedback: string;
  createdAt: Date;
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
  correctOptionId: string;
  explanation: string;
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
  modules: ITrackModule[];
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
  lastAttemptedAt: Date;
}

export interface ITrackQuizAttempt {
  moduleId: string;
  score: number;
  passed: boolean;
  attemptedAt: Date;
}

export interface ITrackProgress {
  id: string;
  userId: string;
  trackId: CodeLanguage;
  currentModuleId: string;
  completedModuleIds: string[];
  quizAttempts: ITrackQuizAttempt[];
  mistakes: ITrackMistake[];
  startedAt: Date;
  updatedAt: Date;
}

export interface IAttempt {
  id: string;
  userId: string;
  questionId: string;
  module: 'diagnostic' | 'language' | 'coding' | 'aptitude' | 'interview';
  userSubmission: string;
  isCorrect: boolean;
  scoreAwarded: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTimeMs?: number;
  timeSpentSeconds: number;
  feedback?: string;
  createdAt: Date;
}

export interface IActivityLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  category: 'programming' | 'aptitude';
  solvedCount: number;
  attemptedCount: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewExchange {
  questionId: string;
  questionText: string;
  category: string;
  userTranscript: string;
  durationSec: number;
  evaluation: {
    technicalAccuracy: number; // 0 - 100
    clarity: number; // 0 - 100
    communication: number; // 0 - 100
    confidence: number; // 0 - 100
    strengths: string[];
    improvements: string[];
    feedbackSummary: string;
    sampleIdealResponse: string;
  };
  timestamp: Date;
}

export interface IInterviewSession {
  id: string;
  userId: string;
  targetCompany: string;
  targetRole: string;
  sessionType: 'technical' | 'hr' | 'mixed' | 'system_design';
  status: 'in_progress' | 'completed';
  exchanges: IInterviewExchange[];
  overallEvaluation?: {
    overallScore: number;
    technicalRating: number;
    communicationRating: number;
    confidenceRating: number;
    summary: string;
    keyRecommendations: string[];
  };
  createdAt: Date;
  completedAt?: Date;
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
  updatedAt: Date;
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
    type: 'Online Assessment' | 'Technical Round 1' | 'Technical Round 2' | 'Managerial / HR';
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
  frequentlyAskedTopics: string[];
  difficultyLevel: 'Moderate' | 'Hard' | 'Extreme';
}
