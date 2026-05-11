import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const ADDRESSES_KEY = (userId: string | undefined) => ['addresses', userId];

export function useAddresses() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<ApiAddress[]>({
    queryKey: ADDRESSES_KEY(userId),
    queryFn: fetchMyAddresses,
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation<ApiAddress, Error, AddressInput>({
    mutationFn: createAddress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) });
    },
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation<ApiAddress, Error, { id: string; patch: UpdateAddressInput }>({
    mutationFn: ({ id, patch }) => updateAddress(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) });
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation<void, Error, string>({
    mutationFn: deleteAddress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) });
    },
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation<ApiAddress, Error, string>({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADDRESSES_KEY(userId) });
    },
  });
}
