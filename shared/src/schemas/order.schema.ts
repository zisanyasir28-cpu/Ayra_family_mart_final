import { z } from 'zod';
import { PaymentMethod, AddressType, SortOrder, OrderStatus } from '../constants/enums';
import { BD_PHONE_REGEX, PAGINATION_DEFAULTS } from '../constants';

const addressInputSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.nativeEnum(AddressType),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(BD_PHONE_REGEX, 'Invalid Bangladeshi phone number'),
  addressLine1: z.string().min(5).max(255),
  addressLine2: z.string().max(255).optional(),
  district: z.string().min(1).max(100),
  thana: z.string().min(1).max(100),
  postalCode: z.string().max(10).optional(),
});

export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid().optional(),
  shippingAddress: addressInputSchema.optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.shippingAddressId ?? data.shippingAddress,
  { message: 'Either shippingAddressId or shippingAddress is required' }
);

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

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
