import { z } from 'zod';
import { DiscountType } from '../constants/enums';

// ─── Scope: category vs. specific products ────────────────────────────────────

export const campaignScopeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind:       z.literal('category'),
    categoryId: z.string().uuid(),
  }),
  z.object({
    kind:       z.literal('products'),
    productIds: z.array(z.string().uuid()).min(1).max(500),
  }),
]);

export type CampaignScope = z.infer<typeof campaignScopeSchema>;

// ─── Admin: create campaign ───────────────────────────────────────────────────

export const createCampaignSchema = z
  .object({
    name:          z.string().min(2).max(120),
    slug:          z.string().min(2).max(140).regex(/^[a-z0-9-]+$/, 'Lowercase letters, digits, and dashes only').optional(),
    description:   z.string().max(2000).optional(),
    bannerUrl:     z.string().url().optional(),
    discountType:  z.nativeEnum(DiscountType),
    discountValue: z.coerce.number().int().positive(),
    startsAt:      z.coerce.date(),
    endsAt:        z.coerce.date().optional(),
    scope:         campaignScopeSchema,
  })
  .superRefine((data, ctx) => {
    if (data.discountType === DiscountType.PERCENTAGE && data.discountValue > 100) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'Percentage discount cannot exceed 100',
        path:    ['discountValue'],
      });
    }
    if (data.endsAt && data.endsAt <= data.startsAt) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'endsAt must be after startsAt',
        path:    ['endsAt'],
      });
    }
  });

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

// ─── Admin: update campaign (only if not started) ─────────────────────────────

export const updateCampaignSchema = z.object({
  name:          z.string().min(2).max(120).optional(),
  description:   z.string().max(2000).nullable().optional(),
  bannerUrl:     z.string().url().nullable().optional(),
  discountType:  z.nativeEnum(DiscountType).optional(),
  discountValue: z.coerce.number().int().positive().optional(),
  startsAt:      z.coerce.date().optional(),
  endsAt:        z.coerce.date().nullable().optional(),
  scope:         campaignScopeSchema.optional(),
});

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

// ─── Admin: query campaigns ───────────────────────────────────────────────────

export const campaignStatusFilter = z.enum(['all', 'active', 'upcoming', 'ended']);
export type CampaignStatusFilter = z.infer<typeof campaignStatusFilter>;

export const campaignQuerySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(100).default(20),
  status: campaignStatusFilter.default('all'),
});

export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
