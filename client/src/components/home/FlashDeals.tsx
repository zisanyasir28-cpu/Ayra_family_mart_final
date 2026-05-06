import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';
import { useCountdown } from '../../hooks/useCountdown';
import { ArrowRightIcon } from '../common/HandIcon';
import { cn } from '../../lib/utils';

// ─── Flip digit ──────────────────────────────────────────────────────────────

function FlipDigit({ value }: { value: string }) {
  return (
    <div className="relative inline-flex h-14 w-10 overflow-hidden rounded-lg bg-bg sm:h-16 sm:w-12">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '-110%', opacity: 0 }}
          animate={{ y: 0,         opacity: 1 }}
          exit={{    y: '110%',   opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center font-display text-2xl font-black tabular-nums text-saffron sm:text-3xl"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Page-level countdown ────────────────────────────────────────────────────

function HeadlineCountdown({ endsAt }: { endsAt: string | null }) {
  const { hours, minutes, seconds, isExpired } = useCountdown(endsAt);
  if (isExpired || !endsAt) return null;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-end gap-1.5">
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1">
          <FlipDigit value={pad(hours)[0]!} />
          <FlipDigit value={pad(hours)[1]!} />
        </div>
        <span className="text-[9px] uppercase tracking-[0.18em] text-cream/55">hours</span>
      </div>
      <span className="pb-6 font-display text-3xl font-bold text-cream/40 sm:text-4xl">:</span>
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1">
          <FlipDigit value={pad(minutes)[0]!} />
          <FlipDigit value={pad(minutes)[1]!} />
        </div>
        <span className="text-[9px] uppercase tracking-[0.18em] text-cream/55">min</span>
      </div>
      <span className="pb-6 font-display text-3xl font-bold text-cream/40 sm:text-4xl">:</span>
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1">
          <FlipDigit value={pad(seconds)[0]!} />
          <FlipDigit value={pad(seconds)[1]!} />
        </div>
        <span className="text-[9px] uppercase tracking-[0.18em] text-cream/55">sec</span>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

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

  // Use the soonest-ending campaign for the page-level countdown
  const earliest = products
    .map((p) => p.activeCampaign?.endsAt)
    .filter((d): d is string => Boolean(d))
    .sort()[0] ?? null;

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  }

  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-24">
      {/* Background elements */}
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[500px] w-[500px] rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-saffron/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="container relative">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow text-coral">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
              </span>
              <span>Flash · Limited time</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="display-lg mt-4 max-w-xl text-cream"
            >
              Today's deals,<br />
              <em className="text-coral">vanishing quickly.</em>
            </motion.h2>
          </div>

          {earliest && (
            <div className="flex flex-col gap-3 lg:items-end">
              <span className="text-[11px] uppercase tracking-[0.22em] text-cream/55">
                First deal ends in
              </span>
              <HeadlineCountdown endsAt={earliest} />
            </div>
          )}
        </div>

        {/* Scroll controls */}
        <div className="mb-6 flex items-center justify-end gap-2">
          {[
            { dir: 'left'  as const, label: 'Previous' },
            { dir: 'right' as const, label: 'Next'     },
          ].map(({ dir, label }) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream transition hover:border-saffron hover:text-saffron active:scale-90"
            >
              <ArrowRightIcon
                size={14}
                strokeWidth={2}
                className={cn(dir === 'left' && 'rotate-180')}
              />
            </button>
          ))}
        </div>

        {/* Product row */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 scrollbar-hide snap-x"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-60 shrink-0 snap-start">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 180, damping: 22 }}
                  className="w-60 shrink-0 snap-start"
                >
                  <ProductCard product={p} className="h-full" />
                </motion.div>
              ))}
        </div>

        {/* Footer link */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/products?deals=true"
            className="group inline-flex items-center gap-3 rounded-full bg-coral px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-bg transition-all hover:bg-saffron hover:shadow-saffron"
          >
            See all deals
            <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
