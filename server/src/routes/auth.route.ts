import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { validate } from '../utils/validate';
import { requireAuth } from '../middleware/requireAuth';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { registerSchema, loginSchema } from '@superstore/shared';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many auth attempts, try again later' },
  },
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/refresh',  authLimiter,                           refresh);
router.post('/logout',                                          logout);
router.get('/me',        requireAuth,                           getMe);

export default router;
