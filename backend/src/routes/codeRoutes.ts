import { Router } from 'express';
import { runCode, submitCodeForEvaluation } from '../controllers/codeController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.post('/run', authenticateJwt, runCode);
router.post('/submit', authenticateJwt, submitCodeForEvaluation);

export default router;