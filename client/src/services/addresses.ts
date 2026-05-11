import { api } from '../lib/api';
import type { ApiAddress } from '../types/api';
import type { ApiSuccessResponse, AddressInput, UpdateAddressInput } from '@superstore/shared';

export async function fetchMyAddresses(): Promise<ApiAddress[]> {
  const res = await api.get<ApiSuccessResponse<ApiAddress[]>>('/addresses');
  return res.data.data;
}

export async function createAddress(input: AddressInput): Promise<ApiAddress> {
  const res = await api.post<ApiSuccessResponse<ApiAddress>>('/addresses', input);
  return res.data.data;
}

export async function updateAddress(
  id: string,
  patch: UpdateAddressInput,
): Promise<ApiAddress> {
  const res = await api.patch<ApiSuccessResponse<ApiAddress>>(
    `/addresses/${id}`,
    patch,
  );
  return res.data.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<ApiAddress> {
  const res = await api.patch<ApiSuccessResponse<ApiAddress>>(
    `/addresses/${id}/default`,
  );
  return res.data.data;
}
