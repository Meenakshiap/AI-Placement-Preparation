import { Router } from 'express';
import { getProfile, updateProfile, getCompanies, getActivity } from '../controllers/profileController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.get('/companies', getCompanies);
router.get('/activity', authenticateJwt, getActivity);
router.get('/', authenticateJwt, getProfile);
router.put('/', authenticateJwt, updateProfile);

export default router;
