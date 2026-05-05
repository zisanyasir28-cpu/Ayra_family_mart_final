import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Heart, Bell, Zap } from 'lucide-react';
import { cn, formatPaisa } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';
import type { ApiProduct } from '../../types/api';

interface ProductCardProps {
  product:   ApiProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { getItemQuantity, addToCart, increment, decrement } = useCart();
  const qty          = getItemQuantity(product.id);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock   = !isOutOfStock && product.stockQuantity <= 5;

  const [imgError,     setImgError]     = useState(false);
  const [wishlist,     setWishlist]     = useState(false);
  const [addedFlash,   setAddedFlash]   = useState(false);
  const firstImage = product.images[0];

  const comparePrice =
    product.comparePriceInPaisa ?? product.priceInPaisa;

  const hasDiscount =
    product.activeCampaign !== null ||
    (product.comparePriceInPaisa != null &&
      product.comparePriceInPaisa > product.effectivePriceInPaisa);

  const discountPct =
    hasDiscount && comparePrice > 0
      ? Math.round(
          ((comparePrice - product.effectivePriceInPaisa) / comparePrice) * 100,
        )
      : 0;

  const isCampaign = product.activeCampaign !== null;

  function handleAddToCart() {
    addToCart(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 600);
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-shadow hover:shadow-card-hover',
        className,
      )}
    >
      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        {firstImage && !imgError ? (
          <img
            src={firstImage.url}
            alt={firstImage.altText ?? product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
            <span className="text-5xl opacity-40">🛒</span>
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {discountPct > 0 && (
            <motion.span
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm',
                isCampaign
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : 'bg-red-500',
              )}
            >
              {isCampaign && <Zap className="h-2.5 w-2.5 fill-white" />}
              -{discountPct}%
            </motion.span>
          )}
          {isLowStock && (
            <span className="rounded-lg bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              Only {product.stockQuantity} left!
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlist((v) => !v); }}
          className={cn(
            'absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200',
            'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0',
            wishlist && '!opacity-100 !translate-y-0',
          )}
          aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              wishlist ? 'fill-red-500 text-red-500' : 'text-slate-400',
            )}
          />
        </button>

        {/* Category pill */}
        <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {product.category.name}
        </span>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px]">
            <span className="rounded-xl bg-white/15 px-4 py-1.5 text-sm font-bold text-white">
              Out of Stock
            </span>
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              <Bell className="h-3.5 w-3.5" />
              Notify Me
            </button>
          </div>
        )}
      </Link>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {/* Product name */}
        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-green-700"
        >
          {product.name}
        </Link>

        {/* Unit */}
        <p className="text-xs text-muted-foreground">{product.unit}</p>

        {/* Campaign label */}
        {isCampaign && product.activeCampaign && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600">
            <Zap className="h-2.5 w-2.5 fill-orange-500" />
            Campaign deal
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-foreground">
              {formatPaisa(product.effectivePriceInPaisa)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPaisa(comparePrice)}
              </span>
            )}
          </div>

          {/* Cart control */}
          {!isOutOfStock && (
            <AnimatePresence mode="wait" initial={false}>
              {qty === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={handleAddToCart}
                  className={cn(
                    'relative flex items-center gap-1.5 overflow-hidden rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95',
                    addedFlash
                      ? 'bg-green-500'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-glow-green',
                  )}
                >
                  <AnimatePresence mode="wait">
                    {addedFlash ? (
                      <motion.span
                        key="ok"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-1"
                      >
                        ✓ Added
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-1"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ) : (
                <motion.div
                  key="qty"
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center gap-0.5 rounded-xl border-2 border-green-600 bg-green-50 p-0.5"
                >
                  <button
                    onClick={() => decrement(product.id, qty)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-green-700 transition hover:bg-green-100 active:scale-90"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[1.75rem] text-center text-sm font-extrabold text-green-800">
                    {qty}
                  </span>
                  <button
                    onClick={() => increment(product.id, qty, product.stockQuantity)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700 active:scale-90"
                  >
                    <Plus className="h-3 w-3" />
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

// ─── Skeleton ──────────────────────────────────────────────────────────────────

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card',
        className,
      )}
    >
      <div className="aspect-[4/3] skeleton" />
      <div className="flex flex-col gap-2.5 p-3.5">
        <div className="h-3.5 w-3/4 skeleton rounded-lg" />
        <div className="h-3   w-1/3 skeleton rounded-lg" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-16 skeleton rounded-lg" />
          <div className="h-8 w-20 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
