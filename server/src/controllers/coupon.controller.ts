import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { validateCouponForUser } from '../services/coupon.service';
import type { ValidateCouponInput } from '@superstore/shared';

/**
 * POST /api/v1/coupons/validate
 * Used by CartDrawer + CheckoutPage to preview coupon discount before placing
 * the order. The same validator runs again inside `createOrder`'s transaction —
 * this endpoint is purely for UX feedback.
 */
export const validateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.sub) throw ApiError.unauthorized();
    const { code, subtotalInPaisa } = req.body as ValidateCouponInput;

    const { coupon, discountInPaisa } = await validateCouponForUser(
      prisma,
      code,
      req.user.sub,
      subtotalInPaisa,
    );

    return sendSuccess(res, {
      code: coupon.code,
      discountInPaisa,
      discountType: coupon.discountType,
    });
  },
);
