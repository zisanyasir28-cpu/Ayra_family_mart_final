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
      toggle(product.id);
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
    // ── Pearl-shimmer glass ring border ─────────────────────────────────────
    // white/30 → saffron/20 → plum/12: creates a light-reflection at top-left
    // that fades into brand pink then deep purple — consistent across all cards
    <div
      className={cn(
        'group relative p-[1.5px] rounded-3xl bg-gradient-to-br',
        'from-white/30 via-saffron/20 to-plum/12',
        'hover:from-white/50 hover:via-saffron/35 hover:to-plum/20',
        'transition-all duration-300 ease-editorial',
        'hover:-translate-y-0.5',
        'hover:shadow-[0_2px_12px_-4px_hsl(var(--saffron)/0.22)]',
        emphasis && 'hover:-translate-y-1',
        className,
      )}
      style={{ willChange: 'transform' }}
    >
      {/* ── Inner card ──────────────────────────────────────────────────── */}
      <div className="glass-shine relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-surface">

        {/* Ambient art orbs */}
        <div aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-saffron/8 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -top-6 -left-6 h-20 w-20 rounded-full bg-plum/8 blur-2xl" />

        {/* ── Image ───────────────────────────────────────────────────── */}
        {/*
          Light near-white bg matches the b_white Cloudinary padding so the
          product never looks cut-out on a dark surface. object-contain ensures
          the full product is always visible — no zooming or cropping.
          Cloudinary already pads every image to 5:6 (600×720) so object-contain
          fills the 5:6 container perfectly with zero letterboxing.
        */}
        <Link
          to={`/products/${product.slug}`}
          className="relative block aspect-[5/6] overflow-hidden rounded-t-[calc(1.5rem-1.5px)] bg-gradient-to-br from-[hsl(var(--plum)/0.18)] via-surface to-bg"
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
                  'absolute inset-0 h-full w-full object-contain p-2 transition-[transform,opacity] duration-500 ease-editorial',
                  secondImage
                    ? 'group-hover:scale-[1.05] group-hover:opacity-0'
                    : 'group-hover:scale-[1.05]',
                )}
              />
              {secondImage && (
                <img
                  src={cardImg(secondImage.url)}
                  alt={secondImage.altText ?? product.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full scale-[1.05] object-contain p-2 opacity-0 transition-[transform,opacity] duration-500 ease-editorial group-hover:scale-100 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl opacity-30">
              🛒
            </div>
          )}

          {/* Subtle bottom vignette to blend image into card body */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface/80 to-transparent" />

          {discountPct > 0 && (
            <div
              className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[11px]"
              style={{ background: 'hsl(330 81% 60%)', color: '#fff', boxShadow: '0 2px 8px -2px hsl(330 81% 60% / 0.55)' }}
            >
              −{discountPct}%
            </div>
          )}

          {isLowStock && (
            <span className="absolute right-2 top-2 rounded-full bg-bg/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-saffron backdrop-blur-sm sm:right-2.5 sm:top-2.5">
              {product.stockQuantity} left
            </span>
          )}

          {!isLowStock && (
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full transition-all duration-300 sm:flex sm:right-2.5 sm:top-2.5',
                wishlisted
                  ? 'bg-saffron text-bg opacity-100 shadow-[0_0_10px_-2px_hsl(var(--saffron)/0.6)]'
                  : 'bg-bg/70 text-cream opacity-0 -translate-y-1 backdrop-blur-sm group-hover:opacity-100 group-hover:translate-y-0',
              )}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <HeartLineIcon size={14} filled={wishlisted} />
            </button>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/65 backdrop-blur-[2px]">
              <span className="rounded-full border border-cream/30 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.18em] text-cream">
                Sold out
              </span>
            </div>
          )}
        </Link>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5">
          <span className="text-[9px] uppercase tracking-[0.18em] text-cream/40">
            {product.category.name}
          </span>

          <Link
            to={`/products/${product.slug}`}
            className="line-clamp-2 font-display text-sm font-semibold leading-snug text-cream transition-colors hover:text-saffron"
          >
            {product.name}
          </Link>

          <span className="font-display text-[10px] italic text-cream/40">
            per {product.unit}
          </span>

          {/* Price + cart — flex-1 price, shrink-0 button, no overlap */}
          <div className="mt-auto flex items-center gap-2 pt-2">
            <div className="flex min-w-0 flex-1 items-baseline gap-1">
              <span className="font-display text-sm font-black text-cream sm:text-[15px]">
                {formatPaisa(product.effectivePriceInPaisa)}
              </span>
              {hasDiscount && (
                <span className="truncate font-display text-[10px] italic text-cream/30 line-through">
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
                        'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 active:scale-90 sm:h-8 sm:w-8',
                        addedFlash
                          ? 'bg-sage text-bg shadow-[0_0_10px_-2px_hsl(var(--sage)/0.65)]'
                          : 'bg-saffron text-bg shadow-[0_3px_10px_-2px_hsl(var(--saffron)/0.5)] hover:bg-saffron/90 hover:shadow-[0_4px_16px_-2px_hsl(var(--saffron)/0.7)] hover:scale-105',
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
                      className="flex items-center gap-0.5 rounded-full border border-line bg-bg p-0.5"
                    >
                      <button
                        onClick={() => decrement(product.id, qty)}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-saffron/15 hover:text-cream active:scale-90 sm:h-6 sm:w-6"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon size={10} strokeWidth={2} />
                      </button>
                      <span className="min-w-[1.1rem] text-center font-display text-xs font-bold tabular-nums text-cream">
                        {qty}
                      </span>
                      <button
                        onClick={() => increment(product.id, qty, product.stockQuantity)}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-saffron text-bg transition-all hover:bg-saffron/90 hover:scale-105 active:scale-90 sm:h-6 sm:w-6"
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
