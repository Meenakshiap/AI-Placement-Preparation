import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { CodingAttemptModel } from '../models/index.js';
import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { PROBLEMS, getPublicProblem } from '../data/problems.js';

export const getProblems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const solvedIds = isMongoActive()
      ? await CodingAttemptModel.distinct('problemId', { userId, isCorrect: true }) as string[]
      : jsonStore.find('codingAttempts', attempt => attempt.userId === userId && attempt.isCorrect).map(attempt => attempt.problemId);
    const solved = new Set(solvedIds);
    res.json({ success: true, problems: PROBLEMS.map(problem => ({ ...getPublicProblem(problem), isSolved: solved.has(problem.id) })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unable to load problems.' });
  }
};

export const getProblem = (req: AuthRequest, res: Response): void => {
  const problem = PROBLEMS.find(item => item.id === req.params.id);
  if (!problem) {
    res.status(404).json({ success: false, message: 'Problem not found.' });
    return;
  }
  res.json({ success: true, problem: getPublicProblem(problem) });
};