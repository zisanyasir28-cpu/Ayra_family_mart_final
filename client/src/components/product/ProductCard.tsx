import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn, formatPaisa } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';
import { HeartLineIcon, PlusIcon, MinusIcon, ArrowRightIcon } from '../common/HandIcon';
import type { ApiProduct } from '../../types/api';

interface ProductCardProps {
  product:    ApiProduct;
  className?: string;
  /** When true, applies a slight extra hover scale — used in feature grids. */
  emphasis?:  boolean;
}

export function ProductCard({ product, className, emphasis = false }: ProductCardProps) {
  const { getItemQuantity, addToCart, increment, decrement } = useCart();
  const qty          = getItemQuantity(product.id);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock   = !isOutOfStock && product.stockQuantity <= 5;

  const [imgError,   setImgError]   = useState(false);
  const [wishlist,   setWishlist]   = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Subtle mouse-tracking lift (3D)
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const sx = useSpring(rawX, { stiffness: 100, damping: 18 });
  const sy = useSpring(rawY, { stiffness: 100, damping: 18 });
  const rotateY = useTransform(sx, [0, 1], [-3, 3]);
  const rotateX = useTransform(sy, [0, 1], [2, -2]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    rawX.set((e.clientX - r.left) / r.width);
    rawY.set((e.clientY - r.top)  / r.height);
  }
  function onLeave() { rawX.set(0.5); rawY.set(0.5); }

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
    <motion.div
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: '1000px' }}
      whileHover={{ y: emphasis ? -6 : -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={cn(
        'group relative flex h-full flex-col rounded-2xl bg-surface ring-1 ring-line transition-shadow duration-500 hover:ring-saffron/40 hover:shadow-lift',
        className,
      )}
    >
      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2"
        style={{ transform: 'translateZ(0)' }}
      >
        {firstImage && !imgError ? (
          <>
            {/* Primary image */}
            <img
              src={firstImage.url}
              alt={firstImage.altText ?? product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-editorial',
                secondImage ? 'group-hover:scale-105 group-hover:opacity-0' : 'group-hover:scale-[1.04]',
              )}
            />
            {/* Secondary (revealed on hover) */}
            {secondImage && (
              <img
                src={secondImage.url}
                alt={secondImage.altText ?? product.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 ease-editorial group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl opacity-30">
            🛒
          </div>
        )}

        {/* Gradient bottom for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface/85 to-transparent" />

        {/* Discount chip */}
        {discountPct > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-bg"
          >
            <span className="font-mono-num">−{discountPct}%</span>
          </motion.div>
        )}

        {/* Low-stock chip */}
        {isLowStock && (
          <span className="absolute right-3 top-3 rounded-full bg-bg/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-saffron backdrop-blur-sm">
            {product.stockQuantity} left
          </span>
        )}

        {/* Wishlist (top-right, fades in on hover) */}
        {!isLowStock && (
          <button
            onClick={(e) => { e.preventDefault(); setWishlist((v) => !v); }}
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
              wishlist
                ? 'bg-coral text-bg opacity-100'
                : 'bg-bg/70 text-cream opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 backdrop-blur-sm',
            )}
            aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <HeartLineIcon size={16} filled={wishlist} />
          </button>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/65 backdrop-blur-[2px]">
            <span className="rounded-full border border-cream/30 px-4 py-1.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-cream">
              Sold out
            </span>
          </div>
        )}

        {/* "Quick view" affordance — appears on hover */}
        {!isOutOfStock && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-0 transition-all duration-500 group-hover:opacity-100">
            <span className="font-display text-[11px] uppercase tracking-[0.22em] text-cream/80">
              View
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-bg">
              <ArrowRightIcon size={12} strokeWidth={2} />
            </span>
          </div>
        )}
      </Link>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
        {/* Category */}
        <span className="text-[10px] uppercase tracking-[0.2em] text-cream/45">
          {product.category.name}
        </span>

        {/* Name */}
        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-cream transition-colors hover:text-saffron"
        >
          {product.name}
        </Link>

        {/* Unit */}
        <span className="font-display text-xs italic text-cream/50">
          per {product.unit}
        </span>

        {/* Price + cart */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-black text-cream">
              {formatPaisa(product.effectivePriceInPaisa)}
            </span>
            {hasDiscount && (
              <span className="font-display text-xs italic text-cream/35 line-through">
                {formatPaisa(compare)}
              </span>
            )}
          </div>

          {!isOutOfStock && (
            <AnimatePresence mode="wait" initial={false}>
              {qty === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{    opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                  onClick={handleAdd}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90',
                    addedFlash
                      ? 'bg-sage text-bg'
                      : 'bg-cream text-bg hover:bg-saffron hover:shadow-saffron',
                  )}
                  aria-label="Add to cart"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={addedFlash ? 'check' : 'plus'}
                      initial={{ scale: 0,  rotate: -90 }}
                      animate={{ scale: 1,  rotate: 0   }}
                      exit={{    scale: 0,  rotate: 90  }}
                      transition={{ duration: 0.2 }}
                    >
                      {addedFlash ? '✓' : <PlusIcon size={16} strokeWidth={2} />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              ) : (
                <motion.div
                  key="qty"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{    opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="flex items-center gap-1 rounded-full bg-cream p-0.5 text-bg"
                >
                  <button
                    onClick={() => decrement(product.id, qty)}
                    className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-bg/10 active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon size={12} strokeWidth={2} />
                  </button>
                  <span className="min-w-[1.5rem] text-center font-display text-sm font-bold tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => increment(product.id, qty, product.stockQuantity)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-bg text-cream transition hover:bg-saffron hover:text-bg active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon size={12} strokeWidth={2} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col rounded-2xl bg-surface ring-1 ring-line', className)}>
      <div className="aspect-[4/5] skeleton rounded-2xl" />
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
        <div className="h-2.5 w-20 skeleton rounded" />
        <div className="h-4   w-3/4 skeleton rounded" />
        <div className="h-3   w-1/3 skeleton rounded" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-6 w-20 skeleton rounded" />
          <div className="h-9 w-9 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}
