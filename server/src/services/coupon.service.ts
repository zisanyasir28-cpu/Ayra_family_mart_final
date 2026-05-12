/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from '../utils/ApiError';

/**
 * Validate a coupon code for a specific user + cart subtotal and compute the
 * discount amount. Identical logic must run for both the `/coupons/validate`
 * endpoint and inside `createOrder`'s transaction — pass the transaction
 * client (or `prisma`) as `tx`.
 */
export async function validateCouponForUser(
  tx: any,
  rawCode: string,
  userId: string,
  subtotalInPaisa: number,
): Promise<{ couponId: string; code: string; discountInPaisa: number }> {
  const code = rawCode.trim().toUpperCase();

  const coupon = await tx.coupon.findUnique({ where: { code } });
  if (!coupon) {
    throw ApiError.badRequest('Coupon code is not valid', { code }, 'COUPON_INVALID');
  }
  if (!coupon.isActive) {
    throw ApiError.badRequest('Coupon is no longer active', { code }, 'COUPON_INVALID');
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw ApiError.badRequest('Coupon is not active yet', { code }, 'COUPON_EXPIRED');
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw ApiError.badRequest('Coupon has expired', { code }, 'COUPON_EXPIRED');
  }

  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    throw ApiError.badRequest(
      'Coupon usage limit reached',
      { code },
      'COUPON_USAGE_EXCEEDED',
    );
  }

  if (coupon.perUserLimit != null) {
    const used = await tx.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (used >= coupon.perUserLimit) {
      throw ApiError.badRequest(
        'You have already used this coupon the maximum number of times',
        { code, limit: coupon.perUserLimit },
        'COUPON_USAGE_EXCEEDED',
      );
    }
  }

  if (
    coupon.minOrderAmountInPaisa != null &&
    subtotalInPaisa < coupon.minOrderAmountInPaisa
  ) {
    throw ApiError.badRequest(
      `Order must be at least ৳${(coupon.minOrderAmountInPaisa / 100).toFixed(2)} to use this coupon`,
      { code, required: coupon.minOrderAmountInPaisa, subtotal: subtotalInPaisa },
      'COUPON_MIN_NOT_MET',
    );
  }

  // ── Compute discount ──────────────────────────────────────────────────────
  let discountInPaisa = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountInPaisa = Math.round((subtotalInPaisa * coupon.discountValue) / 100);
  } else {
    // FIXED_AMOUNT — discountValue is in paisa
    discountInPaisa = coupon.discountValue;
  }

  if (coupon.maxDiscountInPaisa != null) {
    discountInPaisa = Math.min(discountInPaisa, coupon.maxDiscountInPaisa);
  }
  discountInPaisa = Math.max(0, Math.min(discountInPaisa, subtotalInPaisa));

  return { couponId: coupon.id, code: coupon.code, discountInPaisa };
}
