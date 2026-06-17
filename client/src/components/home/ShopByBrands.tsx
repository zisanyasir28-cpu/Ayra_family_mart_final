import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowRight, Award } from 'lucide-react';
import { fetchBrands } from '../../services/brands';
import type { ApiBrand } from '../../types/api';
import { cn } from '../../lib/utils';

// ─── Helpers (deterministic — same brand always gets the same gradient) ───────

const GRADIENTS = [
  'from-saffron to-blush',
  'from-coral to-saffron',
  'from-sage to-coral',
  'from-plum to-saffron',
  'from-blush to-coral',
  'from-plum to-blush',
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function brandGradient(name: string): string {
  return GRADIENTS[hashString(name) % GRADIENTS.length]!;
}

function brandInitials(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

// ─── Brand tile ───────────────────────────────────────────────────────────────

function BrandTile({ brand, index }: { brand: ApiBrand; index: number }) {
  const grad = brandGradient(brand.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: Math.min(index * 0.05, 0.3), type: 'spring', stiffness: 220, damping: 24 }}
      className="group relative p-[1.5px] rounded-xl bg-gradient-to-br from-white/35 via-saffron/18 to-plum/12 transition-all duration-300 hover:from-white/55 hover:via-saffron/32 hover:to-plum/22 hover:-translate-y-1 hover:shadow-[0_10px_26px_-8px_hsl(var(--saffron)/0.35)]"
    >
      <Link
        to={`/products?brandId=${brand.id}`}
        className="relative flex flex-col items-center overflow-hidden rounded-[calc(0.75rem-1.5px)] bg-surface active:scale-[0.97] transition-transform pb-3 pt-4 px-2"
      >
        {/* Soft glow that blooms on hover */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20',
            grad,
          )}
        />

        {/* Avatar */}
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={brand.name}
            loading="lazy"
            decoding="async"
            className="relative mb-2.5 h-12 w-12 rounded-full object-contain"
          />
        ) : (
          <span
            className={cn(
              'relative mb-2.5 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br font-display text-sm font-black text-bg shadow-[0_6px_14px_-6px_hsl(var(--saffron)/0.55)] [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-105',
              grad,
            )}
          >
            {brandInitials(brand.name)}
          </span>
        )}

        {/* Sparkle */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-2 top-2 z-[3] h-1 w-1 rounded-full"
          style={{ background: 'hsl(var(--shine-color)/0.75)', boxShadow: '0 0 8px 2px hsl(var(--shine-color)/0.6)' }}
        />

        {/* Name + count */}
        <p className="relative text-center text-[10.5px] font-bold leading-tight text-foreground truncate w-full px-1">
          {brand.name}
        </p>
        <p className="relative mt-0.5 text-[9px] text-foreground/45">
          {brand.productCount} {brand.productCount === 1 ? 'item' : 'items'}
        </p>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonTile() {
  return (
    <div className="p-[1.5px] rounded-xl bg-gradient-to-br from-white/15 via-line/25 to-line/15">
      <div className="flex flex-col items-center gap-2 rounded-[calc(0.75rem-1.5px)] bg-surface pb-3 pt-4 px-2">
        <span className="h-12 w-12 animate-pulse rounded-full bg-surface-2" />
        <span className="h-2.5 w-14 animate-pulse rounded-full bg-surface-2" />
        <span className="h-2 w-8 animate-pulse rounded-full bg-surface-2" />
      </div>
    </div>
  );
}

// ─── ShopByBrands ─────────────────────────────────────────────────────────────

export function ShopByBrands() {
  const { data: brands = [], isLoading } = useQuery({
    queryKey:  ['brands'],
    queryFn:   fetchBrands,
    staleTime: 1000 * 60 * 10,
  });

  const tiles = brands.slice(0, 8);

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
          Shop By Brand{' '}
          <Award className="mb-1 inline h-5 w-5 text-plum sm:h-6 sm:w-6" aria-hidden />
        </motion.h2>

        <Link
          to="/brands"
          className="group hidden shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream/65 transition hover:text-saffron sm:inline-flex"
        >
          View All Brands
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 8-column grid */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-8">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonTile key={i} />)
          : tiles.map((brand, i) => (
              <BrandTile key={brand.id} brand={brand} index={i} />
            ))}
      </div>

      {/* Mobile "View All" */}
      <div className="mt-5 flex justify-center sm:hidden">
        <Link
          to="/brands"
          className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream/75 transition hover:border-saffron/50 hover:text-saffron"
        >
          View All Brands
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
