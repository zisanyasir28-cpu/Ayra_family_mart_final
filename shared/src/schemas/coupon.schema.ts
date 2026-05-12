import { z } from 'zod';

export const validateCouponSchema = z.object({
  code:             z.string().min(1).max(50).transform((s) => s.trim().toUpperCase()),
  subtotalInPaisa:  z.number().int().nonnegative(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
