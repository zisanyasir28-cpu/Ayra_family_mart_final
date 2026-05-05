import { useCartStore } from '../store/cartStore';
import type { ApiProduct } from '../types/api';

/**
 * Convenience hook — wraps cartStore and provides product-aware helpers
 * for use in ProductCard / product detail page.
 */
export function useCart() {
  const store = useCartStore();

  function getItemQuantity(productId: string): number {
    return (
      store.items.find((i) => i.productId === productId)?.quantity ?? 0
    );
  }

  function addToCart(product: ApiProduct, quantity = 1): void {
    const image = product.images[0]?.url ?? '';
    store.addItem({
      productId:    product.id,
      name:         product.name,
      slug:         product.slug,
      image,
      priceInPaisa: product.effectivePriceInPaisa,
      stock:        product.stockQuantity,
      unit:         product.unit,
      quantity,
    });
  }

  function increment(productId: string, currentQty: number, max: number): void {
    if (currentQty < max) store.updateQuantity(productId, currentQty + 1);
  }

  function decrement(productId: string, currentQty: number): void {
    if (currentQty > 1) {
      store.updateQuantity(productId, currentQty - 1);
    } else {
      store.removeItem(productId);
    }
  }

  return {
    items:          store.items,
    coupon:         store.coupon,
    addToCart,
    updateQuantity: store.updateQuantity,
    removeItem:     store.removeItem,
    clearCart:      store.clearCart,
    applyCoupon:    store.applyCoupon,
    removeCoupon:   store.removeCoupon,
    getItemQuantity,
    increment,
    decrement,
    totalItems:     store.itemCount(),
  };
}
