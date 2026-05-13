import { api } from '@/lib/api';
import type { ApiOrder, PaginatedData } from '@/types/api';

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

export const fetchAdminOrders = (params: AdminOrderParams): Promise<OrdersResponse> =>
  api
    .get<OrdersResponse>('/admin/orders', { params })
    .then((r: { data: OrdersResponse }) => r.data);

export const fetchAdminOrderById = (id: string): Promise<ApiOrder> =>
  api
    .get<OrderResponse>(`/admin/orders/${id}`)
    .then((r: { data: OrderResponse }) => r.data.data);

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
