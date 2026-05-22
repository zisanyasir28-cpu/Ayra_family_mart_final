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

// ─── Metadata (slug-keyed) ────────────────────────────────────────────────────
const META: Record<string, {
  bangla:    string;
  display:   string;
  Icon:      LucideIcon;
  tint:      string;      // icon colour
  chipBg:    string;      // floating chip ring tint
  bgFrom:    string;      // no-photo fallback gradient
}> = {
  vegetables:      { bangla: 'তাজা সবজি',        display: 'Fresh Vegetables',  Icon: LeafIcon,  tint: 'text-sage',    chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--sage)/0.25)]',    bgFrom: 'from-sage/32 via-sage/16'    },
  fruits:          { bangla: 'ফল ও বাদাম',        display: 'Fruits & Nuts',     Icon: Apple,     tint: 'text-coral',   chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--coral)/0.25)]',   bgFrom: 'from-coral/30 via-coral/15'  },
  dairy:           { bangla: 'দুধ ও ডিম',         display: 'Dairy & Eggs',      Icon: Milk,      tint: 'text-cream',   chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]',  bgFrom: 'from-cream/26 via-cream/12'  },
  beverages:       { bangla: 'পানীয়',            display: 'Beverages',          Icon: Coffee,    tint: 'text-blush',   chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--blush)/0.25)]',  bgFrom: 'from-blush/30 via-blush/14'  },
  snacks:          { bangla: 'স্ন্যাকস',          display: 'Snacks & Munchies', Icon: Cookie,    tint: 'text-coral',   chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--coral)/0.22)]',  bgFrom: 'from-coral/28 via-saffron/12'},
  rice:            { bangla: 'চাল ও শস্য',        display: 'Rice & Grains',     Icon: Wheat,     tint: 'text-saffron', chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--saffron)/0.25)]', bgFrom: 'from-saffron/30 via-saffron/14'},
  household:       { bangla: 'হাউসহোল্ড কেয়ার', display: 'Household Care',    Icon: Droplets,  tint: 'text-plum',    chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--plum)/0.28)]',   bgFrom: 'from-plum/30 via-plum/14'   },
  'personal-care': { bangla: 'পার্সোনাল কেয়ার', display: 'Personal Care',     Icon: Sparkles,  tint: 'text-blush',   chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--blush)/0.22)]',  bgFrom: 'from-blush/28 via-blush/12' },
  meat:            { bangla: 'মাংস ও পোল্ট্রি',  display: 'Meat & Poultry',    Icon: Beef,      tint: 'text-coral',   chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--coral)/0.22)]',  bgFrom: 'from-coral/26 via-coral/12' },
  fish:            { bangla: 'মাছ ও সামুদ্রিক',  display: 'Fish & Seafood',    Icon: Fish,      tint: 'text-plum',    chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--plum)/0.25)]',   bgFrom: 'from-plum/26 via-plum/12'   },
  bakery:          { bangla: 'বেকারি',           display: 'Bakery',             Icon: Croissant, tint: 'text-coral',   chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--coral)/0.22)]',  bgFrom: 'from-coral/26 via-saffron/12'},
  baby:            { bangla: 'শিশু পণ্য',         display: 'Baby & Kids',       Icon: Baby,      tint: 'text-saffron', chipBg: 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_hsl(var(--saffron)/0.22)]', bgFrom: 'from-saffron/26 via-saffron/12'},
};

function getMeta(slug: string) {
  for (const [key, m] of Object.entries(META)) {
    if (slug.includes(key)) return m;
  }
  return {
    bangla:  'আরও পণ্য',
    display: 'More',
    Icon:    ShoppingBasket,
    tint:    'text-cream',
    chipBg:  'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]',
    bgFrom:  'from-surface-2 via-surface',
  };
}

// ─── Category tile ────────────────────────────────────────────────────────────
interface TileProps {
  id:       string;
  name:     string;
  slug:     string;
  imageUrl: string | null;
  index:    number;
}

function CategoryTile({ id, name, slug, imageUrl, index }: TileProps) {
  const meta = getMeta(slug);
  const Icon = meta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: Math.min(index * 0.05, 0.3), type: 'spring', stiffness: 220, damping: 24 }}
      // Pearl-shimmer ring — reduced to rounded-xl
      className="group relative p-[1.5px] rounded-xl bg-gradient-to-br from-white/35 via-saffron/18 to-plum/12 transition-all duration-300 hover:from-white/55 hover:via-saffron/32 hover:to-plum/22 hover:-translate-y-1 hover:shadow-[0_10px_26px_-8px_hsl(var(--saffron)/0.35)]"
    >
      <Link
        to={`/products?categoryId=${id}`}
        className="relative block aspect-square overflow-hidden rounded-[calc(0.75rem-1.5px)] bg-surface active:scale-[0.97] transition-transform"
      >
        {/* ── Photo fill ── */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          /* ── No-photo: coloured glass gradient + centred icon ── */
          <div className={`absolute inset-0 z-[1] bg-gradient-to-br ${meta.bgFrom} to-bg`}>
            {/* Large very-faint background watermark */}
            <Icon
              aria-hidden
              className={`absolute inset-0 m-auto h-[60%] w-[60%] opacity-[0.07] ${meta.tint}`}
              strokeWidth={0.8}
            />
          </div>
        )}

        {/* Tiny sparkle — top-left */}
        <div aria-hidden className="pointer-events-none absolute left-2 top-2 z-[3] h-1 w-1 rounded-full bg-white/75 shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]" />

        {/* Glass shine diagonal */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.14)_0%,transparent_44%)]" />

        {/* Bottom label gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[65%] bg-gradient-to-t from-bg/96 via-bg/60 to-transparent" />

        {/* ── 3D floating icon chip — top-right ── */}
        <div
          aria-hidden
          className={`pointer-events-none absolute right-2 top-2 z-[6] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-bg/78 ring-1 ring-white/22 ${meta.chipBg} transition-transform duration-300 group-hover:-translate-y-0.5`}
        >
          <Icon
            className={`h-[13px] w-[13px] ${meta.tint} drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]`}
            strokeWidth={2}
          />
        </div>

        {/* Labels */}
        <div className="absolute inset-x-0 bottom-0 z-[5] px-2 pb-1.5 text-left">
          <p className="text-[10.5px] font-bold leading-tight text-cream drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
            {meta.display || name}
          </p>
          <p className="mt-0.5 font-bangla text-[9.5px] text-cream/78 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
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
    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-white/15 via-line/25 to-line/15">
      <div className="relative aspect-square overflow-hidden rounded-[calc(0.75rem-1.5px)] bg-surface">
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

        <Link
          to="/products"
          className="group hidden shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream/65 transition hover:text-saffron sm:inline-flex"
        >
          View All
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
