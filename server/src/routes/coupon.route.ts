import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';
import {
  validateCoupon,
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller';
import {
  validateCouponSchema,
  createCouponSchema,
  updateCouponSchema,
  couponQuerySchema,
} from '@superstore/shared';

const router = Router();

// ─── Public (auth required) ──────────────────────────────────────────────────

router.post('/validate', requireAuth, validate(validateCouponSchema), validateCoupon);

// ─── Admin ───────────────────────────────────────────────────────────────────

router.get('/',            requireAdmin, validate(couponQuerySchema, 'query'), getCoupons);
router.get('/:id',         requireAdmin, getCouponById);
router.post('/',           requireAdmin, validate(createCouponSchema), createCoupon);
router.patch('/:id',       requireAdmin, validate(updateCouponSchema), updateCoupon);
router.patch('/:id/toggle', requireAdmin, toggleCoupon);
router.delete('/:id',      requireAdmin, deleteCoupon);

export default router;
