import { api } from '../lib/api';
import type { ApiBrand } from '../types/api';
import type { ApiSuccessResponse } from '@superstore/shared';

// ─── Public ───────────────────────────────────────────────────────────────────

/** Active brands that have at least one active product, with product counts. */
export async function fetchBrands(): Promise<ApiBrand[]> {
  const res = await api.get<ApiSuccessResponse<ApiBrand[]>>('/brands');
  return res.data.data;
}
