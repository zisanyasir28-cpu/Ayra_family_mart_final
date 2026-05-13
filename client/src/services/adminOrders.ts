import { api } from '@/lib/api';
import type { ApiOrder, PaginatedData } from '@/types/api';
import { demoOrders } from '@/lib/demoData';

export interface AdminOrderParams {
  page?:     number;
  limit?:    number;
  status?:   string;
  search?:   string;
  dateFrom?: string;
  dateTo?:   string;
}

type OrdersResponse = { success: true } & PaginatedData<ApiOrder>;
type OrderResponse  = { success: true; data: ApiOrder };

export async function fetchAdminOrders(params: AdminOrderParams): Promise<OrdersResponse> {
  try {
    const r = await api.get<OrdersResponse>('/admin/orders', { params });
    return r.data;
  } catch {
    const limit = params.limit ?? 20;
    const page  = params.page  ?? 1;
    const filtered = params.status
      ? demoOrders.filter((o) => o.status === params.status)
      : demoOrders;
    return {
      success: true,
      data: filtered,
      meta: { pagination: { page, limit, total: filtered.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } },
    };
  }
}

export async function fetchAdminOrderById(id: string): Promise<ApiOrder> {
  try {
    const r = await api.get<OrderResponse>(`/admin/orders/${id}`);
    return r.data.data;
  } catch {
    return demoOrders.find((o) => o.id === id) ?? demoOrders[0]!;
  }
}

export const updateOrderStatus = (
  id: string,
  status: string,
  note: string,
): Promise<ApiOrder> =>
  api
    .patch<OrderResponse>(`/admin/orders/${id}/status`, { status, note })
    .then((r: { data: OrderResponse }) => r.data.data);

export const exportOrdersCsv = async (params: AdminOrderParams): Promise<void> => {
  const response = await api.get<Blob>('/admin/orders/export', {
    params,
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
