import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { fetchProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';
import { useCountdown } from '../../hooks/useCountdown';

// Per-product countdown badge
function CountdownBadge({ endsAt }: { endsAt: string | null }) {
  const { hours, minutes, seconds, isExpired } = useCountdown(endsAt);
  if (isExpired || !endsAt) return null;
  return (
    <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-mono font-semibold text-orange-600">
      <span>⏱</span>
      <span>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export function FlashDeals() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'flash-deals'],
    queryFn: () => fetchProducts({ limit: 12, sortBy: 'newest' }),
    staleTime: 1000 * 60 * 2,
    select: (d) => d.data.filter((p) => p.activeCampaign !== null),
  });

  const products = data ?? [];

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-orange-50 to-red-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Flash Deals</h2>
            <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              LIVE
            </span>
          </div>
          <Link
            to="/products?deals=true"
            className="text-sm font-medium text-red-600 transition hover:text-red-700"
          >
            See all deals →
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/3 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md transition hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-44">
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="shrink-0 w-44 flex flex-col"
                  >
                    <ProductCard product={p} />
                    <CountdownBadge endsAt={p.activeCampaign?.endsAt ?? null} />
                  </motion.div>
                ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/3 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md transition hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
