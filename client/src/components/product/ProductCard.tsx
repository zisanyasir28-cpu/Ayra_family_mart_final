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
import { toggleWishlistItem } from '../../services/wishlist';
import type { ApiProduct } from '../../types/api';

interface ProductCardProps {
  product:    ApiProduct;
  className?: string;
  /** When true, slightly stronger hover lift — used in featured grids. */
  emphasis?:  boolean;
}

function ProductCardImpl({ product, className, emphasis = false }: ProductCardProps) {
  const { getItemQuantity, addToCart, increment, decrement } = useCart();
  const qty          = getItemQuantity(product.id);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock   = !isOutOfStock && product.stockQuantity <= 5;

  const { isWishlisted, toggle }    = useWishlistStore();
  const { isAuthenticated }         = useAuthStore();
  const wishlisted                  = isWishlisted(product.id);

  const [imgError,   setImgError]   = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to save to wishlist', { icon: '🔒' });
      return;
    }
    toggle(product.id); // optimistic
    try {
      const { added } = await toggleWishlistItem(product.id);
      if (!added && wishlisted) return;
      if (added && !wishlisted) return;
      toggle(product.id); // revert — server state differs
    } catch {
      toggle(product.id); // revert on API error
    }
  }

  const firstImage  = product.images[0];
  const secondImage = product.images[1] ?? null;

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
    <div
      className={cn(
        // ── Card shell ──────────────────────────────────────────────────────
        // rounded-3xl (rounder), subtle ring border, pink glow on hover
        'group relative flex h-full flex-col overflow-hidden rounded-3xl bg-surface',
        'ring-1 ring-line/50 transition-[transform,box-shadow,ring-color] duration-300 ease-editorial',
        'hover:-translate-y-1 hover:ring-saffron/35',
        'hover:shadow-[0_0_36px_-10px_hsl(var(--saffron)/0.45)]',
        emphasis && 'hover:-translate-y-1.5',
        className,
      )}
      style={{ willChange: 'transform' }}
    >
      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-surface-2"
      >
        {firstImage && !imgError ? (
          <>
            <img
              src={cardImg(firstImage.url)}
              alt={firstImage.altText ?? product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-editorial',
                secondImage
                  ? 'group-hover:scale-[1.04] group-hover:opacity-0'
                  : 'group-hover:scale-[1.04]',
              )}
            />
            {secondImage && (
              <img
                src={cardImg(secondImage.url)}
                alt={secondImage.altText ?? product.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition-[transform,opacity] duration-500 ease-editorial group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl opacity-30 sm:text-6xl">
            🛒
          </div>
        )}

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface/80 to-transparent" />

        {/* Discount chip — gold (bg-coral = gold in new palette) */}
        {discountPct > 0 && (
          <div className="absolute left-2.5 top-2.5 rounded-full bg-coral px-2.5 py-1 text-[11px] font-extrabold text-bg shadow-[0_2px_8px_-2px_hsl(var(--coral)/0.5)] sm:left-3 sm:top-3">
            −{discountPct}%
          </div>
        )}

        {/* Low-stock chip */}
        {isLowStock && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-bg/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-saffron backdrop-blur-sm sm:right-3 sm:top-3">
            {product.stockQuantity} left
          </span>
        )}

        {/* Wishlist button */}
        {!isLowStock && (
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute right-2.5 top-2.5 hidden h-9 w-9 items-center justify-center rounded-full transition-all duration-300 sm:flex sm:right-3 sm:top-3',
              wishlisted
                ? 'bg-saffron text-bg opacity-100 shadow-[0_0_12px_-2px_hsl(var(--saffron)/0.6)]'
                : 'bg-bg/70 text-cream opacity-0 -translate-y-1 backdrop-blur-sm group-hover:opacity-100 group-hover:translate-y-0',
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <HeartLineIcon size={16} filled={wishlisted} />
          </button>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/65 backdrop-blur-[2px]">
            <span className="rounded-full border border-cream/30 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.18em] text-cream sm:text-sm">
              Sold out
            </span>
          </div>
        )}
      </Link>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <span className="text-[10px] uppercase tracking-[0.18em] text-cream/40">
          {product.category.name}
        </span>

        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug text-cream transition-colors hover:text-saffron sm:text-[15px]"
        >
          {product.name}
        </Link>

        <span className="font-display text-[11px] italic text-cream/45 sm:text-xs">
          per {product.unit}
        </span>

        {/* Price + cart controls */}
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-3 sm:gap-2">

          {/* Price group */}
          <div className="flex min-w-0 shrink items-baseline gap-1 sm:gap-1.5">
            <span className="font-display text-sm font-black text-cream sm:text-base md:text-lg">
              {formatPaisa(product.effectivePriceInPaisa)}
            </span>
            {hasDiscount && (
              <span className="font-display text-[10px] italic text-cream/35 line-through sm:text-[11px]">
                {formatPaisa(compare)}
              </span>
            )}
          </div>

          {!isOutOfStock && (
            <AnimatePresence mode="wait" initial={false}>
              {qty === 0 ? (
                // ── Pink circular add-to-cart button ───────────────────────
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{    opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.16 }}
                  onClick={handleAdd}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-90 sm:h-9 sm:w-9',
                    addedFlash
                      ? 'bg-sage text-bg shadow-[0_0_12px_-2px_hsl(var(--sage)/0.7)]'
                      : 'bg-saffron text-bg hover:bg-saffron/90 hover:shadow-[0_0_16px_-2px_hsl(var(--saffron)/0.65)] hover:scale-105',
                  )}
                  aria-label="Add to cart"
                >
                  {addedFlash ? '✓' : <PlusIcon size={14} strokeWidth={2} />}
                </motion.button>
              ) : (
                // ── Quantity pill ──────────────────────────────────────────
                // Purple-tinted pill with pink "+" button (matches CartDrawer)
                <motion.div
                  key="qty"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{    opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.16 }}
                  className="flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-bg p-0.5 sm:gap-1"
                >
                  <button
                    onClick={() => decrement(product.id, qty)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-saffron/15 hover:text-cream active:scale-90 sm:h-7 sm:w-7"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon size={11} strokeWidth={2} />
                  </button>
                  <span className="min-w-[1.25rem] text-center font-display text-xs font-bold tabular-nums text-cream sm:min-w-[1.5rem] sm:text-sm">
                    {qty}
                  </span>
                  <button
                    onClick={() => increment(product.id, qty, product.stockQuantity)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron text-bg transition-all hover:bg-saffron/90 hover:shadow-[0_0_8px_-2px_hsl(var(--saffron)/0.6)] hover:scale-105 active:scale-90 sm:h-7 sm:w-7"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon size={11} strokeWidth={2} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
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
    <div className={cn('flex flex-col rounded-3xl bg-surface ring-1 ring-line/50', className)}>
      <div className="aspect-[4/5] skeleton rounded-3xl" />
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <div className="h-2.5 w-16 skeleton rounded" />
        <div className="h-4   w-3/4 skeleton rounded" />
        <div className="h-3   w-1/3 skeleton rounded" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-6 w-16 skeleton rounded" />
          <div className="h-9 w-9  skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}
