import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingBag } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore }     from '@/store/authStore';
import { fetchWishlist }    from '@/services/wishlist';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const wishlistIds = useWishlistStore((s) => s.ids);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn:  fetchWishlist,
    enabled:  isAuthenticated,
    staleTime: 60_000,
  });

  // ── Not logged in ─────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
          <Heart className="h-10 w-10 text-coral" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">Your Wishlist</h1>
          <p className="mt-2 text-cream/55">Log in to save and view your favourite products.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-full bg-saffron px-6 py-3 font-bold text-bg transition hover:bg-saffron/90"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full border border-line px-6 py-3 text-cream/70 transition hover:border-saffron hover:text-cream"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="mb-6 font-display text-2xl font-bold text-cream">Wishlist</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────

  const hasItems = items.length > 0 || wishlistIds.length > 0;

  if (!hasItems) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
          <Heart className="h-10 w-10 text-coral/50" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">Wishlist is Empty</h1>
          <p className="mt-2 text-cream/55">Browse products and tap the heart icon to save them here.</p>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-2 rounded-full bg-saffron px-6 py-3 font-bold text-bg transition hover:bg-saffron/90"
        >
          <ShoppingBag className="h-4 w-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  // ── Product Grid ──────────────────────────────────────────────────────────

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-bold text-cream">
          Wishlist
          <span className="ml-2 font-display text-base font-normal text-cream/40">
            ({items.length} item{items.length !== 1 ? 's' : ''})
          </span>
        </h1>
        <Link
          to="/products"
          className="text-sm text-saffron hover:underline"
        >
          Continue shopping
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <ProductCard key={item.id} product={item.product} emphasis />
        ))}
      </div>
    </div>
  );
}
