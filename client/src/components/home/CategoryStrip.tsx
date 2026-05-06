import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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

interface CardProps {
  id:    string;
  name:  string;
  slug:  string;
  count: number;
  index: number;
}

function CategoryCard({ id, name, slug, count, index }: CardProps) {
  const meta = getMeta(slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.04, 0.24), type: 'spring', stiffness: 220, damping: 24 }}
      className="h-full"
    >
      <Link
        to={`/products?categoryId=${id}`}
        className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-saffron/40 active:scale-[0.98] sm:p-6"
        style={{ willChange: 'transform' }}
      >
        {/* Tinted background — opacity transition only (cheap) */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
            meta.tint,
          )}
        />

        {/* Top row: emoji */}
        <div className="relative z-10 flex items-start justify-between">
          <span className="text-4xl leading-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 sm:text-5xl">
            {meta.emoji}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/0 text-cream/0 transition-all duration-300 group-hover:bg-cream group-hover:text-bg">
            <ArrowRightIcon size={13} strokeWidth={2} className="-rotate-45" />
          </span>
        </div>

        {/* Bottom: name + count */}
        <div className="relative z-10 mt-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-cream/55">
            {count} item{count === 1 ? '' : 's'}
          </p>
          <h3 className="mt-1.5 font-display text-lg font-bold leading-tight text-cream sm:text-xl md:text-2xl">
            {name}
          </h3>
        </div>

        {/* Bottom edge accent line */}
        <span className="pointer-events-none absolute inset-x-5 bottom-3 h-px scale-x-0 bg-gradient-to-r from-transparent via-saffron to-transparent transition-transform duration-500 group-hover:scale-x-100 sm:inset-x-6" />
      </Link>
    </motion.div>
  );
}

export function CategoryStrip() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const sorted = [...categories].sort((a, b) => b._count.products - a._count.products);
  const tiles  = sorted.slice(0, 8);

  return (
    <section className="bg-bg py-16 sm:py-20 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
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
              className="display-lg mt-3 max-w-2xl text-cream sm:mt-4"
            >
              Pick an <em className="text-saffron">aisle.</em>
            </motion.h2>
          </div>
          <Link
            to="/products"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-cream transition-colors hover:border-saffron hover:text-saffron sm:inline-flex"
          >
            <span>All</span>
            <ArrowRightIcon size={13} />
          </Link>
        </div>

        {/* Grid — equal-sized tiles, no layout animation */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] skeleton rounded-2xl sm:aspect-[5/4]" />
              ))
            : tiles.map((cat, i) => (
                <div key={cat.id} className="aspect-[4/3] sm:aspect-[5/4]">
                  <CategoryCard
                    id={cat.id}
                    name={cat.name}
                    slug={cat.slug}
                    count={cat._count.products}
                    index={i}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
