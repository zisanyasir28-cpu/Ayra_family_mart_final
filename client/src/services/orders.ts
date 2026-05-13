import { api } from '../lib/api';
import type { ApiOrder, PaginatedData } from '../types/api';
import type { CreateOrderInput, ApiSuccessResponse, PaginationMeta } from '@superstore/shared';
import { demoOrders } from '../lib/demoData';

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

  try {
    const res = await api.get<{
      success: true;
      data: ApiOrder[];
      meta: { pagination: PaginationMeta };
    }>('/orders/me', { params: query });
    return { data: res.data.data, meta: res.data.meta };
  } catch {
    const filtered = params.status
      ? demoOrders.filter((o) => o.status === params.status)
      : demoOrders;
    const limit = params.limit ?? 10;
    return {
      data: filtered,
      meta: { pagination: { page: params.page ?? 1, limit, total: filtered.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } },
    };
  }
}

export async function fetchMyOrderById(id: string): Promise<ApiOrder> {
  try {
    const res = await api.get<ApiSuccessResponse<ApiOrder>>(`/orders/me/${id}`);
    return res.data.data;
  } catch {
    return demoOrders.find((o) => o.id === id) ?? demoOrders[0]!;
  }
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
  try {
    const res = await api.post<ApiSuccessResponse<{ code: string; discountInPaisa: number }>>(
      '/coupons/validate',
      { code, subtotalInPaisa },
    );
    return res.data.data;
  } catch {
    // Demo coupon: DEMO10 = 10% off, max ৳100
    if (code.toUpperCase() === 'DEMO10') {
      const discount = Math.min(Math.round(subtotalInPaisa * 0.1), 10000);
      return { code: 'DEMO10', discountInPaisa: discount };
    }
    throw new Error('Invalid coupon code');
  }
}
