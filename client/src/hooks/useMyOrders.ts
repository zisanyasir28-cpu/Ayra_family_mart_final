import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyOrders,
  fetchMyOrderById,
  cancelMyOrder,
} from '../services/orders';
import { useAuthStore } from '../store/authStore';
import type { OrdersListResult } from '../services/orders';
import type { ApiOrder } from '../types/api';
import type { OrderQueryInput } from '@superstore/shared';

const ORDERS_KEY = (userId: string | undefined, params: object) =>
  ['orders', userId, params] as const;
const ORDER_DETAIL_KEY = (id: string) => ['orders', 'detail', id] as const;

export function useMyOrders(params: Partial<OrderQueryInput> = {}) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<OrdersListResult>({
    queryKey: ORDERS_KEY(userId, params),
    queryFn: () => fetchMyOrders(params),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useMyOrderById(id: string | undefined) {
  return useQuery<ApiOrder>({
    queryKey: ORDER_DETAIL_KEY(id ?? ''),
    queryFn: () => fetchMyOrderById(id as string),
    enabled: Boolean(id),
  });
}

export function useCancelMyOrder() {
  const qc = useQueryClient();
  return useMutation<ApiOrder, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => cancelMyOrder(id, reason),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.setQueryData(ORDER_DETAIL_KEY(order.id), order);
    },
  });
}
