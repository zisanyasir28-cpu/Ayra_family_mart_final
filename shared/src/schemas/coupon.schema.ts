import { z } from 'zod';
import { DiscountType } from '../constants/enums';

// ─── Public: validate coupon at checkout ──────────────────────────────────────

export const validateCouponSchema = z.object({
  code:            z.string().min(1).max(50).transform((s) => s.trim().toUpperCase()),
  subtotalInPaisa: z.number().int().nonnegative(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

// ─── Admin: create coupon ─────────────────────────────────────────────────────

export const createCouponSchema = z
  .object({
    code:                  z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, 'Use only A-Z, 0-9, _ and -').transform((s) => s.toUpperCase()).optional(),
    description:           z.string().max(500).optional(),
    discountType:          z.nativeEnum(DiscountType),
    discountValue:         z.coerce.number().int().positive(),
    minOrderAmountInPaisa: z.coerce.number().int().nonnegative().optional(),
    maxDiscountInPaisa:    z.coerce.number().int().positive().optional(),
    usageLimit:            z.coerce.number().int().positive().optional(),
    perUserLimit:          z.coerce.number().int().positive().optional(),
    startsAt:              z.coerce.date(),
    expiresAt:             z.coerce.date().optional(),
    isActive:              z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === DiscountType.PERCENTAGE && data.discountValue > 100) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'Percentage discount cannot exceed 100',
        path:    ['discountValue'],
      });
    }
    if (data.expiresAt && data.expiresAt <= data.startsAt) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'expiresAt must be after startsAt',
        path:    ['expiresAt'],
      });
    }
  });

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

// ─── Admin: update coupon ─────────────────────────────────────────────────────

export const updateCouponSchema = z
  .object({
    description:           z.string().max(500).optional(),
    discountType:          z.nativeEnum(DiscountType).optional(),
    discountValue:         z.coerce.number().int().positive().optional(),
    minOrderAmountInPaisa: z.coerce.number().int().nonnegative().nullable().optional(),
    maxDiscountInPaisa:    z.coerce.number().int().positive().nullable().optional(),
    usageLimit:            z.coerce.number().int().positive().nullable().optional(),
    perUserLimit:          z.coerce.number().int().positive().nullable().optional(),
    startsAt:              z.coerce.date().optional(),
    expiresAt:             z.coerce.date().nullable().optional(),
    isActive:              z.boolean().optional(),
  });

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

// ─── Admin: query coupons ─────────────────────────────────────────────────────

export const couponStatusFilter = z.enum(['all', 'active', 'expired', 'upcoming', 'exhausted']);
export type CouponStatusFilter = z.infer<typeof couponStatusFilter>;

export const couponQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().positive().max(100).default(20),
  search:   z.string().max(100).optional(),
  status:   couponStatusFilter.default('all'),
});

export type CouponQueryInput = z.infer<typeof couponQuerySchema>;
