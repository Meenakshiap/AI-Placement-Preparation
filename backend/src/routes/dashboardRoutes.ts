import { Router } from 'express';
import { getDashboardOverview, toggleMission } from '../controllers/dashboardController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/overview', authenticateJwt, getDashboardOverview);
router.patch('/missions/:missionId/toggle', authenticateJwt, toggleMission);

export default router;
