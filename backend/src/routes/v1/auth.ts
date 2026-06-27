import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { requireAuth } from '../../middlewares/auth';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();

// Rate limited public auth routes
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

// Public token session controls
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected profile management
router.get('/me', requireAuth, authController.me);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/change-password', requireAuth, authController.changePassword);

// Protected session/device tracking
router.get('/sessions', requireAuth, authController.getSessions);
router.delete('/sessions/:id', requireAuth, authController.logoutSession);
router.delete('/sessions', requireAuth, authController.logoutAllSessions);

export default router;
