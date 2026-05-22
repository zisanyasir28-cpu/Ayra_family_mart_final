import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { fetchProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';
import { useCountdown } from '../../hooks/useCountdown';

// ─── Animated flip digit ──────────────────────────────────────────────────────

function FlipDigit({ value }: { value: string }) {
  return (
    <div className="relative inline-flex h-12 w-9 overflow-hidden rounded-lg bg-bg sm:h-14 sm:w-11">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '-110%', opacity: 0 }}
          animate={{ y: 0,        opacity: 1 }}
          exit={{    y: '110%',  opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center font-display text-xl font-black tabular-nums text-saffron sm:text-2xl"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Countdown block ──────────────────────────────────────────────────────────

function DealCountdown({ endsAt }: { endsAt: string | null }) {
  const { hours, minutes, seconds, isExpired } = useCountdown(endsAt);
  if (isExpired || !endsAt) return null;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.18em] text-cream/50 sm:text-xs">
        Ending in
      </span>
      <div className="flex items-end gap-1">
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-0.5">
            <FlipDigit value={pad(hours)[0]!} />
            <FlipDigit value={pad(hours)[1]!} />
          </div>
          <span className="text-[8px] uppercase tracking-[0.16em] text-cream/45">hrs</span>
        </div>
        <span className="pb-5 font-display text-xl font-bold text-cream/30">:</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-0.5">
            <FlipDigit value={pad(minutes)[0]!} />
            <FlipDigit value={pad(minutes)[1]!} />
          </div>
          <span className="text-[8px] uppercase tracking-[0.16em] text-cream/45">min</span>
        </div>
        <span className="pb-5 font-display text-xl font-bold text-cream/30">:</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-0.5">
            <FlipDigit value={pad(seconds)[0]!} />
            <FlipDigit value={pad(seconds)[1]!} />
          </div>
          <span className="text-[8px] uppercase tracking-[0.16em] text-cream/45">sec</span>
        </div>
      </div>
    </div>
  );
}

// ─── FlashDeals ───────────────────────────────────────────────────────────────

export function FlashDeals() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'flash-deals'],
    queryFn:  () => fetchProducts({ limit: 16, sortBy: 'newest' }),
    staleTime: 1000 * 60 * 2,
    select:   (d) => d.data.filter((p) => p.activeCampaign !== null),
  });

  const products = data ?? [];
  if (!isLoading && products.length === 0) return null;

  // Soonest-ending campaign for the countdown
  const earliest = products
    .map((p) => p.activeCampaign?.endsAt)
    .filter((d): d is string => Boolean(d))
    .sort()[0] ?? null;

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  }

  return (
    <section className="relative overflow-hidden bg-surface py-12 sm:py-16">

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-coral/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[350px] w-[350px] rounded-full bg-saffron/10 blur-3xl" />
      </div>

      <div className="container relative">

        {/* Header row */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          {/* Left: title + badge */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral/20 text-coral">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-black text-cream sm:text-3xl">
                Flash Deals
              </h2>
              <p className="text-xs text-cream/50">Limited-time offers — grab before they&apos;re gone!</p>
            </div>
          </div>

          {/* Right: countdown + view all */}
          <div className="flex flex-wrap items-center gap-4">
            <DealCountdown endsAt={earliest} />
            <Link
              to="/products?onSale=true"
              className="group hidden shrink-0 items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream/75 transition hover:border-saffron/50 hover:text-saffron sm:inline-flex"
            >
              View All Deals
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous products"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-cream/70 transition hover:bg-saffron hover:text-bg hover:shadow-[0_0_16px_-4px_hsl(var(--saffron)/0.6)] active:scale-90"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Next products"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron text-bg transition hover:bg-saffron/90 hover:shadow-[0_0_16px_-4px_hsl(var(--saffron)/0.6)] active:scale-90"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Product carousel */}
        <div
          ref={scrollRef}
          className="-mx-6 flex gap-4 overflow-x-auto scroll-smooth px-6 pb-4 scrollbar-hide snap-x"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-44 shrink-0 snap-start sm:w-48">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    delay: Math.min(i * 0.05, 0.3),
                    type: 'spring',
                    stiffness: 180,
                    damping: 22,
                  }}
                  className="w-44 shrink-0 snap-start sm:w-48"
                >
                  <ProductCard product={p} className="h-full" />
                </motion.div>
              ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to="/products?onSale=true"
            className="group inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-bg transition hover:bg-saffron/90 hover:shadow-[0_0_24px_-4px_hsl(var(--saffron)/0.6)]"
          >
            View All Deals
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
