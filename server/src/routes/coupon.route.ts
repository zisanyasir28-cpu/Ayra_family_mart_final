import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAuth } from '../middleware/requireAuth';
import { validateCoupon } from '../controllers/coupon.controller';
import { validateCouponSchema } from '@superstore/shared';

const router = Router();

router.post(
  '/validate',
  requireAuth,
  validate(validateCouponSchema),
  validateCoupon,
);

export default router;
