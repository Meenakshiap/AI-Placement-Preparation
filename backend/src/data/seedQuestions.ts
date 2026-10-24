import { IQuestion } from '../types/index.js';

export const SEED_QUESTIONS: IQuestion[] = [
  // --- DIAGNOSTIC ASSESSMENT QUESTIONS (10 MULTI-CATEGORY QUESTIONS) ---
  {
    id: 'diag_1',
    title: 'Work & Time Efficiency Calculation',
    type: 'diagnostic',
    category: 'Quantitative',
    subTopic: 'Time and Work',
    difficulty: 'Medium',
    description: 'Worker A can finish a software module in 12 days, while Worker B can finish the same module in 18 days. If they work together with Worker C and finish the module in 4 days, in how many days can Worker C alone complete the entire module?',
    options: [
      '9 days',
      '8 days',
      '10 days',
      '12 days'
    ],
    correctAnswer: '9 days',
    explanation: 'Total 1 day work of A + B + C = 1/4. Work of A = 1/12, Work of B = 1/18. Therefore, 1 day work of C = 1/4 - (1/12 + 1/18) = 1/4 - (5/36) = (9 - 5)/36 = 4/36 = 1/9. Hence C alone completes the task in 9 days.',
    hints: ['Find the combined rate per day: Rate(A) + Rate(B) + Rate(C) = Rate(Total)', 'LCM of 12, 18, and 4 is 36 units.'],
    companiesTagged: ['TCS', 'Infosys', 'Accenture', 'Wipro']
  },
  {
    id: 'diag_2',
    title: 'Logical Deduction & Sequence Pattern',
    type: 'diagnostic',
    category: 'Logical',
    subTopic: 'Series & Patterns',
    difficulty: 'Medium',
    description: 'Identify the next missing number in the following algorithmic sequence: 4, 18, 48, 100, 180, ?',
    options: [
      '294',
      '275',
      '312',
      '248'
    ],
    correctAnswer: '294',
    explanation: 'The pattern follows n^3 - n^2 (or n^2 * (n - 1)) where n starts from 2:\nFor n=2: 2^3 - 2^2 = 8 - 4 = 4\nFor n=3: 3^3 - 3^2 = 27 - 9 = 18\nFor n=4: 4^3 - 4^2 = 64 - 16 = 48\nFor n=5: 5^3 - 5^2 = 125 - 25 = 100\nFor n=6: 6^3 - 6^2 = 216 - 36 = 180\nFor n=7: 7^3 - 7^2 = 343 - 49 = 294.',
    hints: ['Try expressing each term as a cube minus square or product of two powers.', 'For term 1: 1 * 4, term 2: 2 * 9, term 3: 3 * 16, term 4: 4 * 25...'],
    companiesTagged: ['Google', 'Goldman Sachs', 'Amazon', 'Infosys']
  },
  {
    id: 'diag_3',
    title: 'Python Scoping & Mutable Default Arguments',
    type: 'diagnostic',
    category: 'Python',
    subTopic: 'Functions & Mutability',
    difficulty: 'Medium',
    description: 'What will be the exact output of executing the following Python snippet?\n\n```python\ndef append_to_list(val, my_list=[]):\n    my_list.append(val)\n    return my_list\n\nprint(append_to_list(10))\nprint(append_to_list(20, []))\nprint(append_to_list(30))\n```',
    options: [
      '[10], [20], [10, 30]',
      '[10], [20], [30]',
      '[10], [10, 20], [10, 20, 30]',
      '[10], [20], [20, 30]'
    ],
    correctAnswer: '[10], [20], [10, 30]',
    explanation: 'In Python, default arguments are evaluated once when the function is defined, not each time the function is called. The list `my_list` is shared across invocations that do not pass an explicit second argument. In the 2nd call, a fresh list `[]` was explicitly passed so it did not mutate the default list. The 3rd call reuses the mutated default list `[10]`, resulting in `[10, 30]`.',
    hints: ['Default arguments in Python are instantiated at definition time and reused across calls.'],
    companiesTagged: ['Google', 'Microsoft', 'Amazon']
  },
  {
    id: 'diag_4',
    title: 'Java OOPs: Polymorphism & Method Overriding',
    type: 'diagnostic',
    category: 'Java',
    subTopic: 'Object Oriented Programming',
    difficulty: 'Medium',
    description: 'Given the Java code below, what is the output of `new Child().display()`?\n\n```java\nclass Parent {\n    int x = 10;\n    void print() { System.out.print(x + " "); }\n}\nclass Child extends Parent {\n    int x = 20;\n    void print() { System.out.print(x + " "); }\n    void display() {\n        Parent p = this;\n        System.out.print(p.x + " ");\n        p.print();\n    }\n}\n```',
    options: [
      '10 20 ',
      '20 20 ',
      '10 10 ',
      '20 10 '
    ],
    correctAnswer: '10 20 ',
    explanation: 'In Java, member variables (fields) do not exhibit polymorphism and are resolved at compile-time based on the reference type (`p` is of type `Parent`, so `p.x` accesses `Parent.x = 10`). However, non-private instance methods are dynamically dispatched at runtime based on the actual object instance (`this` is an instance of `Child`, so `p.print()` invokes `Child.print()`, which prints `20`).',
    hints: ['Variable binding is determined at compile-time by reference type, whereas virtual method dispatch happens at runtime.'],
    companiesTagged: ['Amazon', 'TCS', 'Infosys', 'Microsoft']
  },
  {
    id: 'diag_5',
    title: 'JavaScript Event Loop & Microtask Queues',
    type: 'diagnostic',
    category: 'JavaScript',
    subTopic: 'Event Loop & Promises',
    difficulty: 'Hard',
    description: 'What will be printed to the console when executing this JavaScript code?\n\n```javascript\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3)).then(() => console.log(4));\nconsole.log(5);\n```',
    options: [
      '1, 5, 3, 4, 2',
      '1, 2, 3, 4, 5',
      '1, 5, 2, 3, 4',
      '1, 3, 5, 4, 2'
    ],
    correctAnswer: '1, 5, 3, 4, 2',
    explanation: '1 and 5 are synchronous calls and run immediately. Next, microtasks (Promises) in the microtask queue run before macrotasks: Promise chain prints 3, then 4. Finally, the macrotask (`setTimeout` callback) executes and prints 2.',
    hints: ['Synchronous code -> Microtask queue (Promises) -> Macrotask queue (setTimeout).'],
    companiesTagged: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs']
  },
  {
    id: 'diag_6',
    title: 'Data Structures: Time Complexity of Linked List Cycle Detection',
    type: 'diagnostic',
    category: 'DSA',
    subTopic: 'Linked Lists & Pointers',
    difficulty: 'Medium',
    description: 'What is the optimal auxiliary space complexity of Floyd’s Cycle-Finding Algorithm (Tortoise and Hare) for detecting a cycle in a singly linked list with N nodes?',
    options: [
      'O(1)',
      'O(N)',
      'O(log N)',
      'O(N^2)'
    ],
    correctAnswer: 'O(1)',
    explanation: 'Floyd’s Cycle-Finding algorithm uses two pointers (`slow` moving 1 step and `fast` moving 2 steps). It only stores two memory pointers, requiring O(1) auxiliary constant memory space while traversing in O(N) time.',
    hints: ['Unlike a HashSet approach which requires storing visited node references in O(N) space, two-pointer tracking needs no external buffers.'],
    companiesTagged: ['Google', 'Amazon', 'Microsoft', 'Goldman Sachs']
  },
  {
    id: 'diag_7',
    title: 'Algorithms: Optimal Substructure in Two Sum / Hash Lookup',
    type: 'diagnostic',
    category: 'DSA',
    subTopic: 'Arrays & Hashing',
    difficulty: 'Easy',
    description: 'Given an unsorted array of N integers, what is the most optimal average time complexity to find if there exist two elements whose sum equals a target value K?',
    options: [
      'O(N) time using a Hash Map',
      'O(N log N) time using Sorting and Binary Search',
      'O(N^2) time using Nested Loops',
      'O(1) time using a Bitset'
    ],
    correctAnswer: 'O(N) time using a Hash Map',
    explanation: 'By iterating through the array once and storing each seen number in a Hash Map (or Hash Set), we can check in O(1) average time if the complement `K - num` has already been encountered, achieving an optimal O(N) time and O(N) space complexity.',
    hints: ['Complement lookup: For each element x, check if (K - x) exists in the table.'],
    companiesTagged: ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys']
  },
  {
    id: 'diag_8',
    title: 'Operating Systems: Deadlock Necessary Conditions',
    type: 'diagnostic',
    category: 'CoreCS',
    subTopic: 'Operating Systems',
    difficulty: 'Medium',
    description: 'Which of the following is NOT one of the four Coffman conditions necessary for a system deadlock to occur?',
    options: [
      'Preemptive Resource Allocation',
      'Mutual Exclusion',
      'Hold and Wait',
      'Circular Wait'
    ],
    correctAnswer: 'Preemptive Resource Allocation',
    explanation: 'The four necessary Coffman conditions for deadlock are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption (resources cannot be forcibly taken from processes), and 4) Circular Wait. "Preemptive Resource Allocation" actually prevents deadlocks rather than causing them.',
    hints: ['If resources can be preempted, deadlocks can be resolved and broken.'],
    companiesTagged: ['Microsoft', 'Google', 'Amazon', 'TCS']
  },
  {
    id: 'diag_9',
    title: 'DBMS: SQL Normalization & Dependency Preserving',
    type: 'diagnostic',
    category: 'CoreCS',
    subTopic: 'DBMS & SQL',
    difficulty: 'Medium',
    description: 'A relation R is in Third Normal Form (3NF) if it is in 2NF and:',
    options: [
      'Every non-prime attribute is non-transitively dependent on every candidate key',
      'Every determinant is a candidate key (BCNF condition)',
      'There are no multi-valued dependencies',
      'Every non-key attribute is partially dependent on the primary key'
    ],
    correctAnswer: 'Every non-prime attribute is non-transitively dependent on every candidate key',
    explanation: '3NF strictly eliminates transitive functional dependencies: for every functional dependency X -> Y, either X is a super key or Y is a prime attribute (part of a candidate key).',
    hints: ['2NF removes partial key dependencies; 3NF removes transitive dependencies.'],
    companiesTagged: ['TCS', 'Infosys', 'Amazon', 'Wipro', 'Accenture']
  },
  {
    id: 'diag_10',
    title: 'System Design: Caching Strategy Trade-offs',
    type: 'diagnostic',
    category: 'SystemDesign',
    subTopic: 'Caching & Scalability',
    difficulty: 'Hard',
    description: 'In a high-throughput read-heavy web application, which caching strategy writes data directly to the cache and the database simultaneously to guarantee immediate read consistency?',
    options: [
      'Write-Through Caching',
      'Write-Back (Write-Behind) Caching',
      'Write-Around Caching',
      'Cache-Aside (Lazy Loading)'
    ],
    correctAnswer: 'Write-Through Caching',
    explanation: 'In Write-Through caching, data is written into the cache and the permanent database store concurrently before the write operation returns success. This ensures the cache is never stale, though it introduces higher write latency compared to Write-Back.',
    hints: ['Write-back writes to cache first and async batches to DB; Write-through writes to both synchronously.'],
    companiesTagged: ['Google', 'Amazon', 'Microsoft', 'Goldman Sachs']
  }
];
