import { api } from '../lib/api';
import type { ApiOrder } from '../types/api';
import type {
  ApiSuccessResponse,
  PaginationMeta,
  CreateOrderInput,
  OrderQueryInput,
} from '@superstore/shared';

export interface CreateOrderResult {
  order: ApiOrder;
  /** Present only when paymentMethod === 'SSLCOMMERZ'. */
  gatewayUrl?: string;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const res = await api.post<ApiSuccessResponse<CreateOrderResult>>(
    '/orders',
    input,
  );
  return res.data.data;
}

export interface OrdersListResult {
  data: ApiOrder[];
  meta: { pagination: PaginationMeta };
}

export async function fetchMyOrders(
  params: Partial<OrderQueryInput> = {},
): Promise<OrdersListResult> {
  const res = await api.get<{
    success: true;
    data: ApiOrder[];
    meta: { pagination: PaginationMeta };
  }>('/orders/me', { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchMyOrderById(id: string): Promise<ApiOrder> {
  const res = await api.get<ApiSuccessResponse<ApiOrder>>(`/orders/me/${id}`);
  return res.data.data;
}

export async function cancelMyOrder(
  id: string,
  reason?: string,
): Promise<ApiOrder> {
  const res = await api.patch<ApiSuccessResponse<ApiOrder>>(
    `/orders/me/${id}/cancel`,
    { ...(reason && { reason }) },
  );
  return res.data.data;
}

// ─── Coupon validation (already wired to CartDrawer; surfaced here too) ─────

export interface ValidateCouponResult {
  code: string;
  discountInPaisa: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
}

export async function validateCoupon(
  code: string,
  subtotalInPaisa: number,
): Promise<ValidateCouponResult> {
  const res = await api.post<ApiSuccessResponse<ValidateCouponResult>>(
    '/coupons/validate',
    { code, subtotalInPaisa },
  );
  return res.data.data;
}
