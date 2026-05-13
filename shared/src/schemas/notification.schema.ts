import { z } from 'zod';
import { PAGINATION_DEFAULTS } from '../constants';

// ─── Query ────────────────────────────────────────────────────────────────────

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .default(PAGINATION_DEFAULTS.LIMIT),
  unreadOnly: z.coerce.boolean().default(false),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
