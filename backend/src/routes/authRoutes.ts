import { Router } from 'express';
import { register, login, demoLogin, getMe } from '../controllers/authController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authenticateJwt, getMe);

export default router;
