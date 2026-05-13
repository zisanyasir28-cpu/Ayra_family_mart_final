import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminOrders,
  fetchAdminOrderById,
  updateOrderStatus,
  type AdminOrderParams,
} from '@/services/adminOrders';

export function useAdminOrders(params: AdminOrderParams) {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn:  () => fetchAdminOrders(params),
    staleTime: 30_000,
  });
}

export function useAdminOrderById(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn:  () => fetchAdminOrderById(id!),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note: string }) =>
      updateOrderStatus(id, status, note),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['admin-order', id] });
      void qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}
