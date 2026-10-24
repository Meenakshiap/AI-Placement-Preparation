import { Router } from 'express';
import { getProblem, getProblems } from '../controllers/problemController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJwt, getProblems);
router.get('/:id', authenticateJwt, getProblem);

export default router;