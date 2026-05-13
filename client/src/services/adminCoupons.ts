import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demoMode';
import { demoCoupons } from '@/lib/demoData';
import type { ApiCoupon, PaginatedData } from '@/types/api';
import type { CreateCouponInput, UpdateCouponInput, PaginationMeta } from '@superstore/shared';

export interface AdminCouponsParams {
  page?:   number;
  limit?:  number;
  search?: string;
  status?: 'all' | 'active' | 'expired' | 'upcoming' | 'exhausted';
}

type CouponsResponse = { success: true } & PaginatedData<ApiCoupon>;
type CouponResponse  = { success: true; data: ApiCoupon };

function filterDemoCoupons(params: AdminCouponsParams): ApiCoupon[] {
  let rows = demoCoupons;
  if (params.search) {
    const q = params.search.toUpperCase();
    rows = rows.filter((c) => c.code.includes(q));
  }
  if (params.status && params.status !== 'all') {
    rows = rows.filter((c) => c.status === params.status);
  }
  return rows;
}

export async function fetchAdminCoupons(params: AdminCouponsParams): Promise<CouponsResponse> {
  if (DEMO_MODE) {
    const filtered = filterDemoCoupons(params);
    const limit = params.limit ?? 20;
    return {
      success: true,
      data:    filtered,
      meta:    {
        pagination: {
          page:        params.page ?? 1,
          limit,
          total:       filtered.length,
          totalPages:  1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    };
  }

  try {
    const r = await api.get<CouponsResponse>('/coupons', { params });
    return r.data;
  } catch {
    const filtered = filterDemoCoupons(params);
    const limit = params.limit ?? 20;
    return {
      success: true,
      data:    filtered,
      meta:    {
        pagination: {
          page:        params.page ?? 1,
          limit,
          total:       filtered.length,
          totalPages:  1,
          hasNextPage: false,
          hasPrevPage: false,
        } satisfies PaginationMeta,
      },
    };
  }
}

function demoBlocked<T>(msg = 'Demo mode — changes not saved'): Promise<T> {
  toast.error(msg);
  return Promise.reject(new Error(msg));
}

export async function createCoupon(input: CreateCouponInput): Promise<ApiCoupon> {
  if (DEMO_MODE) return demoBlocked();
  const r = await api.post<CouponResponse>('/coupons', input);
  return r.data.data;
}

export async function updateCoupon(id: string, input: UpdateCouponInput): Promise<ApiCoupon> {
  if (DEMO_MODE) return demoBlocked();
  const r = await api.patch<CouponResponse>(`/coupons/${id}`, input);
  return r.data.data;
}

export async function toggleCoupon(id: string): Promise<ApiCoupon> {
  if (DEMO_MODE) return demoBlocked();
  const r = await api.patch<CouponResponse>(`/coupons/${id}/toggle`);
  return r.data.data;
}

export async function deleteCoupon(id: string): Promise<void> {
  if (DEMO_MODE) return demoBlocked();
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
