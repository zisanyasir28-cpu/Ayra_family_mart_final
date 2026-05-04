import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Bell, Star } from 'lucide-react';
import { cn, formatPaisa } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';
import type { ApiProduct } from '../../types/api';

interface ProductCardProps {
  product: ApiProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { getItemQuantity, addToCart, increment, decrement } = useCart();
  const qty = getItemQuantity(product.id);
  const isOutOfStock = product.stockQuantity === 0;

  const [imgError, setImgError] = useState(false);
  const firstImage = product.images[0];

  const hasDiscount =
    product.activeCampaign !== null ||
    (product.comparePriceInPaisa != null &&
      product.comparePriceInPaisa > product.effectivePriceInPaisa);

  const comparePrice =
    product.comparePriceInPaisa ?? product.priceInPaisa;

  const discountPct =
    hasDiscount && comparePrice > 0
      ? Math.round(
          ((comparePrice - product.effectivePriceInPaisa) / comparePrice) * 100,
        )
      : 0;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        {firstImage && !imgError ? (
          <img
            src={firstImage.url}
            alt={firstImage.altText ?? product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">
            🛒
          </div>
        )}

        {/* Discount badge */}
        {discountPct > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discountPct}%
          </span>
        )}

        {/* Category badge */}
        <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          {product.category.name}
        </span>

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white">Out of Stock</span>
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              <Bell className="h-3.5 w-3.5" />
              Notify Me
            </button>
          </div>
        )}
      </Link>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Name */}
        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug text-foreground hover:text-green-700"
        >
          {product.name}
        </Link>

        {/* Unit */}
        <p className="text-xs text-muted-foreground">{product.unit}</p>

        {/* Price row */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              {formatPaisa(product.effectivePriceInPaisa)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPaisa(comparePrice)}
              </span>
            )}
          </div>

          {/* Add to cart / quantity selector */}
          {!isOutOfStock && (
            <AnimatePresence mode="wait" initial={false}>
              {qty === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 active:scale-95"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add
                </motion.button>
              ) : (
                <motion.div
                  key="qty"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1 rounded-lg border border-green-600 text-green-700"
                >
                  <button
                    onClick={() => decrement(product.id, qty)}
                    className="flex h-7 w-7 items-center justify-center rounded-l-lg transition hover:bg-green-50 active:scale-95"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    onClick={() => increment(product.id, qty, product.stockQuantity)}
                    className="flex h-7 w-7 items-center justify-center rounded-r-lg transition hover:bg-green-50 active:scale-95"
                  >
                    <Plus className="h-3 w-3" />
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-7 w-16 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
