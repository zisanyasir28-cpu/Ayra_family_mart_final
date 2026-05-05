import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ChevronRight,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { formatPaisa } from '@/lib/utils';
import { api } from '@/lib/api';

interface CouponResponse {
  success: true;
  data: { code: string; discountInPaisa: number };
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items,
    coupon,
    itemCount,
    subtotalInPaisa,
    deliveryFeeInPaisa,
    totalInPaisa,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post<CouponResponse>('/coupons/validate', {
        code,
        subtotalInPaisa: subtotalInPaisa(),
      });
      applyCoupon(data.data.code, data.data.discountInPaisa);
      setCouponInput('');
      toast.success(`Coupon "${data.data.code}" applied!`);
    } catch {
      toast.error('Invalid or expired coupon code');
    } finally {
      setCouponLoading(false);
    }
  }

  const count    = itemCount();
  const sub      = subtotalInPaisa();
  const delivery = deliveryFeeInPaisa();
  const discount = coupon?.discountInPaisa ?? 0;
  const total    = totalInPaisa();
  const freeDeliveryThreshold = 99_900;
  const amountToFreeDelivery  = freeDeliveryThreshold - sub;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────────── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* ── Drawer panel ──────────────────────────────────────────────── */}
          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card shadow-2xl sm:w-[420px]"
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                <h2 className="text-base font-semibold text-foreground">My Cart</h2>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700"
                  >
                    {count} {count === 1 ? 'item' : 'items'}
                  </motion.span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Free delivery progress bar ───────────────────────────────── */}
            {count > 0 && (
              <div className="border-b border-border bg-green-50/60 px-5 py-2.5">
                {delivery === 0 ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <Truck className="h-3.5 w-3.5" />
                    You unlocked free delivery! 🎉
                  </p>
                ) : (
                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">
                      Add{' '}
                      <span className="font-semibold text-green-700">
                        {formatPaisa(amountToFreeDelivery)}
                      </span>{' '}
                      more for free delivery
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-100">
                      <motion.div
                        className="h-full rounded-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (sub / freeDeliveryThreshold) * 100)}%`,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {count === 0 ? (
              /* ── Empty state ────────────────────────────────────────────── */
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted">
                    <ShoppingBag className="h-14 w-14 text-muted-foreground/40" />
                  </div>
                  <span className="absolute -right-1 -top-1 text-3xl">🛒</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Looks like you haven't added anything yet.
                  </p>
                </div>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-1.5 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Browse Products
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* ── Item list ──────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const key = `${item.productId}-${item.variantId ?? ''}`;
                      return (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.22 }}
                          className="mb-3"
                        >
                          <div className="flex gap-3 rounded-xl border border-border bg-muted/30 p-3">
                            {/* Image */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl">
                                  🛍️
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.unit}
                              </p>
                              <p className="mt-1 text-sm font-bold text-green-700">
                                {formatPaisa(item.priceInPaisa * item.quantity)}
                              </p>
                              {item.quantity >= item.stock && (
                                <p className="text-[10px] font-medium text-amber-600">
                                  Max stock reached
                                </p>
                              )}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col items-end justify-between">
                              <button
                                onClick={() =>
                                  removeItem(item.productId, item.variantId)
                                }
                                className="rounded-md p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                      item.variantId,
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-muted"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center text-sm font-semibold tabular-nums text-foreground">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity + 1,
                                      item.variantId,
                                    )
                                  }
                                  disabled={item.quantity >= item.stock}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <div className="shrink-0 border-t border-border bg-card px-5 py-4">
                  {/* Coupon */}
                  <div className="mb-4">
                    {coupon ? (
                      <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">
                            {coupon.code}
                          </span>
                          <span className="text-xs text-green-600">
                            −{formatPaisa(coupon.discountInPaisa)} off
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-medium text-red-500 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={(e) =>
                            setCouponInput(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) =>
                            e.key === 'Enter' && void handleApplyCoupon()
                          }
                          placeholder="Coupon code"
                          className="flex-1 rounded-xl border border-border bg-muted px-3 py-2 text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        />
                        <button
                          onClick={() => void handleApplyCoupon()}
                          disabled={!couponInput.trim() || couponLoading}
                          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {couponLoading ? '…' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-foreground">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPaisa(sub)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      {delivery === 0 ? (
                        <span className="font-semibold text-green-600">FREE</span>
                      ) : (
                        <span className="font-medium">{formatPaisa(delivery)}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon discount</span>
                        <span className="font-semibold">
                          −{formatPaisa(discount)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="my-3 border-t border-border" />

                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {formatPaisa(total)}
                    </span>
                  </div>

                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]"
                  >
                    Proceed to Checkout
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={onClose}
                    className="mt-2 w-full rounded-xl py-2.5 text-center text-sm font-medium text-muted-foreground transition hover:bg-muted"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
