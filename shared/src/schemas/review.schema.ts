import { z } from 'zod';
import { PAGINATION_DEFAULTS } from '../constants';

// ─── Public ───────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(2000, 'Comment must be 2000 characters or less').optional(),
});

export const reviewQuerySchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .default(PAGINATION_DEFAULTS.LIMIT),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewQueryInput  = z.infer<typeof reviewQuerySchema>;
