import { api } from '@/lib/api';
import type { ApiCoupon, PaginatedData } from '@/types/api';
import type { CreateCouponInput, UpdateCouponInput } from '@superstore/shared';

export interface AdminCouponsParams {
  page?:   number;
  limit?:  number;
  search?: string;
  status?: 'all' | 'active' | 'expired' | 'upcoming' | 'exhausted';
}

type CouponsResponse = { success: true } & PaginatedData<ApiCoupon>;
type CouponResponse  = { success: true; data: ApiCoupon };

export async function fetchAdminCoupons(params: AdminCouponsParams): Promise<CouponsResponse> {
  const r = await api.get<CouponsResponse>('/coupons', { params });
  return r.data;
}

export async function createCoupon(input: CreateCouponInput): Promise<ApiCoupon> {
  const r = await api.post<CouponResponse>('/coupons', input);
  return r.data.data;
}

export async function updateCoupon(id: string, input: UpdateCouponInput): Promise<ApiCoupon> {
  const r = await api.patch<CouponResponse>(`/coupons/${id}`, input);
  return r.data.data;
}

export async function toggleCoupon(id: string): Promise<ApiCoupon> {
  const r = await api.patch<CouponResponse>(`/coupons/${id}/toggle`);
  return r.data.data;
}

export async function deleteCoupon(id: string): Promise<void> {
  await api.delete(`/coupons/${id}`);
}

// ─── Helpers used by the create dialog ────────────────────────────────────────

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateCouponCode(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
