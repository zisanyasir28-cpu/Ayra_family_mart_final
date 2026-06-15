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
    // ── Border ring ─────────────────────────────────────────────────────────
    // Light: warm amber→sage→amber jewel-edge ring — catches light directionally
    // Dark:  white/30 → saffron/20 → plum/12 pearl shimmer
    <div
      className={cn(
        'group relative p-[1.5px] bg-gradient-to-br',
        'transition-all duration-300 ease-editorial',
        isLight ? [
          'rounded-3xl',
          'from-saffron/30 via-white/80 to-sage/30',
          'hover:from-saffron/50 hover:via-white hover:to-sage/40',
          'hover:-translate-y-1.5',
          'hover:shadow-[0_12px_30px_-8px_hsl(var(--saffron)/0.3)]',
        ] : [
          'rounded-3xl',
          'from-white/30 via-saffron/20 to-plum/12',
          'hover:from-white/50 hover:via-saffron/35 hover:to-plum/20',
          'hover:-translate-y-0.5',
          'hover:shadow-[0_2px_12px_-4px_hsl(var(--saffron)/0.22)]',
        ],
        emphasis && 'hover:-translate-y-1',
        className,
      )}
      style={{ willChange: 'transform' }}
    >
      {/* ── Inner card ──────────────────────────────────────────────────── */}
      <div className={cn(
        'glass-shine relative flex h-full flex-col overflow-hidden',
        isLight
          ? 'rounded-[calc(1.5rem-1.5px)] bg-white/70 backdrop-blur-xl'
          : 'rounded-[calc(1.5rem-1.5px)] bg-surface',
      )}>

        {/* Ambient art orbs */}
        <div aria-hidden className={cn(
          'pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl',
          isLight ? 'bg-saffron/15' : 'bg-saffron/8',
        )} />
        <div aria-hidden className={cn(
          'pointer-events-none absolute -top-6 -left-6 h-20 w-20 rounded-full blur-2xl',
          isLight ? 'bg-sage/15' : 'bg-plum/8',
        )} />

        {/* ── Image ───────────────────────────────────────────────────── */}
        {/*
          Glassy themed well — plum/navy tint in dark mode so transparent-bg
          brand PNGs float naturally inside the card. Cool lavender in light
          mode (no white, keeps the purple design language). No extra glow
          or vignette — the image borders blend into card surface organically.
        */}
        <Link
          to={`/products/${product.slug}`}
          className={cn(
            'relative block aspect-[5/6] overflow-hidden',
            isLight
              ? 'rounded-t-[calc(1.5rem-1.5px)] bg-white/50'
              : 'rounded-t-[calc(1.5rem-1.5px)] bg-[hsl(var(--plum)/0.14)]',
          )}
        >
          {firstImage && !imgError ? (
            <img
              src={cardImg(firstImage.url)}
              alt={firstImage.altText ?? product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 ease-editorial group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl opacity-30">
              🛒
            </div>
          )}

          {/* Shimmer sweep — light mode luxury feel, diagonal catch-light on hover */}
          {isLight && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[200%]"
            />
          )}

          {discountPct > 0 && (
            <div
              className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[11px]"
              style={isLight ? {
                background: 'hsl(var(--coral))',
                color: '#fff',
                boxShadow: '0 2px 8px -2px hsl(var(--coral) / 0.4)',
              } : {
                background: 'hsl(330 81% 60%)',
                color: '#fff',
                boxShadow: '0 2px 8px -2px hsl(330 81% 60% / 0.55)',
              }}
            >
              −{discountPct}%
            </div>
          )}

          {isLowStock && (
            <span
              className={cn(
                'absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider backdrop-blur-sm sm:right-2.5 sm:top-2.5',
                !isLight && 'bg-bg/85 text-saffron',
              )}
              style={isLight ? { background: 'hsl(var(--saffron) / 0.15)', color: 'hsl(var(--saffron))' } : undefined}
            >
              {product.stockQuantity} left
            </span>
          )}

          {!isLowStock && (
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full transition-all duration-300 sm:flex sm:right-2.5 sm:top-2.5',
                isLight
                  ? wishlisted
                    ? 'bg-saffron text-white opacity-100 shadow-[0_0_10px_-2px_hsl(var(--saffron)/0.4)]'
                    : 'bg-white/80 text-saffron opacity-0 -translate-y-1 backdrop-blur-sm hover:bg-white group-hover:opacity-100 group-hover:translate-y-0'
                  : wishlisted
                    ? 'bg-saffron text-bg opacity-100 shadow-[0_0_10px_-2px_hsl(var(--saffron)/0.6)]'
                    : 'bg-bg/70 text-cream opacity-0 -translate-y-1 backdrop-blur-sm group-hover:opacity-100 group-hover:translate-y-0',
              )}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <HeartLineIcon size={14} filled={wishlisted} />
            </button>
          )}

          {isOutOfStock && (
            <div
              className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
              style={isLight
                ? { background: 'rgba(255, 255, 255, 0.75)' }
                : { background: 'hsl(var(--bg) / 0.65)' }}
            >
              <span
                className="rounded-full border px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.18em]"
                style={isLight ? {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--coral))',
                } : {
                  borderColor: 'hsl(var(--cream) / 0.30)',
                  color: 'hsl(var(--cream))',
                }}
              >
                Sold out
              </span>
            </div>
          )}
        </Link>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5">
          <span className={cn('text-[9px] uppercase tracking-[0.18em]', isLight ? 'text-black/40' : 'text-cream/40')}>
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

          {/* Price + cart — flex-1 price, shrink-0 button, no overlap */}
          <div className="mt-auto flex items-center gap-2 pt-2">
            <div className="flex min-w-0 flex-1 items-baseline gap-1">
              <span
                className="font-display text-sm font-black sm:text-[15px]"
                style={isLight ? { color: 'hsl(var(--saffron))' } : { color: 'hsl(var(--cream))' }}
              >
                {formatPaisa(product.effectivePriceInPaisa)}
              </span>
              {hasDiscount && (
                <span
                  className="truncate font-display text-[10px] italic line-through"
                  style={isLight
                    ? { color: 'rgba(0, 0, 0, 0.3)' }
                    : { color: 'hsl(var(--cream) / 0.30)' }}
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
                        'flex h-7 w-7 items-center justify-center rounded-full duration-200 sm:h-8 sm:w-8',
                        isLight
                          ? addedFlash
                            ? 'bg-sage text-white shadow-[0_0_10px_-2px_hsl(var(--sage)/0.4)] transition-all active:scale-90'
                            : 'bg-saffron text-white shadow-[0_4px_10px_-2px_hsl(var(--saffron)/0.3)] hover:scale-105 transition-all active:scale-90'
                          : addedFlash
                            ? 'bg-sage text-bg shadow-[0_0_10px_-2px_hsl(var(--sage)/0.65)] transition-all active:scale-90'
                            : 'btn-icon-grad hover:scale-105 transition-all active:scale-90',
                      )}
                      aria-label="Add to cart"
                    >
                      {addedFlash ? '✓' : <PlusIcon size={13} strokeWidth={2} />}
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
                          : 'border border-line bg-bg',
                      )}
                    >
                      <button
                        onClick={() => decrement(product.id, qty)}
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full transition-colors active:scale-90 sm:h-6 sm:w-6',
                          isLight
                            ? 'text-black/60 hover:bg-black/5 hover:text-black'
                            : 'text-cream/70 hover:bg-saffron/15 hover:text-cream',
                        )}
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon size={10} strokeWidth={2} />
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
                          'flex h-5 w-5 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-90 sm:h-6 sm:w-6',
                          isLight ? 'bg-saffron text-white shadow-sm' : 'btn-icon-grad hover:scale-105',
                        )}
                        aria-label="Increase quantity"
                      >
                        <PlusIcon size={10} strokeWidth={2} />
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
        <div className="aspect-[5/6] bg-[hsl(0_0%_91%)] animate-pulse rounded-t-[calc(1.5rem-1.5px)]" />
        <div className="flex flex-col gap-1.5 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5">
          <div className="h-2 w-14 skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-2.5 w-1/3 skeleton rounded" />
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-5 w-14 skeleton rounded flex-1" />
            <div className="h-7 w-7 skeleton rounded-full shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
