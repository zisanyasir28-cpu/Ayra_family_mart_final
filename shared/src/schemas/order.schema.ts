import { z } from 'zod';
import { PaymentMethod, SortOrder, OrderStatus } from '../constants/enums';
import { PAGINATION_DEFAULTS } from '../constants';
import { addressInputSchema } from './address.schema';

export const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
});

export const createOrderSchema = z
  .object({
    items: z
      .array(orderItemInputSchema)
      .min(1, 'Cart is empty')
      .max(50, 'Too many items in cart'),
    shippingAddressId: z.string().uuid().optional(),
    shippingAddress: addressInputSchema.optional(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    couponCode: z
      .string()
      .max(50)
      .transform((s) => s.trim().toUpperCase())
      .optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => Boolean(data.shippingAddressId ?? data.shippingAddress), {
    message: 'Either shippingAddressId or shippingAddress is required',
  });

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'totalInPaisa']).default('createdAt'),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid('Invalid order id'),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
