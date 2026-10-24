import { Router } from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import companyRoutes from './companyRoutes.js';
import problemRoutes from './problemRoutes.js';
import codeRoutes from './codeRoutes.js';
import trackRoutes from './trackRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/assessment', assessmentRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/companies', companyRoutes);
apiRouter.use('/problems', problemRoutes);
apiRouter.use('/code', codeRoutes);
apiRouter.use('/tracks', trackRoutes);

// Health check route
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI-Powered Placement Preparation Platform Backend'
  });
});

export default apiRouter;
