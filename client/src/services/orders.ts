import { api } from '../lib/api';
import type { ApiOrder, PaginatedData } from '../types/api';
import type { CreateOrderInput, ApiSuccessResponse, PaginationMeta } from '@superstore/shared';

export interface CreateOrderResult {
  order:       ApiOrder;
  gatewayUrl?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const res = await api.post<ApiSuccessResponse<CreateOrderResult>>('/orders', input);
  return res.data.data;
}

export interface MyOrdersParams {
  page?:   number;
  limit?:  number;
  status?: string;
}

export async function fetchMyOrders(params: MyOrdersParams = {}): Promise<PaginatedData<ApiOrder>> {
  const query: Record<string, string> = {};
  if (params.page  != null) query['page']  = String(params.page);
  if (params.limit != null) query['limit'] = String(params.limit);
  if (params.status)        query['status'] = params.status;

  const res = await api.get<{
    success: true;
    data: ApiOrder[];
    meta: { pagination: PaginationMeta };
  }>('/orders/me', { params: query });

  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchMyOrderById(id: string): Promise<ApiOrder> {
  const res = await api.get<ApiSuccessResponse<ApiOrder>>(`/orders/me/${id}`);
  return res.data.data;
}

export async function cancelOrder(id: string, reason?: string): Promise<ApiOrder> {
  const res = await api.patch<ApiSuccessResponse<ApiOrder>>(
    `/orders/me/${id}/cancel`,
    { reason },
  );
  return res.data.data;
}

export async function validateCoupon(
  code: string,
  subtotalInPaisa: number,
): Promise<{ code: string; discountInPaisa: number }> {
  const res = await api.post<ApiSuccessResponse<{ code: string; discountInPaisa: number }>>(
    '/coupons/validate',
    { code, subtotalInPaisa },
  );
  return res.data.data;
}
