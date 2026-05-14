import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAuth } from '../middleware/requireAuth';
import { authLimiter } from '../middleware/rateLimiters';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { registerSchema, loginSchema } from '@superstore/shared';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/refresh',  authLimiter,                           refresh);
router.post('/logout',                                          logout);
router.get('/me',        requireAuth,                           getMe);

export default router;
