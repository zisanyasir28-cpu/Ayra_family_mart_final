import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  priceInPaisa: number;
  quantity: number;
  stock: number;
  unit: string;
}

export interface AppliedCoupon {
  code: string;
  discountInPaisa: number;
}

// ─── Key match helper ─────────────────────────────────────────────────────────

function sameItem(a: CartItem, productId: string, variantId?: string): boolean {
  return a.productId === productId && a.variantId === variantId;
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;

  // ── Computed selectors (call as functions) ──────────────────────────────────
  itemCount: () => number;
  subtotalInPaisa: () => number;
  deliveryFeeInPaisa: () => number;
  totalInPaisa: () => number;

  // ── Actions ─────────────────────────────────────────────────────────────────
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discountInPaisa: number) => void;
  removeCoupon: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      // ── Selectors ────────────────────────────────────────────────────────────
      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),

      subtotalInPaisa: () =>
        get().items.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0),

      deliveryFeeInPaisa: () => {
        const sub = get().items.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0);
        return sub > 0 && sub < 99_900 ? 6_000 : 0;
      },

      totalInPaisa: () => {
        const sub = get().items.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0);
        const delivery = sub > 0 && sub < 99_900 ? 6_000 : 0;
        const discount = get().coupon?.discountInPaisa ?? 0;
        return Math.max(0, sub + delivery - discount);
      },

      // ── Actions ──────────────────────────────────────────────────────────────
      addItem: ({ quantity = 1, ...item }) =>
        set((state) => {
          const existing = state.items.find((i) =>
            sameItem(i, item.productId, item.variantId),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameItem(i, item.productId, item.variantId)
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.stock) },
            ],
          };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !sameItem(i, productId, variantId)),
        })),

      updateQuantity: (productId, quantity, variantId) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => !sameItem(i, productId, variantId)),
            };
          }
          return {
            items: state.items.map((i) =>
              sameItem(i, productId, variantId)
                ? { ...i, quantity: Math.min(quantity, i.stock) }
                : i,
            ),
          };
        }),

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (code, discountInPaisa) =>
        set({ coupon: { code, discountInPaisa } }),

      removeCoupon: () => set({ coupon: null }),
    }),
    { name: 'ayra-cart' },
  ),
);
