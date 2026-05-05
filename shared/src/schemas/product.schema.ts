import { z } from 'zod';
import { ProductStatus, SortOrder } from '../constants/enums';

// ─── FormData-compatible helpers ─────────────────────────────────────────────
// These preprocessors allow the schema to accept values from both
// JSON bodies (typed) and multipart/form-data bodies (all strings).

const coerceBool = z.preprocess(
  (v) => (typeof v === 'boolean' ? v : v === 'true'),
  z.boolean(),
);

const coerceTags = z.preprocess(
  (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v);
      } catch {
        return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];
      }
    }
    return [];
  },
  z.array(z.string().max(50)).max(20),
);

export const createProductSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10).max(5000),
  sku: z.string().min(1).max(100),
  barcode: z.string().max(100).optional(),
  priceInPaisa: z.coerce.number().int().positive('Price must be a positive integer'),
  comparePriceInPaisa: z.coerce.number().int().positive().optional(),
  costPriceInPaisa: z.coerce.number().int().positive().optional(),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  unit: z.string().min(1).max(50).default('piece'),
  weight: z.coerce.number().positive().optional(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  tags: coerceTags.default([]),
  isFeatured: coerceBool.default(false),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
});

export const updateProductSchema = createProductSchema.partial();

// productQuerySchema uses BDT (taka) for price filters — controller converts to paisa
export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
  minPrice: z.coerce.number().min(0).optional(), // BDT taka
  maxPrice: z.coerce.number().min(0).optional(), // BDT taka
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  sortBy: z
    .enum(['price_asc', 'price_desc', 'newest', 'oldest', 'name_asc', 'name_desc'])
    .default('newest'),
});

export const bulkPriceUpdateSchema = z
  .object({
    type: z.enum(['by_ids', 'by_category', 'all_active']),
    ids: z.array(z.string().uuid()).min(1).optional(),
    categoryId: z.string().uuid().optional(),
    changeType: z.enum(['percentage', 'fixed']),
    changeValue: z
      .number()
      .refine((v) => v !== 0, 'Change value cannot be zero'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'by_ids' && (!data.ids || data.ids.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ids is required when type is by_ids',
        path: ['ids'],
      });
    }
    if (data.type === 'by_category' && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'categoryId is required when type is by_category',
        path: ['categoryId'],
      });
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>;
