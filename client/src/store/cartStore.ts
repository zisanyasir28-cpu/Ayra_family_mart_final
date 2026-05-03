import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem } from '@superstore/shared';

interface CartState {
  cart: Cart;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setCoupon: (code: string | null, discountInPaisa: number) => void;
}

const EMPTY_CART: Cart = {
  items: [],
  subtotalInPaisa: 0,
  discountInPaisa: 0,
  shippingInPaisa: 0,
  totalInPaisa: 0,
  couponCode: null,
};

function recalculate(cart: Cart): Cart {
  const subtotalInPaisa = cart.items.reduce(
    (sum, item) => sum + item.priceInPaisa * item.quantity,
    0,
  );
  const totalInPaisa = Math.max(
    0,
    subtotalInPaisa - cart.discountInPaisa + cart.shippingInPaisa,
  );
  return { ...cart, subtotalInPaisa, totalInPaisa };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: EMPTY_CART,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.cart.items.find(
            (i) => i.productId === newItem.productId,
          );
          const items = existing
            ? state.cart.items.map((i) =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i,
              )
            : [...state.cart.items, newItem];
          return { cart: recalculate({ ...state.cart, items }) };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const items =
            quantity <= 0
              ? state.cart.items.filter((i) => i.productId !== productId)
              : state.cart.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i,
                );
          return { cart: recalculate({ ...state.cart, items }) };
        }),

      removeItem: (productId) =>
        set((state) => {
          const items = state.cart.items.filter(
            (i) => i.productId !== productId,
          );
          return { cart: recalculate({ ...state.cart, items }) };
        }),

      clearCart: () => set({ cart: EMPTY_CART }),

      setCoupon: (couponCode, discountInPaisa) =>
        set((state) => ({
          cart: recalculate({ ...state.cart, couponCode, discountInPaisa }),
        })),
    }),
    { name: 'superstore-cart' },
  ),
);
