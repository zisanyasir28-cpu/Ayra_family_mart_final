import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingBag, Plus, Minus, Trash2, Tag, ChevronRight, Truck,
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
  open:    boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items, coupon, itemCount, subtotalInPaisa,
    deliveryFeeInPaisa, totalInPaisa,
    updateQuantity, removeItem, applyCoupon, removeCoupon,
  } = useCartStore();

  const [couponInput,   setCouponInput]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post<CouponResponse>('/coupons/validate', {
        code, subtotalInPaisa: subtotalInPaisa(),
      });
      applyCoupon(data.data.code, data.data.discountInPaisa);
      setCouponInput('');
      toast.success(`Coupon "${data.data.code}" applied! 🎉`);
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
  const amountToFree          = freeDeliveryThreshold - sub;
  const progressPct           = Math.min(100, (sub / freeDeliveryThreshold) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card shadow-float sm:w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-green-50 to-teal-50/50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-600 shadow-sm">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-foreground">My Cart</h2>
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700"
                    >
                      {count} {count === 1 ? 'item' : 'items'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted active:scale-90"
                aria-label="Close cart"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Free delivery progress */}
            <AnimatePresence>
              {count > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-border bg-green-50/60 px-5 py-3"
                >
                  {delivery === 0 ? (
                    <p className="flex items-center gap-2 text-xs font-semibold text-green-700">
                      <Truck className="h-4 w-4" />
                      🎉 You unlocked free delivery!
                    </p>
                  ) : (
                    <>
                      <p className="mb-1.5 text-xs text-muted-foreground">
                        Add{' '}
                        <span className="font-bold text-green-700">{formatPaisa(amountToFree)}</span>
                        {' '}more for <span className="font-bold text-green-700">free delivery</span>
                      </p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-green-100">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Body */}
            {count === 0 ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="relative"
                >
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-muted">
                    <ShoppingBag className="h-14 w-14 text-muted-foreground/30" />
                  </div>
                  <motion.span
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-2 -top-2 text-3xl"
                  >
                    🛒
                  </motion.span>
                </motion.div>
                <div>
                  <p className="text-lg font-bold text-foreground">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Looks like you haven't added anything yet.
                  </p>
                </div>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-2xl bg-green-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
                >
                  Browse Products
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Item list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const key = `${item.productId}-${item.variantId ?? ''}`;
                      return (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.22 }}
                          className="mb-3"
                        >
                          <div className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover">
                            {/* Image */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 text-2xl">
                                  🛍️
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                                {item.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{item.unit}</p>
                              <p className="mt-1 text-sm font-bold text-green-700">
                                {formatPaisa(item.priceInPaisa * item.quantity)}
                              </p>
                              {item.quantity >= item.stock && (
                                <p className="text-[10px] font-semibold text-amber-600">
                                  Max stock reached
                                </p>
                              )}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col items-end justify-between gap-2">
                              <button
                                onClick={() => removeItem(item.productId, item.variantId)}
                                className="rounded-lg p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-500 active:scale-90"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                              <div className="flex items-center gap-0.5 rounded-xl border-2 border-green-200 bg-green-50 p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg text-green-700 transition hover:bg-green-100 active:scale-90"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="min-w-[1.5rem] text-center text-sm font-extrabold text-green-800 tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                  disabled={item.quantity >= item.stock}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
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

                {/* Footer */}
                <div className="shrink-0 border-t border-border bg-card px-5 py-4">
                  {/* Coupon */}
                  <div className="mb-4">
                    {coupon ? (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-between rounded-2xl bg-green-50 border border-green-200 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-bold text-green-700">{coupon.code}</span>
                          <span className="rounded-lg bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600">
                            −{formatPaisa(coupon.discountInPaisa)}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && void handleApplyCoupon()}
                            placeholder="Coupon code"
                            className="w-full rounded-2xl border border-border bg-muted py-2.5 pl-9 pr-3 text-sm font-semibold uppercase tracking-widest placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          />
                        </div>
                        <button
                          onClick={() => void handleApplyCoupon()}
                          disabled={!couponInput.trim() || couponLoading}
                          className="rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
                        >
                          {couponLoading ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white inline-block" />
                          ) : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order summary */}
                  <div className="space-y-2 rounded-2xl bg-muted/50 px-4 py-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatPaisa(sub)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      {delivery === 0 ? (
                        <span className="font-bold text-green-600">FREE</span>
                      ) : (
                        <span className="font-semibold">{formatPaisa(delivery)}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon discount</span>
                        <span className="font-bold">−{formatPaisa(discount)}</span>
                      </div>
                    )}
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="text-lg font-extrabold text-green-700">{formatPaisa(total)}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Link
                      to="/checkout"
                      onClick={onClose}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-glow-green active:scale-[0.98]"
                    >
                      Proceed to Checkout
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={onClose}
                      className="w-full rounded-2xl py-2.5 text-center text-sm font-semibold text-muted-foreground transition hover:bg-muted active:scale-95"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
