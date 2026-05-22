import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowRight, Leaf } from 'lucide-react';
import { fetchCategories } from '../../services/categories';

// ─── Bilingual + emoji metadata (slug-keyed) ─────────────────────────────────
const META: Record<string, { emoji: string; bangla: string; display: string; accent: string }> = {
  vegetables:       { emoji: '🥬', bangla: 'তাজা সবজি',         display: 'Fresh Vegetables', accent: 'bg-sage/15 text-sage'    },
  fruits:           { emoji: '🍎', bangla: 'ফল ও বাদাম',        display: 'Fruits & Nuts',     accent: 'bg-coral/15 text-coral'  },
  dairy:            { emoji: '🥛', bangla: 'দুধ ও ডিম',          display: 'Dairy & Eggs',      accent: 'bg-blush/15 text-blush'  },
  beverages:        { emoji: '🥤', bangla: 'পানীয়',              display: 'Beverages',          accent: 'bg-plum/15 text-plum'    },
  snacks:           { emoji: '🍿', bangla: 'স্ন্যাকস',           display: 'Snacks & Munchies', accent: 'bg-coral/15 text-coral'  },
  rice:             { emoji: '🌾', bangla: 'চাল ও শস্য',         display: 'Rice & Grains',     accent: 'bg-sage/15 text-sage'    },
  household:        { emoji: '🧴', bangla: 'হাউসহোল্ড কেয়ার',  display: 'Household Care',    accent: 'bg-blush/15 text-blush'  },
  'personal-care':  { emoji: '🌿', bangla: 'পার্সোনাল কেয়ার',  display: 'Personal Care',     accent: 'bg-saffron/15 text-saffron' },
  meat:             { emoji: '🥩', bangla: 'মাংস ও পোল্ট্রি',   display: 'Meat & Poultry',    accent: 'bg-coral/15 text-coral'  },
  fish:             { emoji: '🐟', bangla: 'মাছ ও সামুদ্রিক',   display: 'Fish & Seafood',    accent: 'bg-plum/15 text-plum'    },
  bakery:           { emoji: '🥐', bangla: 'বেকারি',             display: 'Bakery',             accent: 'bg-coral/15 text-coral'  },
  baby:             { emoji: '🧸', bangla: 'শিশু পণ্য',          display: 'Baby & Kids',       accent: 'bg-saffron/15 text-saffron' },
};

function getMeta(slug: string) {
  for (const [key, m] of Object.entries(META)) {
    if (slug.includes(key)) return m;
  }
  return { emoji: '🛒', bangla: 'আরও পণ্য', display: 'More', accent: 'bg-line/40 text-cream/60' };
}

// ─── Compact category tile ────────────────────────────────────────────────────
interface TileProps {
  id:       string;
  name:     string;
  slug:     string;
  imageUrl: string | null;
  index:    number;
}

function CategoryTile({ id, name, slug, imageUrl, index }: TileProps) {
  const meta = getMeta(slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        delay: Math.min(index * 0.05, 0.3),
        type: 'spring',
        stiffness: 220,
        damping: 24,
      }}
    >
      <Link
        to={`/products?categoryId=${id}`}
        className="group relative block aspect-square overflow-hidden rounded-2xl ring-1 ring-line/50 transition-all duration-300 hover:-translate-y-1 hover:ring-saffron/45 hover:shadow-[0_10px_28px_-10px_hsl(var(--saffron)/0.35)] active:scale-[0.97]"
      >
        {/* Photo fill */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${meta.accent}`}
          >
            {meta.emoji}
          </div>
        )}

        {/* Bottom gradient overlay for label legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bg/95 via-bg/60 to-transparent" />

        {/* Labels overlaid on photo */}
        <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2 text-left">
          <p className="text-[11px] font-bold leading-tight text-cream drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {meta.display || name}
          </p>
          <p className="mt-0.5 font-bangla text-[10px] text-cream/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {meta.bangla}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton tile ────────────────────────────────────────────────────────────
function SkeletonTile() {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-line/50">
      <div className="skeleton absolute inset-0" />
    </div>
  );
}

// ─── CategoryStrip ────────────────────────────────────────────────────────────

export function CategoryStrip() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const sorted = [...categories].sort((a, b) => b._count.products - a._count.products);
  const tiles  = sorted.slice(0, 8);

  return (
    <section className="bg-bg py-12 sm:py-16">
      <div className="container">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="font-display text-2xl font-black text-cream sm:text-3xl"
            >
              Shop By Category{' '}
              <Leaf className="mb-1 inline h-6 w-6 text-sage sm:h-7 sm:w-7" aria-hidden />
            </motion.h2>
            <p className="mt-1 text-sm text-cream/50">
              Explore fresh picks across every aisle
            </p>
          </div>
          <Link
            to="/products"
            className="group hidden shrink-0 items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream/75 transition hover:border-saffron/50 hover:text-saffron sm:inline-flex"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 8-column grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonTile key={i} />)
            : tiles.map((cat, i) => (
                <CategoryTile
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  imageUrl={cat.imageUrl}
                  index={i}
                />
              ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream/75 transition hover:border-saffron/50 hover:text-saffron"
          >
            View All Categories
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
