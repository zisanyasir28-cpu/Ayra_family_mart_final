import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code too long')
    .transform((s) => s.trim().toUpperCase()),
  subtotalInPaisa: z
    .number()
    .int()
    .nonnegative('Subtotal cannot be negative'),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
