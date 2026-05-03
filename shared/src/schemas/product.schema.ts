import { z } from 'zod';
import { ProductStatus, SortOrder } from '../constants/enums';

export const createProductSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10).max(5000),
  sku: z.string().min(1).max(100),
  barcode: z.string().max(100).optional(),
  priceInPaisa: z.number().int().positive('Price must be a positive integer'),
  comparePriceInPaisa: z.number().int().positive().optional(),
  costPriceInPaisa: z.number().int().positive().optional(),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  unit: z.string().min(1).max(50).default('piece'),
  weight: z.number().positive().optional(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  isFeatured: z.boolean().default(false),
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
