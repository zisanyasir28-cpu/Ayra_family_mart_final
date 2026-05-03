import { z } from 'zod';
import { ProductStatus, SortOrder } from '../constants/enums';
import { PAGINATION_DEFAULTS } from '../constants';

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

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
  search: z.string().max(255).optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sortBy: z
    .enum(['priceInPaisa', 'createdAt', 'name', 'stockQuantity'])
    .default('createdAt'),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
