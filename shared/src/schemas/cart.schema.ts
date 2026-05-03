import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(100),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
