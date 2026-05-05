import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { fetchProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';
import { useCountdown } from '../../hooks/useCountdown';

// ─── Flip digit ───────────────────────────────────────────────────────────────

function FlipDigit({ value }: { value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ y: -12, opacity: 0 }}
      animate={{ y:   0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className="inline-block min-w-[1.6rem] text-center font-extrabold tabular-nums"
    >
      {value}
    </motion.span>
  );
}

// ─── Per-product countdown ────────────────────────────────────────────────────

function DealCountdown({ endsAt }: { endsAt: string | null }) {
  const { hours, minutes, seconds, isExpired } = useCountdown(endsAt);
  if (isExpired || !endsAt) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-orange-600">
      <Zap className="h-3 w-3 fill-orange-500" />
      <div className="flex items-center gap-0.5 font-mono font-semibold">
        <FlipDigit value={pad(hours)} />
        <span className="opacity-60">:</span>
        <FlipDigit value={pad(minutes)} />
        <span className="opacity-60">:</span>
        <FlipDigit value={pad(seconds)} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FlashDeals() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'flash-deals'],
    queryFn:  () => fetchProducts({ limit: 16, sortBy: 'newest' }),
    staleTime: 1000 * 60 * 2,
    select:   (d) => d.data.filter((p) => p.activeCampaign !== null),
  });

  const products = data ?? [];

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  }

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-10">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Background glow */}
      <div className="pointer-events-none absolute -top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-[200px] w-[200px] rounded-full bg-red-600/10 blur-3xl" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="section-header mb-6">
          <div className="flex items-center gap-3">
            {/* Fire icon */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-glow-red">
              <Zap className="h-5 w-5 fill-white text-white" />
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-orange-400"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-white">Flash Deals</h2>
                <span className="animate-live rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-white/50">Limited-time offers — grab before time runs out</p>
            </div>
          </div>

          <Link
            to="/products?deals=true"
            className="flex items-center gap-1 text-sm font-semibold text-orange-400 transition-all hover:gap-2 hover:text-orange-300"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Scrollable product row */}
        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/3 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-hide">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-48 shrink-0">
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.055, type: 'spring', stiffness: 180, damping: 22 }}
                    className="w-48 shrink-0 flex flex-col"
                  >
                    <ProductCard product={p} />
                    <DealCountdown endsAt={p.activeCampaign?.endsAt ?? null} />
                  </motion.div>
                ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/3 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
