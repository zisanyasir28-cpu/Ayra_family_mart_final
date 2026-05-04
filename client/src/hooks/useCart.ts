import { useCartStore } from '../store/cartStore';
import type { ApiProduct } from '../types/api';

/**
 * Convenience hook that wraps cartStore and provides
 * product-aware helpers for the product card / detail page.
 */
export function useCart() {
  const { cart, addItem, updateQuantity, removeItem, clearCart, setCoupon } =
    useCartStore();

  function getItemQuantity(productId: string): number {
    return cart.items.find((i) => i.productId === productId)?.quantity ?? 0;
  }

  function addToCart(product: ApiProduct, quantity = 1): void {
    addItem({
      productId: product.id,
      quantity,
      priceInPaisa: product.effectivePriceInPaisa,
      product: {
        id:            product.id,
        name:          product.name,
        slug:          product.slug,
        images:        product.images,
        stockQuantity: product.stockQuantity,
        unit:          product.unit,
      },
    });
  }

  function increment(productId: string, currentQty: number, max: number): void {
    if (currentQty < max) updateQuantity(productId, currentQty + 1);
  }

  function decrement(productId: string, currentQty: number): void {
    if (currentQty > 1) {
      updateQuantity(productId, currentQty - 1);
    } else {
      removeItem(productId);
    }
  }

  return {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setCoupon,
    getItemQuantity,
    increment,
    decrement,
    totalItems: cart.items.reduce((s, i) => s + i.quantity, 0),
  };
}
