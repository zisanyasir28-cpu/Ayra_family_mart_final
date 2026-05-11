import { Prisma, DiscountType, type Coupon } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

/**
 * The Prisma transaction client. We accept either the live `prisma` or a
 * `tx` handle from inside `$transaction`, so the same helper is reused by:
 *   - POST /coupons/validate (read-only, uses prisma directly)
 *   - POST /orders          (mutating, called inside $transaction)
 */
export type CouponTx = Prisma.TransactionClient | typeof import('../lib/prisma').prisma;

export interface CouponValidationResult {
  coupon: Coupon;
  discountInPaisa: number;
}

/**
 * Validates a coupon for a specific user + cart subtotal and returns the
 * resolved coupon + discount in paisa.
 *
 * Throws ApiError with a precise code for every failure mode so the client
 * can surface the right inline message.
 *
 * IMPORTANT: this only READS coupon state. Incrementing `usageCount` and
 * inserting `CouponUsage` is the order controller's responsibility, performed
 * atomically inside the same `$transaction`.
 */
export async function validateCouponForUser(
  tx: CouponTx,
  code: string,
  userId: string,
  subtotalInPaisa: number,
): Promise<CouponValidationResult> {
  const upperCode = code.trim().toUpperCase();

  const coupon = await tx.coupon.findUnique({ where: { code: upperCode } });
  if (!coupon || !coupon.isActive) {
    throw new ApiError(404, 'COUPON_INVALID', 'This coupon code is not valid.');
  }

  const now = new Date();
  if (coupon.startsAt > now) {
    throw new ApiError(
      400,
      'COUPON_INVALID',
      'This coupon is not yet active.',
    );
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new ApiError(400, 'COUPON_EXPIRED', 'This coupon has expired.');
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError(
      400,
      'COUPON_USAGE_EXCEEDED',
      'This coupon has reached its global usage limit.',
    );
  }

  if (coupon.perUserLimit !== null) {
    const userUsage = await tx.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsage >= coupon.perUserLimit) {
      throw new ApiError(
        400,
        'COUPON_USAGE_EXCEEDED',
        'You have already used this coupon the maximum number of times.',
      );
    }
  }

  if (
    coupon.minOrderAmountInPaisa !== null &&
    subtotalInPaisa < coupon.minOrderAmountInPaisa
  ) {
    throw new ApiError(
      400,
      'COUPON_MIN_NOT_MET',
      `Minimum order of BDT ${(coupon.minOrderAmountInPaisa / 100).toFixed(2)} required.`,
      { minOrderAmountInPaisa: coupon.minOrderAmountInPaisa },
    );
  }

  // Compute discount.
  let discountInPaisa: number;
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    // discountValue is stored as an integer percent (e.g. 10 = 10%)
    discountInPaisa = Math.floor((subtotalInPaisa * coupon.discountValue) / 100);
  } else {
    // FIXED_AMOUNT — discountValue is paisa
    discountInPaisa = coupon.discountValue;
  }

  if (
    coupon.maxDiscountInPaisa !== null &&
    discountInPaisa > coupon.maxDiscountInPaisa
  ) {
    discountInPaisa = coupon.maxDiscountInPaisa;
  }

  // Never discount more than the subtotal.
  discountInPaisa = Math.min(discountInPaisa, subtotalInPaisa);

  return { coupon, discountInPaisa };
}
