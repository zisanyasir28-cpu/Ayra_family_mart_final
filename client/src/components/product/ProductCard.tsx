import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn, formatPaisa } from '../../lib/utils';
import { card as cardImg } from '../../lib/cloudinary';
import { useCart } from '../../hooks/useCart';
import { HeartLineIcon, PlusIcon, MinusIcon } from '../common/HandIcon';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore }     from '../../store/authStore';
import { useThemeStore }    from '../../store/themeStore';
import { toggleWishlistItem } from '../../services/wishlist';
import type { ApiProduct } from '../../types/api';

interface ProductCardProps {
  product:    ApiProduct;
  className?: string;
  emphasis?:  boolean;
}

function ProductCardImpl({ product, className, emphasis = false }: ProductCardProps) {
  const { getItemQuantity, addToCart, increment, decrement } = useCart();
  const qty          = getItemQuantity(product.id);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock   = !isOutOfStock && product.stockQuantity <= 5;

  const { isWishlisted, toggle } = useWishlistStore();
  const { isAuthenticated }      = useAuthStore();
  const wishlisted               = isWishlisted(product.id);

  const [imgError,   setImgError]   = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const isLight = useThemeStore(s => s.resolved === 'light');

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to save to wishlist', { icon: '🔒' });
      return;
    }
    toggle(product.id);
    try {
      const { added } = await toggleWishlistItem(product.id);
      if (!added && wishlisted) return;
      if (added && !wishlisted) return;
      toggle(product.id);
    } catch {
      toggle(product.id); // rollback the optimistic toggle
      toast.error("Couldn't update wishlist. Please try again.");
    }
  }

  const firstImage = product.images[0];

  const compare = product.comparePriceInPaisa ?? product.priceInPaisa;
  const hasDiscount =
    product.activeCampaign !== null ||
    (product.comparePriceInPaisa != null &&
      product.comparePriceInPaisa > product.effectivePriceInPaisa);
  const discountPct = hasDiscount && compare > 0
    ? Math.round(((compare - product.effectivePriceInPaisa) / compare) * 100)
    : 0;

  function handleAdd() {
    addToCart(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 700);
  }

  return (
    // ── Spotlight card ────────────────────────────────────────────────────────
    // The product sits in a bright "spotlight stage" (white-bg studio photos blend
    // in seamlessly) that floats against the dark neon card body. A thin gradient
    // ring traces the edge and intensifies + lifts the card on hover.
    <div className={cn('group relative', className)} style={{ willChange: 'transform' }}>
      <div
        className={cn(
          'relative h-full rounded-3xl p-[1.5px] transition-all duration-500 ease-editorial group-hover:-translate-y-1.5',
          isLight
            ? [
                'bg-gradient-to-br from-saffron/30 via-black/5 to-sage/30',
                'group-hover:from-saffron/55 group-hover:to-sage/45',
                'group-hover:shadow-[0_22px_46px_-18px_hsl(var(--saffron)/0.4)]',
                emphasis && 'from-saffron/45 to-sage/45',
              ]
            : [
                'bg-gradient-to-br from-saffron/45 via-plum/25 to-saffron/10',
                'group-hover:from-saffron/75 group-hover:via-plum/45 group-hover:to-saffron/30',
                'group-hover:shadow-[0_24px_52px_-16px_hsl(var(--saffron)/0.55)]',
                emphasis && 'from-saffron/65 via-plum/40 to-saffron/25 shadow-[0_16px_40px_-16px_hsl(var(--saffron)/0.5)]',
              ],
        )}
      >
        <div
          className={cn(
            'glass-shine relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1.5px)]',
            isLight ? 'bg-white' : 'bg-surface',
          )}
        >
          {/* ── Bright product stage ─────────────────────────────────────── */}
          <div className="p-2.5 pb-0">
            <Link
              to={`/products/${product.slug}`}
              className="relative block aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-white to-[hsl(256_30%_92%)] shadow-[0_10px_22px_-10px_rgba(0,0,0,0.55)] ring-1 ring-black/5"
            >
              {/* Top gloss — gives the stage a premium, lit feel */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-1/3 bg-gradient-to-b from-white/70 to-transparent" />

              {firstImage && !imgError ? (
                <img
                  src={cardImg(firstImage.url)}
                  alt={firstImage.altText ?? product.name}
                  loading="lazy"
                  decoding="async"
                  onError={() => setImgError(true)}
                  className="relative z-[2] h-full w-full object-contain p-3 transition-transform duration-500 ease-editorial group-hover:scale-[1.06]"
                />
              ) : (
                <div className="relative z-[2] flex h-full w-full items-center justify-center text-5xl opacity-25" role="img" aria-label={product.name}>
                  🛒
                </div>
              )}

              {discountPct > 0 && (
                <div className="absolute left-2 top-2 z-10 rounded-full bg-saffron px-2 py-0.5 text-[10px] font-extrabold text-white shadow-[0_2px_10px_-2px_hsl(330_81%_60%/0.65)] sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[11px]">
                  −{discountPct}%
                </div>
              )}

              {isLowStock && (
                <span className="absolute right-2 top-2 z-10 rounded-full bg-bg/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-saffron backdrop-blur-sm sm:right-2.5 sm:top-2.5">
                  {product.stockQuantity} left
                </span>
              )}

              {!isLowStock && (
                <button
                  onClick={handleWishlist}
                  className={cn(
                    'absolute right-2 top-2 z-10 hidden h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 sm:flex sm:right-2.5 sm:top-2.5',
                    wishlisted
                      ? 'bg-saffron text-white opacity-100 shadow-[0_0_12px_-2px_hsl(var(--saffron)/0.6)]'
                      : 'bg-black/30 text-white opacity-0 -translate-y-1 hover:bg-black/45 group-hover:translate-y-0 group-hover:opacity-100',
                  )}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <HeartLineIcon size={14} filled={wishlisted} />
                </button>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                  <span className="rounded-full border border-black/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.18em] text-coral">
                    Sold out
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* ── Content ─────────────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-2.5">
            <span className={cn('text-[9px] font-bold uppercase tracking-[0.18em]', isLight ? 'text-sage' : 'text-sage/80')}>
              {product.category.name}
            </span>

            <Link
              to={`/products/${product.slug}`}
              className={cn('line-clamp-2 font-display text-sm font-semibold leading-snug transition-colors', isLight ? 'text-black/80 hover:text-saffron' : 'text-cream hover:text-saffron')}
            >
              {product.name}
            </Link>

            <span className={cn('font-display text-[10px] italic', isLight ? 'text-black/40' : 'text-cream/40')}>
              per {product.unit}
            </span>

            {/* Price + cart */}
            <div className="mt-auto flex items-center gap-2 pt-2.5">
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="font-display text-[15px] font-black leading-none sm:text-base"
                  style={isLight
                    ? { color: 'hsl(var(--saffron))' }
                    : { color: 'hsl(var(--cream))', textShadow: '0 0 18px hsl(var(--saffron) / 0.30)' }}
                >
                  {formatPaisa(product.effectivePriceInPaisa)}
                </span>
                {hasDiscount && (
                  <span
                    className="truncate font-display text-[10px] italic line-through"
                    style={isLight
                      ? { color: 'rgba(0, 0, 0, 0.3)' }
                      : { color: 'hsl(var(--cream) / 0.32)' }}
                  >
                    {formatPaisa(compare)}
                  </span>
                )}
              </div>

              {!isOutOfStock && (
                <div className="shrink-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {qty === 0 ? (
                      <motion.button
                        key="add"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{    opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleAdd}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90',
                          isLight
                            ? addedFlash
                              ? 'bg-sage text-white shadow-[0_0_12px_-2px_hsl(var(--sage)/0.45)]'
                              : 'bg-saffron text-white shadow-[0_4px_14px_-3px_hsl(var(--saffron)/0.45)] hover:shadow-[0_6px_18px_-3px_hsl(var(--saffron)/0.6)]'
                            : addedFlash
                              ? 'bg-sage text-bg shadow-[0_0_16px_-2px_hsl(var(--sage)/0.75)]'
                              : 'btn-icon-grad shadow-[0_0_16px_-3px_hsl(var(--saffron)/0.7)] hover:shadow-[0_0_22px_-2px_hsl(var(--saffron)/0.95)]',
                        )}
                        aria-label="Add to cart"
                      >
                        {addedFlash ? '✓' : <PlusIcon size={15} strokeWidth={2.2} />}
                      </motion.button>
                    ) : (
                      <motion.div
                        key="qty"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{    opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'flex items-center gap-0.5 rounded-full p-0.5',
                          isLight
                            ? 'border border-black/10 bg-white shadow-sm'
                            : 'border border-saffron/30 bg-bg shadow-[0_0_14px_-4px_hsl(var(--saffron)/0.6)]',
                        )}
                      >
                        <button
                          onClick={() => decrement(product.id, qty)}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full transition-colors active:scale-90',
                            isLight
                              ? 'text-black/60 hover:bg-black/5 hover:text-black'
                              : 'text-cream/70 hover:bg-saffron/15 hover:text-cream',
                          )}
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon size={11} strokeWidth={2} />
                        </button>
                        <span
                          className="min-w-[1.1rem] text-center font-display text-xs font-bold tabular-nums"
                          style={isLight ? { color: 'hsl(var(--saffron))' } : { color: 'hsl(var(--cream))' }}
                        >
                          {qty}
                        </span>
                        <button
                          onClick={() => increment(product.id, qty, product.stockQuantity)}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-90',
                            isLight ? 'bg-saffron text-white shadow-sm' : 'btn-icon-grad',
                          )}
                          aria-label="Increase quantity"
                        >
                          <PlusIcon size={11} strokeWidth={2} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Memoized export ──────────────────────────────────────────────────────────
export const ProductCard = memo(ProductCardImpl, (prev, next) =>
  prev.product.id                    === next.product.id &&
  prev.product.effectivePriceInPaisa === next.product.effectivePriceInPaisa &&
  prev.product.stockQuantity         === next.product.stockQuantity &&
  prev.product.name                  === next.product.name &&
  prev.className                     === next.className &&
  prev.emphasis                      === next.emphasis,
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-[1.5px] rounded-3xl bg-gradient-to-br from-white/15 via-line/25 to-line/15', className)}>
      <div className="flex flex-col rounded-[calc(1.5rem-1.5px)] bg-surface">
        <div className="p-2.5 pb-0">
          <div className="aspect-square skeleton rounded-2xl" />
        </div>
        <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2.5">
          <div className="h-2 w-14 skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-2.5 w-1/3 skeleton rounded" />
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-5 w-14 skeleton rounded flex-1" />
            <div className="h-9 w-9 skeleton rounded-full shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
