import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyOrders,
  fetchMyOrderById,
  cancelOrder,
  type MyOrdersParams,
} from '../services/orders';
import { useAuthStore } from '../store/authStore';

export function useMyOrders(params: MyOrdersParams = {}) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: ['my-orders', userId, params],
    queryFn:  () => fetchMyOrders(params),
    enabled:  !!userId,
    staleTime: 30_000,
  });
}

export function useMyOrderById(id: string | undefined) {
  return useQuery({
    queryKey: ['my-order', id],
    queryFn:  () => fetchMyOrderById(id!),
    enabled:  !!id,
    staleTime: 15_000,
  });
}

export function useCancelMyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelOrder(id, reason),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['my-order', vars.id] });
    },
  });
}
