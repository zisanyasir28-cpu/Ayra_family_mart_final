import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { validateCouponForUser } from '../services/coupon.service';
import type { ValidateCouponInput } from '@superstore/shared';

/**
 * POST /api/v1/coupons/validate  (requireAuth)
 * Body: { code, subtotalInPaisa }
 * Returns: { code, discountInPaisa }
 */
export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, subtotalInPaisa } = req.body as ValidateCouponInput;
  const userId = req.user?.sub;
  if (!userId) throw ApiError.unauthorized();

  const result = await validateCouponForUser(prisma, code, userId, subtotalInPaisa);

  return sendSuccess(res, {
    code:            result.code,
    discountInPaisa: result.discountInPaisa,
  });
});
