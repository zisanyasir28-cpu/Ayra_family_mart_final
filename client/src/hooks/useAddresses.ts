import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../services/addresses';
import { useAuthStore } from '../store/authStore';
import type { ApiAddress } from '../types/api';
import type { AddressInput, UpdateAddressInput } from '@superstore/shared';

const KEY = (userId: string | null) => ['addresses', userId];

export function useAddresses() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery<ApiAddress[]>({
    queryKey: KEY(userId),
    queryFn:  fetchMyAddresses,
    enabled:  !!userId,
    staleTime: 60_000,
  });
}

export function useCreateAddress() {
  const qc     = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useMutation({
    mutationFn: (input: AddressInput) => createAddress(input),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY(userId) }),
  });
}

export function useUpdateAddress() {
  const qc     = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAddressInput }) =>
      updateAddress(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY(userId) }),
  });
}

export function useDeleteAddress() {
  const qc     = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY(userId) }),
  });
}

export function useSetDefaultAddress() {
  const qc     = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY(userId) }),
  });
}
