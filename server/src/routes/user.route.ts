import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../utils/validate';
import { updateProfileSchema, changePasswordSchema } from '@superstore/shared';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/profile',          getProfile);
router.patch('/profile',        validate(updateProfileSchema), updateProfile);
router.post('/change-password', validate(changePasswordSchema), changePassword);
router.delete('/account',       deleteAccount);

export default router;
