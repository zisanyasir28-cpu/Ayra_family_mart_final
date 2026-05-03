import { z } from 'zod';
import { PAGINATION_DEFAULTS } from '../constants';

export const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  changeAmount: z
    .number()
    .int()
    .refine((n) => n !== 0, 'Change amount cannot be zero'),
  reason: z.enum(['RESTOCK', 'CORRECTION', 'DAMAGE', 'RETURN']),
  note: z.string().max(500).optional(),
});

export const stockHistoryQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type StockHistoryQueryInput = z.infer<typeof stockHistoryQuerySchema>;
