import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';
import { ArrowRightIcon } from '../common/HandIcon';
import { SectionHeader } from './SectionHeader';

export function NewArrivals() {
  const railRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey:  ['products', 'new-arrivals'],
    queryFn:   () => fetchProducts({ sortBy: 'newest', limit: 10 }),
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.data ?? [];
  // Nothing to show (e.g. API empty) — hide the section rather than leave a gap.
  if (!isLoading && products.length === 0) return null;

  const scrollRail = (dir: 1 | -1) =>
    railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  // Shared card-width track: ~1.5 cards on mobile (hints the scroll), up to ~4 on lg.
  const cardWidth = 'w-[64%] shrink-0 snap-start sm:w-[40%] md:w-[31%] lg:w-[23.5%]';

  return (
    <section className="bg-bg py-20 sm:py-24">
      <div className="container">
        <SectionHeader
          icon={Sparkles}
          eyebrow="Just In"
          bangla="নতুন এসেছে"
          accent="saffron"
          viewAllHref="/products?sortBy=newest"
          title={
            <>
              Fresh off the shelf — <em className="text-saffron">new arrivals.</em>
            </>
          }
        />

        {/* Horizontal "just landed" rail */}
        <div className="relative">
          {/* Edge fades (hint there's more to scroll) */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-bg to-transparent sm:w-12" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-bg to-transparent sm:w-12" />

          {/* Desktop scroll arrows */}
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            aria-label="Scroll left"
            className="absolute -left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-cream shadow-lg backdrop-blur transition hover:border-saffron hover:text-saffron active:scale-90 lg:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            aria-label="Scroll right"
            className="absolute -right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-cream shadow-lg backdrop-blur transition hover:border-saffron hover:text-saffron active:scale-90 lg:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Rail */}
          <div
            ref={railRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:gap-5"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={cardWidth}>
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map((p) => (
                  <div key={p.id} className={`relative ${cardWidth}`}>
                    {/* NEW · নতুন — English primary, Bengali accent */}
                    <span className="absolute -left-1.5 -top-1.5 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-saffron to-blush px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-bg shadow-md">
                      New
                      <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-bg/50" />
                      <span className="font-bangla text-[10px] normal-case">নতুন</span>
                    </span>
                    <ProductCard product={p} className="h-full" />
                  </div>
                ))}
          </div>
        </div>

        {/* Mobile "view all" */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            to="/products?sortBy=newest"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-cream"
          >
            View all
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
