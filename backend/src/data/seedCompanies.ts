import { ICompanyBlueprint } from '../types/index.js';

export const SEED_COMPANIES: ICompanyBlueprint[] = [
  {
    id: 'comp_google',
    name: 'Google',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
    tier: 'Super Dream',
    description: 'Global tech giant famous for search, cloud, AI, and large-scale distributed systems. Interviews emphasize data structures, algorithmic optimization, and clean architectural design.',
    targetRoles: ['Software Engineer (L3)', 'Associate Product Manager', 'Data Scientist'],
    hiringRounds: [
      {
        roundNumber: 1,
        name: 'Online Coding Assessment',
        type: 'Online Assessment',
        description: '2-3 algorithmic problems (Graph, DP, Sliding Window, Trees) on a timed platform (90 mins).',
        keyTopics: ['Dynamic Programming', 'Graph BFS/DFS', 'Trie / Segment Trees', 'Greedy Algorithms'],
        tips: ['Focus on edge cases and optimal O(N) or O(N log N) time complexity.', 'Write modular, clean variable names.']
      },
      {
        roundNumber: 2,
        name: 'Technical Interview I (DSA & Coding)',
        type: 'Technical Round 1',
        description: '45-minute live coding session on Google Docs or shared editor solving complex algorithmic challenges.',
        keyTopics: ['Trees & Graphs', 'Recursion & Backtracking', 'Time/Space Complexity Proofs'],
        tips: ['Think out loud continuously. Clarify assumptions before writing code.']
      },
      {
        roundNumber: 3,
        name: 'Technical Interview II (Advanced DSA / System Design)',
        type: 'Technical Round 2',
        description: 'Deep dive into data architecture, scalability, cache management, or complex problem solving.',
        keyTopics: ['Concurrency', 'Hash Maps / LRU Cache', 'System Trade-offs'],
        tips: ['Discuss trade-offs between space and time. Show willingness to iterate.']
      },
      {
        roundNumber: 4,
        name: 'Googliness & Leadership (HR)',
        type: 'Managerial / HR',
        description: 'Assesses cultural fit, navigating ambiguity, collaborative teamwork, and ethical decision making.',
        keyTopics: ['STAR Method', 'Handling Conflict', 'Initiative & Passion'],
        tips: ['Use the STAR framework (Situation, Task, Action, Result) with quantified impacts.']
      }
    ],
    skillWeightage: {
      aptitude: 10,
      dsa: 50,
      languages: 15,
      coreCs: 15,
      interview: 10
    },
    frequentlyAskedTopics: ['Dynamic Programming', 'Binary Trees', 'Graphs', 'Trie', 'Sliding Window', 'Two Pointers'],
    difficultyLevel: 'Extreme'
  },
  {
    id: 'comp_amazon',
    name: 'Amazon',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
    tier: 'Super Dream',
    description: 'Leader in e-commerce, cloud infrastructure (AWS), and streaming. Interviews rigorously test Amazon Leadership Principles alongside DSA.',
    targetRoles: ['Software Development Engineer (SDE-1)', 'Cloud Support Engineer', 'Data Engineer'],
    hiringRounds: [
      {
        roundNumber: 1,
        name: 'Online Assessment (OA1 & OA2)',
        type: 'Online Assessment',
        description: '2 Coding questions + Work Style Assessment (Leadership Principles behavioral quiz).',
        keyTopics: ['Arrays', 'Strings', 'Hash Tables', 'Leadership Principles'],
        tips: ['Make sure all public & hidden test cases pass.', 'Align answers strictly with LP values (Customer Obsession, Ownership).']
      },
      {
        roundNumber: 2,
        name: 'Technical Interview 1',
        type: 'Technical Round 1',
        description: 'Core DSA coding problem with follow-up scaling questions + 2 LP behavioral questions.',
        keyTopics: ['Priority Queue / Heaps', 'Trees & BST', 'Customer Obsession'],
        tips: ['Prepare 2 distinct real-life stories per leadership principle.']
      },
      {
        roundNumber: 3,
        name: 'Technical Interview 2 & Bar Raiser',
        type: 'Technical Round 2',
        description: 'In-depth problem solving, Object-Oriented Design (LLD), and Bar Raiser standard evaluation.',
        keyTopics: ['OOP Design Patterns', 'Stack/Queue', 'Deliver Results', 'Bias for Action'],
        tips: ['Show robust OOP principles (SOLID, encapsulation, clean interfaces).']
      }
    ],
    skillWeightage: {
      aptitude: 15,
      dsa: 40,
      languages: 15,
      coreCs: 15,
      interview: 15
    },
    frequentlyAskedTopics: ['Topological Sort', 'LRU Cache', 'Priority Queue', 'OOP Design', 'Trees', 'Strings'],
    difficultyLevel: 'Hard'
  },
  {
    id: 'comp_microsoft',
    name: 'Microsoft',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg',
    tier: 'Super Dream',
    description: 'Pioneer in enterprise cloud (Azure), operating systems, and developer tooling. Focuses on strong CS fundamentals, OS, OOP, and algorithms.',
    targetRoles: ['Software Engineer', 'Support Engineer', 'Security Engineer'],
    hiringRounds: [
      {
        roundNumber: 1,
        name: 'Online Assessment',
        type: 'Online Assessment',
        description: '3 coding questions on Codility or Mettle measuring problem solving and speed.',
        keyTopics: ['Arrays & Matrices', 'String Manipulation', 'Bit Manipulation'],
        tips: ['Practice writing bug-free code quickly. Edge cases like empty inputs matter.']
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (DSA & Core CS)',
        type: 'Technical Round 1',
        description: 'Linked Lists, Binary Trees, Operating System internals, and Memory Management.',
        keyTopics: ['Pointers & Linked Lists', 'Deadlocks & Multithreading', 'Memory Allocations'],
        tips: ['Explain OS concepts clearly (Paging, Virtual Memory, Process vs Thread).']
      },
      {
        roundNumber: 3,
        name: 'Technical Round 2 & Cultural Fit',
        type: 'Technical Round 2',
        description: 'Advanced algorithms, project architecture discussion, and growth mindset assessment.',
        keyTopics: ['System Design Basics', 'Project Deep Dive', 'Growth Mindset'],
        tips: ['Be ready to defend architectural choices made in your college/personal projects.']
      }
    ],
    skillWeightage: {
      aptitude: 15,
      dsa: 35,
      languages: 20,
      coreCs: 20,
      interview: 10
    },
    frequentlyAskedTopics: ['Linked Lists', 'Binary Search', 'Trees', 'OS Multithreading', 'Bitwise Tricks', 'DBMS Indexing'],
    difficultyLevel: 'Hard'
  },
  {
    id: 'comp_tcs',
    name: 'TCS (Tata Consultancy Services)',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    tier: 'Service/Mass',
    description: 'Premier global IT services and consulting enterprise. Evaluates through the National Qualifier Test (TCS NQT) for Ninja and Digital/Prime roles.',
    targetRoles: ['TCS Digital / Prime Developer', 'TCS Ninja Engineer', 'Systems Engineer'],
    hiringRounds: [
      {
        roundNumber: 1,
        name: 'TCS NQT (Cognitive & Coding Assessment)',
        type: 'Online Assessment',
        description: 'Section 1: Numerical Ability, Reasoning Ability, Verbal Ability (80 mins). Section 2: Advanced Coding (2 problems, 60 mins).',
        keyTopics: ['Profit & Loss, Time & Work', 'Syllogisms & Series', 'Basic-to-Medium Coding in C++/Java/Python'],
        tips: ['Accuracy in the Cognitive section is mandatory to unlock Digital/Prime cutoffs.']
      },
      {
        roundNumber: 2,
        name: 'TR + MR + HR (Technical & Managerial)',
        type: 'Technical Round 1',
        description: 'Combined interview covering Programming basics, OOPs, SQL queries, resume projects, and relocation flexibility.',
        keyTopics: ['SQL Joins & Normalization', 'OOPs Concepts', 'Basic C/Java Questions', 'Willingness to Relocate'],
        tips: ['Revise standard SQL queries (e.g., 2nd highest salary, grouping) and core OOP principles.']
      }
    ],
    skillWeightage: {
      aptitude: 40,
      dsa: 20,
      languages: 20,
      coreCs: 15,
      interview: 5
    },
    frequentlyAskedTopics: ['Numbers & Divisibility', 'Percentages & Ratios', 'SQL Queries', 'OOPs in Java/C++', 'String Palindromes', 'Matrix Traversal'],
    difficultyLevel: 'Moderate'
  },
  {
    id: 'comp_infosys',
    name: 'Infosys',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    tier: 'Service/Mass',
    description: 'Global leader in digital services and consulting. Hiring tracks include Systems Engineer, Specialist Programmer (SP), and Digital Specialist Engineer (DSE).',
    targetRoles: ['Specialist Programmer (SP)', 'Digital Specialist Engineer (DSE)', 'Systems Engineer (SE)'],
    hiringRounds: [
      {
        roundNumber: 1,
        name: 'InfyTQ / HackWithInfy / Campus Assessment',
        type: 'Online Assessment',
        description: 'High-speed Aptitude (Mathematical, Logical, Verbal, Pseudocoding) + 3 DSA coding questions for SP/DSE tracks.',
        keyTopics: ['Pseudocode Tracing', 'Combinatorics', 'Greedy & DP Algorithms'],
        tips: ['Practice tracing nested loops and recursion pseudocodes under tight time limits.']
      },
      {
        roundNumber: 2,
        name: 'Technical & HR Interview',
        type: 'Technical Round 1',
        description: 'Questions on final-year project, database design, web stack, data structures, and interpersonal skills.',
        keyTopics: ['Database Normalization', 'REST API basics', 'Project Architecture', 'Communication'],
        tips: ['Highlight hands-on coding experience and practical project problem-solving.']
      }
    ],
    skillWeightage: {
      aptitude: 35,
      dsa: 25,
      languages: 20,
      coreCs: 15,
      interview: 5
    },
    frequentlyAskedTopics: ['Mathematical Ability', 'Pseudocode Dry Run', 'Dynamic Programming', 'SQL Joins', 'Java Collections', 'Data Structures'],
    difficultyLevel: 'Moderate'
  },
  {
    id: 'comp_goldman',
    name: 'Goldman Sachs',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    tier: 'Super Dream',
    description: 'Leading global financial institution. Known for rigorous math, high-level quantitative aptitude, core CS, and complex algorithmic coding tests.',
    targetRoles: ['Engineering Analyst (Summer/Full-time)', 'Quantitative Strategist'],
    hiringRounds: [
      {
        roundNumber: 1,
        name: 'Aptitude & Coding Assessment (HackerRank)',
        type: 'Online Assessment',
        description: 'Numerical Computation, Logical Reasoning, Advanced Mathematics/Probability, CS Core (OS/DBMS), and 2 Hard Coding questions.',
        keyTopics: ['Probability & Permutations', 'Trees & Heaps', 'Dynamic Programming', 'OS & DBMS MCQs'],
        tips: ['Focus heavily on probability, expected value problems, and optimal graph/tree algorithms.']
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 & 2',
        type: 'Technical Round 1',
        description: 'Problem-solving on whiteboards, time complexity analysis, low-level data structures, and math puzzles.',
        keyTopics: ['Mathematical Puzzles', 'Custom Data Structures', 'Concurrency & Locks'],
        tips: ['Be prepared for classical math/logic puzzles (e.g. burning ropes, river crossing, 25 horses).']
      }
    ],
    skillWeightage: {
      aptitude: 30,
      dsa: 35,
      languages: 10,
      coreCs: 15,
      interview: 10
    },
    frequentlyAskedTopics: ['Probability & Statistics', 'Puzzles', 'Trees & Graphs', 'LRU Cache', 'System Architecture', 'SQL Optimization'],
    difficultyLevel: 'Extreme'
  }
];
