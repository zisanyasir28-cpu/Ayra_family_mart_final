import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Heart, ChevronLeft, ShoppingBag, Minus, Plus, Star, Truck, Package, ShieldCheck,
} from 'lucide-react';
import { cn, formatPaisa } from '@/lib/utils';
import { detail as detailImg } from '@/lib/cloudinary';
import { fetchProductBySlug } from '@/services/products';
import { useCart } from '@/hooks/useCart';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore }     from '@/store/authStore';
import { toggleWishlistItem } from '@/services/wishlist';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]             = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey:  ['product', slug],
    queryFn:   () => fetchProductBySlug(slug),
    enabled:   !!slug,
    retry:     false,
  });

  const { addToCart }       = useCart();
  const { isWishlisted, toggle } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container py-6 md:py-10">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-7 w-3/4 skeleton rounded" />
            <div className="h-6 w-32 skeleton rounded" />
            <div className="h-20 w-full skeleton rounded mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="text-6xl">🔍</span>
        <h1 className="font-display text-2xl font-bold text-cream">Product not found</h1>
        <p className="text-cream/55">It may have been removed or the link is wrong.</p>
        <Link to="/products" className="rounded-full bg-saffron px-5 py-2.5 font-bold text-bg">
          Browse products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock   = !isOutOfStock && product.stockQuantity <= 5;
  const compare      = product.comparePriceInPaisa ?? product.priceInPaisa;
  const hasDiscount  = product.activeCampaign !== null ||
    (product.comparePriceInPaisa != null && product.comparePriceInPaisa > product.effectivePriceInPaisa);
  const discountPct = hasDiscount && compare > 0
    ? Math.round(((compare - product.effectivePriceInPaisa) / compare) * 100)
    : 0;
  const wishlisted = isWishlisted(product.id);

  function handleAdd() {
    addToCart(product!, qty);
    toast.success(`Added ${qty} × ${product!.name} to cart`);
  }

  async function handleWishlist() {
    if (!isAuthenticated) { toast.error('Please log in to save to wishlist', { icon: '🔒' }); return; }
    toggle(product!.id);
    try { await toggleWishlistItem(product!.id); } catch { /* demo OK */ }
  }

  const images = product.images.length > 0 ? product.images : [{ id: 'placeholder', url: '', altText: product.name }];

  return (
    <div className="container py-4 md:py-10 pb-32 md:pb-10">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-cream/55 transition hover:text-saffron"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        {/* ── Image Gallery ───────────────────────────────────────────── */}
        <div className="md:sticky md:top-24 md:self-start">
          {/* Main image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line">
            {images[activeImg]?.url ? (
              <img
                src={detailImg(images[activeImg].url)}
                alt={images[activeImg].altText ?? product.name}
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-7xl opacity-30">🛒</div>
            )}
            {/* Badges */}
            {discountPct > 0 && (
              <div className="absolute left-3 top-3 rounded-full bg-coral px-3 py-1 text-xs font-bold text-bg">
                −{discountPct}%
              </div>
            )}
            {isLowStock && (
              <div className="absolute right-3 top-3 rounded-full bg-bg/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-saffron backdrop-blur-sm">
                {product.stockQuantity} left
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg/65 backdrop-blur-sm">
                <span className="rounded-full border border-cream/30 px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-cream">
                  Sold out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail row — mobile horizontal scroll snap, desktop grid */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'shrink-0 snap-start overflow-hidden rounded-xl ring-2 transition',
                    activeImg === i ? 'ring-saffron' : 'ring-line hover:ring-cream/30',
                  )}
                >
                  <img
                    src={detailImg(img.url)}
                    alt=""
                    className="h-16 w-16 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <Link
              to={`/products?categoryId=${product.category.id}`}
              className="text-[11px] uppercase tracking-[0.18em] text-cream/55 hover:text-saffron"
            >
              {product.category.name}
            </Link>
            <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-cream md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm italic text-cream/55">per {product.unit}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-black text-cream md:text-4xl">
              {formatPaisa(product.effectivePriceInPaisa)}
            </span>
            {hasDiscount && (
              <span className="font-display text-base italic text-cream/35 line-through">
                {formatPaisa(compare)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-cream/70">{product.description}</p>
          )}

          {/* Stock + ratings (placeholder) */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-cream/55">
            <span className={cn('flex items-center gap-1.5', isOutOfStock ? 'text-coral' : 'text-sage')}>
              <Package className="h-3.5 w-3.5" />
              {isOutOfStock ? 'Out of stock' : `${product.stockQuantity} in stock`}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-saffron text-saffron" /> 4.5 (12 reviews)
            </span>
          </div>

          {/* Desktop actions — mobile uses sticky bar */}
          <div className="hidden flex-wrap items-center gap-3 pt-2 md:flex">
            <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream/10 disabled:opacity-40"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4 text-cream" />
              </button>
              <span className="min-w-[2.5rem] text-center font-display text-base font-bold tabular-nums text-cream">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(product!.stockQuantity, q + 1))}
                disabled={qty >= product.stockQuantity}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream/10 disabled:opacity-40"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4 text-cream" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3 font-bold text-bg transition hover:bg-saffron/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-4 w-4" />
              {isOutOfStock ? 'Sold out' : 'Add to Cart'}
            </button>

            <button
              onClick={handleWishlist}
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition',
                wishlisted ? 'bg-coral text-bg' : 'border border-line bg-surface text-cream hover:bg-surface-2',
              )}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn('h-5 w-5', wishlisted && 'fill-current')} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface ring-1 ring-line p-3 text-center text-[11px] text-cream/55">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-4 w-4 text-saffron" />
              <span>Fast delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-saffron" />
              <span>Quality assured</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Package className="h-4 w-4 text-saffron" />
              <span>Easy returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom Add-to-Cart bar ─────────────────────── */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="container flex items-center gap-3 py-3">
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-40"
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4 text-cream" />
            </button>
            <span className="min-w-[2rem] text-center font-display text-sm font-bold tabular-nums text-cream">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(product!.stockQuantity, q + 1))}
              disabled={qty >= product.stockQuantity}
              className="flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-40"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4 text-cream" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-saffron py-3 font-bold text-bg transition active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock ? 'Sold out' : `Add · ${formatPaisa(product.effectivePriceInPaisa * qty)}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
