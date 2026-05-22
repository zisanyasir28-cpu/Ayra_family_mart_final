import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  ArrowRight, Leaf as LeafIcon,
  Apple, Milk, Wheat, Cookie, Coffee, Droplets, Sparkles,
  ShoppingBasket, Fish, Beef, Croissant, Baby,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fetchCategories } from '../../services/categories';

// ─── Bilingual + watermark metadata (slug-keyed) ─────────────────────────────
const META: Record<string, {
  bangla:    string;
  display:   string;
  Watermark: LucideIcon;
  tint:      string;
}> = {
  vegetables:      { bangla: 'তাজা সবজি',         display: 'Fresh Vegetables',  Watermark: LeafIcon, tint: 'text-sage'    },
  fruits:          { bangla: 'ফল ও বাদাম',         display: 'Fruits & Nuts',     Watermark: Apple,    tint: 'text-coral'   },
  dairy:           { bangla: 'দুধ ও ডিম',          display: 'Dairy & Eggs',      Watermark: Milk,     tint: 'text-cream'   },
  beverages:       { bangla: 'পানীয়',             display: 'Beverages',          Watermark: Coffee,   tint: 'text-blush'   },
  snacks:          { bangla: 'স্ন্যাকস',           display: 'Snacks & Munchies', Watermark: Cookie,   tint: 'text-coral'   },
  rice:            { bangla: 'চাল ও শস্য',         display: 'Rice & Grains',     Watermark: Wheat,    tint: 'text-saffron' },
  household:       { bangla: 'হাউসহোল্ড কেয়ার',  display: 'Household Care',    Watermark: Droplets, tint: 'text-plum'    },
  'personal-care': { bangla: 'পার্সোনাল কেয়ার',  display: 'Personal Care',     Watermark: Sparkles, tint: 'text-blush'   },
  meat:            { bangla: 'মাংস ও পোল্ট্রি',   display: 'Meat & Poultry',    Watermark: Beef,     tint: 'text-coral'   },
  fish:            { bangla: 'মাছ ও সামুদ্রিক',   display: 'Fish & Seafood',    Watermark: Fish,     tint: 'text-plum'    },
  bakery:          { bangla: 'বেকারি',            display: 'Bakery',             Watermark: Croissant, tint: 'text-coral'  },
  baby:            { bangla: 'শিশু পণ্য',          display: 'Baby & Kids',       Watermark: Baby,     tint: 'text-saffron' },
};

function getMeta(slug: string) {
  for (const [key, m] of Object.entries(META)) {
    if (slug.includes(key)) return m;
  }
  return { bangla: 'আরও পণ্য', display: 'More', Watermark: ShoppingBasket, tint: 'text-cream' };
}

// ─── Pearl-glass category tile w/ watermark ──────────────────────────────────
interface TileProps {
  id:       string;
  name:     string;
  slug:     string;
  imageUrl: string | null;
  index:    number;
}

function CategoryTile({ id, name, slug, imageUrl, index }: TileProps) {
  const meta = getMeta(slug);
  const Watermark = meta.Watermark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        delay:     Math.min(index * 0.05, 0.3),
        type:      'spring',
        stiffness: 220,
        damping:   24,
      }}
      className="group relative p-[1.5px] rounded-2xl bg-gradient-to-br from-white/35 via-saffron/20 to-plum/12 transition-all duration-300 hover:from-white/55 hover:via-saffron/35 hover:to-plum/22 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_hsl(var(--saffron)/0.4)]"
    >
      <Link
        to={`/products?categoryId=${id}`}
        className="relative block aspect-square overflow-hidden rounded-[calc(1rem-1.5px)] bg-surface-2 active:scale-[0.97] transition-transform"
      >
        {/* Photo fill */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-surface">
            <Watermark className={`h-12 w-12 ${meta.tint}`} strokeWidth={1.5} />
          </div>
        )}

        {/* Decorative watermark icon (oversized, faint, top-right corner) */}
        <Watermark
          aria-hidden
          className={`pointer-events-none absolute -right-3 -top-3 z-[3] h-16 w-16 opacity-25 mix-blend-screen ${meta.tint}`}
          strokeWidth={1.2}
        />

        {/* Tiny sparkle dot — top-left for character */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-2 top-2 z-[3] h-1 w-1 rounded-full bg-white/70 shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]"
        />

        {/* Glass shine diagonal */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.14)_0%,transparent_42%)]"
        />

        {/* Bottom gradient overlay for label legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[62%] bg-gradient-to-t from-bg/95 via-bg/55 to-transparent" />

        {/* Labels overlaid on photo */}
        <div className="absolute inset-x-0 bottom-0 z-[5] px-2.5 pb-2 text-left">
          <p className="text-[11px] font-bold leading-tight text-cream drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
            {meta.display || name}
          </p>
          <p className="mt-0.5 font-bangla text-[10px] text-cream/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
            {meta.bangla}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton tile ───────────────────────────────────────────────────────────
function SkeletonTile() {
  return (
    <div className="p-[1.5px] rounded-2xl bg-gradient-to-br from-white/15 via-line/25 to-line/15">
      <div className="relative aspect-square overflow-hidden rounded-[calc(1rem-1.5px)] bg-surface">
        <div className="skeleton absolute inset-0" />
      </div>
    </div>
  );
}

// ─── CategoryStrip (content only — no section wrapper) ───────────────────────

export function CategoryStrip() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey:  ['categories'],
    queryFn:   fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const sorted = [...categories].sort((a, b) => b._count.products - a._count.products);
  const tiles  = sorted.slice(0, 8);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="font-display text-xl font-black text-cream sm:text-2xl"
          >
            Shop By Category{' '}
            <LeafIcon className="mb-1 inline h-5 w-5 text-sage sm:h-6 sm:w-6" aria-hidden />
          </motion.h2>
        </div>
        <Link
          to="/products"
          className="group hidden shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream/65 transition hover:text-saffron sm:inline-flex"
        >
          View All Categories
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 8-column grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-8">
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
      <div className="mt-5 flex justify-center sm:hidden">
        <Link
          to="/products"
          className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream/75 transition hover:border-saffron/50 hover:text-saffron"
        >
          View All Categories
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
