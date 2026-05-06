import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories } from '../../services/categories';
import { ArrowRightIcon } from '../common/HandIcon';
import { cn } from '../../lib/utils';

const META: Record<string, { emoji: string; tint: string }> = {
  fruits:        { emoji: '🥭', tint: 'from-saffron/30 to-coral/15'  },
  vegetables:    { emoji: '🥬', tint: 'from-sage/30 to-saffron/10'   },
  dairy:         { emoji: '🥛', tint: 'from-blush/30 to-cream/5'     },
  meat:          { emoji: '🥩', tint: 'from-coral/30 to-plum/15'     },
  fish:          { emoji: '🐟', tint: 'from-blush/30 to-saffron/10'  },
  bakery:        { emoji: '🥐', tint: 'from-saffron/30 to-blush/10'  },
  beverages:     { emoji: '☕', tint: 'from-plum/30 to-coral/15'     },
  snacks:        { emoji: '🍿', tint: 'from-saffron/30 to-coral/15'  },
  household:     { emoji: '🧴', tint: 'from-sage/30 to-blush/10'     },
  'personal-care': { emoji: '🌿', tint: 'from-sage/30 to-saffron/10' },
  baby:          { emoji: '🧸', tint: 'from-blush/30 to-saffron/10'  },
};

function getMeta(slug: string) {
  for (const [key, m] of Object.entries(META)) {
    if (slug.includes(key)) return m;
  }
  return { emoji: '🛒', tint: 'from-cream/15 to-cream/5' };
}

// ─── Single accordion-style card ──────────────────────────────────────────────

interface CardProps {
  id:          string;
  name:        string;
  slug:        string;
  count:       number;
  hovered:     boolean;
  onHover:     () => void;
  index:       number;
}

function CategoryCard({ id, name, slug, count, hovered, onHover, index }: CardProps) {
  const meta = getMeta(slug);

  return (
    <motion.div
      onMouseEnter={onHover}
      onFocus={onHover}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 24 }}
      animate={{
        flexGrow: hovered ? 4 : 1,
      }}
      style={{ flexBasis: 0, willChange: 'flex-grow' }}
      className="relative min-h-[280px] sm:min-h-[360px]"
    >
      <Link
        to={`/products?categoryId=${id}`}
        className={cn(
          'group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-colors duration-500',
          hovered && 'border-saffron/40',
        )}
      >
        {/* Tinted background gradient */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-700',
            meta.tint,
            hovered && 'opacity-100',
          )}
        />
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-30" />

        {/* Top: emoji */}
        <div className="relative z-10 flex items-start justify-between">
          <motion.span
            animate={{ scale: hovered ? 1.4 : 1, rotate: hovered ? -8 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="text-5xl leading-none sm:text-6xl"
          >
            {meta.emoji}
          </motion.span>
          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-bg"
              >
                <ArrowRightIcon size={14} strokeWidth={2} className="-rotate-45" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: content */}
        <div className="relative z-10 mt-auto">
          <p className="text-[10px] uppercase tracking-[0.22em] text-cream/55">
            {count} item{count === 1 ? '' : 's'}
          </p>
          <h3
            className={cn(
              'mt-2 font-display font-bold leading-tight text-cream transition-all duration-500',
              hovered ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl',
            )}
          >
            {name}
          </h3>

          {/* Reveal text on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: 8 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="mt-3 max-w-md font-display text-sm italic text-cream/70"
              >
                Browse the full collection — fresh stock, daily.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom edge underline */}
        <span
          className={cn(
            'pointer-events-none absolute inset-x-6 bottom-4 h-px bg-gradient-to-r from-transparent via-saffron to-transparent transition-opacity duration-500',
            hovered ? 'opacity-100' : 'opacity-0',
          )}
        />
      </Link>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function CategoryStrip() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const sorted = [...categories].sort((a, b) => b._count.products - a._count.products);
  const tiles  = sorted.slice(0, 6);

  // Track which card is hovered/focused — drives the "expand" animation
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="bg-bg py-20 sm:py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              <span>Aisles · <span className="font-bangla text-cream/85 normal-case tracking-normal">বাজার</span></span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="display-lg mt-4 max-w-2xl text-cream"
            >
              Hover to <em className="text-saffron">explore.</em>
            </motion.h2>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-cream transition-colors hover:border-saffron hover:text-saffron md:inline-flex"
          >
            All categories
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {/* Accordion strip — desktop */}
        <div className="hidden gap-3 md:flex">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-h-[360px] flex-1 skeleton rounded-2xl" />
              ))
            : tiles.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  count={cat._count.products}
                  hovered={activeIdx === i}
                  onHover={() => setActiveIdx(i)}
                  index={i}
                />
              ))}
        </div>

        {/* Mobile: 2-col grid (each tile is hovered=true so they look right) */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-h-[200px] skeleton rounded-2xl" />
              ))
            : tiles.map((cat, i) => (
                <div key={cat.id} className="min-h-[200px]">
                  <CategoryCard
                    id={cat.id}
                    name={cat.name}
                    slug={cat.slug}
                    count={cat._count.products}
                    hovered
                    onHover={() => {}}
                    index={i}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
