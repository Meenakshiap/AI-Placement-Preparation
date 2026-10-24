import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.js';
import { getTrack, getTracks, runTrackModule, startTrack, submitTrackQuiz } from '../controllers/trackController.js';

const router = Router();

router.get('/', authenticateJwt, getTracks);
router.get('/:id', authenticateJwt, getTrack);
router.post('/:id/start', authenticateJwt, startTrack);
router.post('/:id/modules/:moduleId/run', authenticateJwt, runTrackModule);
router.post('/:id/modules/:moduleId/quiz', authenticateJwt, submitTrackQuiz);

export default router;