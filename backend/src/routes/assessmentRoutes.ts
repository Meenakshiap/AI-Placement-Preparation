import { Router } from 'express';
import { getDiagnosticQuestions, submitDiagnosticAssessment, getAssessmentStatus } from '../controllers/assessmentController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/diagnostic', authenticateJwt, getDiagnosticQuestions);
router.post('/diagnostic/submit', authenticateJwt, submitDiagnosticAssessment);
router.get('/status', authenticateJwt, getAssessmentStatus);

export default router;
