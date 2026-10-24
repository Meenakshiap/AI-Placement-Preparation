import { CodeLanguage, IProblem } from '../types/index.js';

const starterCode: Record<CodeLanguage, string> = {
  python: 'def solve(input_data):\n    # Return the answer as a string.\n    return ""\n',
  javascript: 'function solve(input) {\n  // Return the answer as a string.\n  return "";\n}\n',
  java: 'import java.util.Scanner;\n\npublic class Main {\n  static String solve(String input) {\n    // Return the answer as a string.\n    return "";\n  }\n\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    System.out.print(solve(scanner.hasNextLine() ? scanner.nextLine() : ""));\n  }\n}\n',
  cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nstring solve(const string& input) {\n  // Return the answer as a string.\n  return "";\n}\n\nint main() {\n  string input;\n  getline(cin, input);\n  cout << solve(input);\n  return 0;\n}\n'
};

export const PROBLEMS: IProblem[] = [
  {
    id: 'p1', title: 'Two Sum & Complement Hashing', difficulty: 'Easy', topic: 'Arrays & Hashing',
    companies: ['Google', 'Amazon', 'TCS'],
    description: 'Given an integer array and a target, return the indices of two distinct values whose sum equals the target. The input line contains comma-separated values, followed by a pipe and the target.',
    examples: [
      { input: '2,7,11,15|9', output: '0,1', explanation: 'The values at indices 0 and 1 sum to 9.' },
      { input: '3,2,4|6', output: '1,2', explanation: 'The values 2 and 4 sum to 6.' },
      { input: '1,5,3,7|8', output: '1,2', explanation: 'The values 5 and 3 add to the target.' }
    ],
    constraints: ['2 <= array length <= 100,000', '-1,000,000,000 <= values, target <= 1,000,000,000', 'Exactly one valid pair exists; do not reuse an index.'],
    hints: ['For each value, look up the complement needed to reach the target.', 'Store values you have already visited with their indices.'],
    starterCode: { ...starterCode },
    visibleTestCases: [
      { input: '2,7,11,15|9', expectedOutput: '0,1' },
      { input: '3,2,4|6', expectedOutput: '1,2' }
    ],
    hiddenTestCases: [{ input: '3,3|6', expectedOutput: '0,1' }, { input: '-4,8,3,1|-1', expectedOutput: '0,2' }]
  },
  {
    id: 'p2', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window',
    companies: ['Google', 'Microsoft'],
    description: 'Given a string, return the length of its longest contiguous substring that contains no repeated characters. The input line is the string itself.',
    examples: [
      { input: 'abcabcbb', output: '3', explanation: '"abc" is the longest substring without repetition.' },
      { input: 'bbbbb', output: '1', explanation: 'Every valid substring contains one character.' },
      { input: 'pwwkew', output: '3', explanation: '"wke" is a longest valid substring; the answer is its length.' }
    ],
    constraints: ['0 <= string length <= 100,000', 'The input contains printable ASCII characters.'],
    hints: ['Maintain a sliding window and move its left edge past a repeated character.', 'Track the most recent index for each character.'],
    starterCode: { ...starterCode },
    visibleTestCases: [{ input: 'abcabcbb', expectedOutput: '3' }, { input: 'bbbbb', expectedOutput: '1' }],
    hiddenTestCases: [{ input: 'dvdf', expectedOutput: '3' }, { input: '', expectedOutput: '0' }]
  },
  {
    id: 'p3', title: 'Detect & Break Cycle in Singly Linked List', difficulty: 'Medium', topic: 'Linked List',
    companies: ['Amazon', 'Infosys'],
    description: 'A singly linked list is described by its node values and the index of the node the tail links back to (-1 means no cycle). Detect the cycle, break it, and print the resulting list values in order, comma-separated.',
    examples: [
      { input: '1,2,3,4|1', output: '1,2,3,4', explanation: 'The tail links to the node at index 1; remove that link.' },
      { input: '5,8|-1', output: '5,8', explanation: 'The list has no cycle and remains unchanged.' }
    ],
    constraints: ['0 <= node count <= 100,000', '-1 <= cycle index < node count', 'Node values are signed 32-bit integers.'],
    hints: ['Floyd’s slow/fast pointer algorithm can detect a cycle in constant extra space.', 'After locating the cycle, find its predecessor and set its next pointer to null.'],
    starterCode: { ...starterCode },
    visibleTestCases: [{ input: '1,2,3,4|1', expectedOutput: '1,2,3,4' }, { input: '5,8|-1', expectedOutput: '5,8' }],
    hiddenTestCases: [{ input: '7,7,7,7|2', expectedOutput: '7,7,7,7' }, { input: '|-1', expectedOutput: '' }]
  },
  {
    id: 'p4', title: 'LRU Cache Design with O(1) Operations', difficulty: 'Hard', topic: 'Data Structures',
    companies: ['Google', 'Amazon', 'Goldman Sachs'],
    description: 'Implement a least-recently-used cache. Input starts with capacity, then a pipe and comma-separated operations: put:key:value or get:key. Print the results of get operations as comma-separated values (-1 when absent).',
    examples: [
      { input: '2|put:1:1,put:2:2,get:1,put:3:3,get:2', output: '1,-1', explanation: 'Getting key 1 makes it recent, so inserting key 3 evicts key 2.' },
      { input: '1|put:2:1,get:2,put:3:2,get:2,get:3', output: '1,-1,2', explanation: 'The single cache slot holds only the most recently inserted key.' }
    ],
    constraints: ['1 <= capacity <= 10,000', 'At most 100,000 operations', '-1,000,000 <= keys, values <= 1,000,000'],
    hints: ['Combine a hash map with a doubly linked list.', 'Keep the most recently used node at the front and evict from the tail.'],
    starterCode: { ...starterCode },
    visibleTestCases: [
      { input: '2|put:1:1,put:2:2,get:1,put:3:3,get:2', expectedOutput: '1,-1' },
      { input: '1|put:2:1,get:2,put:3:2,get:2,get:3', expectedOutput: '1,-1,2' }
    ],
    hiddenTestCases: [{ input: '2|put:1:1,put:1:2,get:1,put:2:3,get:1,get:2', expectedOutput: '2,2,3' }, { input: '2|get:1,put:1:9,get:1', expectedOutput: '-1,9' }]
  }
];

export const getPublicProblem = (problem: IProblem) => ({
  id: problem.id,
  title: problem.title,
  difficulty: problem.difficulty,
  topic: problem.topic,
  companies: problem.companies,
  description: problem.description,
  examples: problem.examples,
  constraints: problem.constraints,
  hints: problem.hints,
  starterCode: problem.starterCode,
  visibleTestCases: problem.visibleTestCases
});