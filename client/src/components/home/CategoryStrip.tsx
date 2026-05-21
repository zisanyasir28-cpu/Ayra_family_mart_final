import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
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
        className="group flex flex-col overflow-hidden rounded-2xl border border-line/50 bg-surface text-center transition-all duration-300 hover:-translate-y-1 hover:border-saffron/40 hover:shadow-[0_8px_24px_-8px_hsl(var(--saffron)/0.25)] active:scale-[0.97]"
      >
        {/* Photo area — image if available, else emoji fallback */}
        <div className="aspect-square overflow-hidden bg-surface-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${meta.accent}`}
            >
              {meta.emoji}
            </div>
          )}
        </div>

        {/* Labels */}
        <div className="p-2">
          <p className="text-[11px] font-bold leading-tight text-cream">
            {meta.display || name}
          </p>
          <p className="mt-0.5 font-bangla text-[10px] text-cream/40">
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line/50 bg-surface">
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-1.5 p-2">
        <div className="skeleton mx-auto h-3 w-3/4 rounded" />
        <div className="skeleton mx-auto h-2.5 w-1/2 rounded" />
      </div>
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
              Shop By Category 🌿
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
