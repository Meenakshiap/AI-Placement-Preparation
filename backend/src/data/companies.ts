import { ICompanyBlueprint } from '../types/index.js';
import { SEED_COMPANIES } from './seedCompanies.js';

export interface ICompanyBlueprintDetails extends ICompanyBlueprint {
  sde1SkillWeightage: ICompanyBlueprint['skillWeightage'];
  samplePastQuestions: { topic: string; question: string }[];
  cutoffBenchmark: { assessment: string; benchmark: string; notes: string };
}

const companyDetails: Record<string, Pick<ICompanyBlueprintDetails, 'samplePastQuestions' | 'cutoffBenchmark'>> = {
  comp_google: {
    samplePastQuestions: [
      { topic: 'Graphs', question: 'Given a word dictionary, find the shortest transformation sequence between two words.' },
      { topic: 'Trees', question: 'Serialize and deserialize a binary tree while preserving its structure.' },
      { topic: 'Dynamic Programming', question: 'Find the minimum number of coins needed to make a target amount.' }
    ],
    cutoffBenchmark: { assessment: 'SDE-1 online assessment', benchmark: 'Solve 2 of 2 coding problems', notes: 'Reference preparation target; actual screening thresholds vary by role and hiring cycle.' }
  },
  comp_amazon: {
    samplePastQuestions: [
      { topic: 'Arrays', question: 'Find the largest contiguous subarray whose sum equals a target.' },
      { topic: 'Trees', question: 'Return the top view of a binary tree.' },
      { topic: 'Design', question: 'Design an LRU cache with constant-time get and put operations.' }
    ],
    cutoffBenchmark: { assessment: 'SDE-1 online assessment', benchmark: 'Pass all hidden tests on both coding problems', notes: 'Also prepare for work-style and Leadership Principles assessments; thresholds vary.' }
  },
  comp_microsoft: {
    samplePastQuestions: [
      { topic: 'Linked Lists', question: 'Reverse a linked list in groups of k nodes.' },
      { topic: 'Strings', question: 'Find the minimum window in a string containing every character of a target.' },
      { topic: 'Trees', question: 'Find the lowest common ancestor of two nodes in a binary tree.' }
    ],
    cutoffBenchmark: { assessment: 'SDE-1 online assessment', benchmark: 'Complete 2 of 3 coding problems with strong test coverage', notes: 'Interview progression depends on role, location, and candidate pool.' }
  },
  comp_tcs: {
    samplePastQuestions: [
      { topic: 'Numerical Ability', question: 'A train crosses a platform in a given time; calculate its speed from the supplied lengths.' },
      { topic: 'Strings', question: 'Check whether a string is a palindrome after removing non-alphanumeric characters.' },
      { topic: 'SQL', question: 'Write a query to find the second-highest salary in each department.' }
    ],
    cutoffBenchmark: { assessment: 'TCS NQT (cognitive and coding)', benchmark: 'Aim for 70%+ accuracy in each section and solve both coding tasks', notes: 'Sectional requirements and role-specific cutoffs may change each hiring cycle.' }
  },
  comp_infosys: {
    samplePastQuestions: [
      { topic: 'Arrays', question: 'Find the longest consecutive sequence in an unsorted integer array.' },
      { topic: 'Dynamic Programming', question: 'Count the number of ways to reach the top of a staircase with one- or two-step moves.' },
      { topic: 'Pseudocode', question: 'Trace nested loops and recursion to determine the final output and time complexity.' }
    ],
    cutoffBenchmark: { assessment: 'Infosys campus assessment', benchmark: 'Target 70%+ across aptitude and reasoning, plus at least 2 coding solutions for SP/DSE', notes: 'Selection bars differ between Systems Engineer, DSE, and Specialist Programmer tracks.' }
  },
  comp_goldman: {
    samplePastQuestions: [
      { topic: 'Graphs', question: 'Find the minimum number of swaps needed to group values meeting a condition.' },
      { topic: 'Dynamic Programming', question: 'Maximize profit from stock trades with a transaction fee and cooldown.' },
      { topic: 'Probability', question: 'Compute the expected number of draws required to obtain a specified outcome.' }
    ],
    cutoffBenchmark: { assessment: 'Engineering analyst coding assessment', benchmark: 'Solve both coding problems and target 75%+ accuracy on quantitative questions', notes: 'Assessment format and selection thresholds vary by campus and role.' }
  }
};

export const COMPANY_BLUEPRINTS: ICompanyBlueprintDetails[] = SEED_COMPANIES.map(company => ({
  ...company,
  targetRoles: company.targetRoles.some(role => role.toLowerCase().includes('sde-1'))
    ? company.targetRoles
    : ['Software Development Engineer (SDE-1)', ...company.targetRoles],
  sde1SkillWeightage: { ...company.skillWeightage },
  ...companyDetails[company.id]
}));