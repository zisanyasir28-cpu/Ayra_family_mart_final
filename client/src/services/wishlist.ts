import { api } from '@/lib/api';
import type { ApiWishlistItem } from '@/types/api';
import type { ApiSuccessResponse } from '@superstore/shared';

type WishlistResponse = ApiSuccessResponse<ApiWishlistItem[]>;
type ToggleResponse   = ApiSuccessResponse<{ added: boolean }>;

// ─── Fetch Wishlist ───────────────────────────────────────────────────────────

export async function fetchWishlist(): Promise<ApiWishlistItem[]> {
  try {
    const r = await api.get<WishlistResponse>('/wishlist');
    return r.data.data;
  } catch {
    // In demo mode there is no real wishlist — caller uses wishlistStore.ids
    return [];
  }
}

// ─── Toggle (add / remove) ────────────────────────────────────────────────────

export async function toggleWishlistItem(productId: string): Promise<{ added: boolean }> {
  try {
    const r = await api.post<ToggleResponse>('/wishlist/toggle', { productId });
    return r.data.data;
  } catch {
    // In demo mode the wishlistStore handles local state; just throw so the
    // caller can decide whether to revert the optimistic update.
    throw new Error('API_UNAVAILABLE');
  }
}
