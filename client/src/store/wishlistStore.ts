import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Interface ────────────────────────────────────────────────────────────────

interface WishlistState {
  ids:          string[];
  isWishlisted: (productId: string) => boolean;
  toggle:       (productId: string) => void;
  setAll:       (productIds: string[]) => void;
  clear:        () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],

      isWishlisted: (productId) => get().ids.includes(productId),

      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),

      setAll: (productIds) => set({ ids: productIds }),

      clear: () => set({ ids: [] }),
    }),
    {
      name:    'wishlist',
      version: 1,
    },
  ),
);
