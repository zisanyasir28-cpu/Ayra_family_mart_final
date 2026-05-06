import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { formatPaisa } from '@/lib/utils';
import { api } from '@/lib/api';
import { BasketIcon, PlusIcon, MinusIcon, ArrowRightIcon } from './common/HandIcon';

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
      toast.success(`Coupon "${data.data.code}" applied.`);
    } catch {
      toast.error('Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  }

  const count    = itemCount();
  const sub      = subtotalInPaisa();
  const delivery = deliveryFeeInPaisa();
  const discount = coupon?.discountInPaisa ?? 0;
  const total    = totalInPaisa();
  const FREE_DELIVERY_THRESHOLD = 99_900;
  const amountToFree = FREE_DELIVERY_THRESHOLD - sub;
  const progressPct  = Math.min(100, (sub / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm"
          />

          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-line bg-surface shadow-lift sm:w-[440px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron text-bg">
                  <BasketIcon size={18} strokeWidth={1.7} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-cream">Your basket</h2>
                  {count > 0 && (
                    <p className="text-xs text-cream/55">
                      {count} {count === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-cream/5 hover:text-cream active:scale-90"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Free delivery progress */}
            <AnimatePresence>
              {count > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-line bg-surface-2 px-6 py-3"
                >
                  {delivery === 0 ? (
                    <p className="flex items-center gap-2 text-xs font-semibold text-saffron">
                      <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
                      You unlocked free delivery.
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-xs text-cream/65">
                        Add{' '}
                        <span className="font-bold text-saffron">{formatPaisa(amountToFree)}</span>
                        {' '}more for <span className="font-bold text-cream">free delivery</span>
                      </p>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-saffron to-coral"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {count === 0 ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-bg text-cream/30"
                >
                  <BasketIcon size={48} strokeWidth={1.2} />
                </motion.div>
                <div>
                  <p className="font-display text-xl font-bold text-cream">Your basket is empty</p>
                  <p className="mt-1 text-sm text-cream/55">Add a few things to get started.</p>
                </div>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="group inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-bg transition-all hover:bg-cream"
                >
                  Browse products
                  <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const key = `${item.productId}-${item.variantId ?? ''}`;
                      return (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{    opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.22 }}
                          className="mb-4 border-b border-line pb-4 last:border-0"
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl opacity-40">🛍️</div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-cream">
                                {item.name}
                              </p>
                              <p className="mt-0.5 text-xs text-cream/45">{item.unit}</p>
                              <p className="mt-1 font-display text-base font-bold text-saffron">
                                {formatPaisa(item.priceInPaisa * item.quantity)}
                              </p>

                              {/* Bottom row: qty + remove */}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-1 rounded-full border border-line bg-bg p-0.5">
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-cream transition hover:bg-cream/10 active:scale-90"
                                  >
                                    <MinusIcon size={12} />
                                  </button>
                                  <span className="min-w-[1.5rem] text-center font-display text-sm font-bold text-cream tabular-nums">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                    disabled={item.quantity >= item.stock}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron text-bg transition hover:bg-cream active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <PlusIcon size={12} />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeItem(item.productId, item.variantId)}
                                  className="rounded-full p-1.5 text-cream/45 transition hover:bg-coral/10 hover:text-coral active:scale-90"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
                <div className="shrink-0 border-t border-line bg-surface px-6 py-5">
                  {/* Coupon */}
                  <div className="mb-4">
                    {coupon ? (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-between rounded-full border border-saffron/30 bg-saffron/10 px-4 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-saffron" />
                          <span className="font-display text-sm font-bold text-saffron">{coupon.code}</span>
                          <span className="text-xs text-saffron/85">−{formatPaisa(coupon.discountInPaisa)}</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-semibold text-coral hover:text-cream"
                        >
                          Remove
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cream/45" />
                          <input
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && void handleApplyCoupon()}
                            placeholder="Coupon code"
                            className="w-full rounded-full border border-line bg-bg py-2.5 pl-10 pr-3 text-sm font-semibold uppercase tracking-widest text-cream placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-cream/35 focus:border-saffron focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => void handleApplyCoupon()}
                          disabled={!couponInput.trim() || couponLoading}
                          className="rounded-full bg-saffron px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-bg transition hover:bg-cream active:scale-95 disabled:opacity-50"
                        >
                          {couponLoading ? '…' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-cream/65">
                      <span>Subtotal</span>
                      <span className="text-cream">{formatPaisa(sub)}</span>
                    </div>
                    <div className="flex justify-between text-cream/65">
                      <span>Delivery</span>
                      {delivery === 0 ? (
                        <span className="font-bold text-saffron">FREE</span>
                      ) : (
                        <span className="text-cream">{formatPaisa(delivery)}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-saffron">
                        <span>Discount</span>
                        <span className="font-bold">−{formatPaisa(discount)}</span>
                      </div>
                    )}
                    <div className="my-3 h-px bg-line" />
                    <div className="flex items-end justify-between">
                      <span className="font-display text-base font-bold text-cream">Total</span>
                      <span className="font-display text-2xl font-black text-saffron">{formatPaisa(total)}</span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="group/co mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-saffron py-4 text-sm font-bold uppercase tracking-[0.18em] text-bg transition-all hover:bg-cream hover:shadow-saffron active:scale-[0.98]"
                  >
                    Proceed to checkout
                    <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover/co:translate-x-1" />
                  </Link>
                  <button
                    onClick={onClose}
                    className="mt-2 w-full rounded-full py-2.5 text-center text-xs uppercase tracking-[0.18em] text-cream/55 transition hover:text-cream"
                  >
                    Continue shopping
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
