import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminCustomers,
  fetchAdminCustomerById,
  banCustomer,
  unbanCustomer,
  type AdminCustomerParams,
} from '@/services/adminCustomers';

export function useAdminCustomers(params: AdminCustomerParams) {
  return useQuery({
    queryKey: ['admin-customers', params],
    queryFn:  () => fetchAdminCustomers(params),
    staleTime: 30_000,
  });
}

export function useAdminCustomerById(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-customer', id],
    queryFn:  () => fetchAdminCustomerById(id!),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

export function useBanCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => banCustomer(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-customers'] });
      void qc.invalidateQueries({ queryKey: ['admin-customer'] });
    },
  });
}

export function useUnbanCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unbanCustomer(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-customers'] });
      void qc.invalidateQueries({ queryKey: ['admin-customer'] });
    },
  });
}
