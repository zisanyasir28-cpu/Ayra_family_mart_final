import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { TrendingUp, Trophy } from 'lucide-react';
import { fetchProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';
import { ArrowRightIcon } from '../common/HandIcon';
import { SectionHeader } from './SectionHeader';
import { cn } from '../../lib/utils';

// Rank medallion tones — gold / silver / bronze for the podium feel.
function rankClass(rank: number): string {
  if (rank === 2) return 'bg-cream text-bg';
  if (rank === 3) return 'bg-coral text-bg';
  return 'bg-surface text-cream/70 ring-1 ring-line';
}

export function BestSellers() {
  const { data, isLoading } = useQuery({
    queryKey:  ['products', 'best-sellers'],
    queryFn:   () => fetchProducts({ collection: 'best-sellers', limit: 5 }),
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.data ?? [];
  // Ranked by real sales — if there are no orders yet, hide the section
  // rather than show an empty shelf or fake "popular" picks.
  if (!isLoading && products.length === 0) return null;

  const hero      = products[0];
  const runnersUp = products.slice(1, 5);

  return (
    <section className="bg-surface/30 py-20 sm:py-24">
      <div className="container">
        <SectionHeader
          icon={TrendingUp}
          eyebrow="Most Loved"
          bangla="সবার পছন্দ"
          accent="coral"
          viewAllHref="/products?collection=best-sellers"
          title={
            <>
              What everyone&apos;s buying — <em className="text-coral">best sellers.</em>
            </>
          }
        />

        {isLoading ? (
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="lg:w-[38%]"><ProductCardSkeleton /></div>
            <div className="grid flex-1 grid-cols-2 gap-4 sm:gap-5">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start gap-5 lg:flex-row"
          >
            {/* ── #1 spotlight ── */}
            {hero && (
              <div className="relative w-full lg:w-[38%]">
                {/* Gold glow behind the champion */}
                <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-[2.2rem] bg-coral/10 blur-2xl" />
                {/* Champion ribbon — English primary, Bengali accent */}
                <div className="absolute -left-1.5 -top-3 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-coral to-saffron px-3 py-1.5 text-[11px] font-extrabold text-bg shadow-[0_6px_18px_-4px_hsl(var(--coral)/0.6)]">
                  <Trophy className="h-3.5 w-3.5" strokeWidth={2.4} />
                  <span className="tracking-wide">#1 Best Seller</span>
                  <span aria-hidden className="h-1 w-1 rounded-full bg-bg/50" />
                  <span className="font-bangla font-bold">জনপ্রিয়</span>
                </div>
                <ProductCard product={hero} emphasis className="relative h-full" />
              </div>
            )}

            {/* ── Runners-up 2×2 ── */}
            <div className="grid w-full flex-1 grid-cols-2 gap-4 sm:gap-5">
              {runnersUp.map((p, i) => {
                const rank = i + 2;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 22 }}
                    className="relative"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -left-1.5 -top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-black shadow-lg',
                        rankClass(rank),
                      )}
                    >
                      {rank}
                    </span>
                    <ProductCard product={p} className="h-full" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Mobile "view all" */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            to="/products?collection=best-sellers"
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
