import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Award, AlertTriangle, PackageSearch } from 'lucide-react';
import { fetchBrands } from '../../services/brands';
import type { ApiBrand } from '../../types/api';
import { cn } from '../../lib/utils';

// ─── Initial-avatar styling ─────────────────────────────────────────────────
// No brand has a logo in the catalog, so every brand renders as a tinted
// initial avatar. Colour is derived deterministically from the brand name so a
// brand always gets the same gradient.

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

/** Up to two initials from the brand name (e.g. "ACI Pure" → "AP", "Pran" → "P"). */
function brandInitials(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

// ─── Brand card ──────────────────────────────────────────────────────────────

function BrandCard({ brand }: { brand: ApiBrand }) {
  const grad = brandGradient(brand.name);
  return (
    <Link
      to={`/products?brandId=${brand.id}`}
      className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-line/60 bg-surface p-5 text-center transition-all hover:-translate-y-0.5 hover:border-saffron/40 hover:shadow-[0_10px_28px_-12px_hsl(var(--saffron)/0.35)]"
    >
      {/* Soft glow on hover */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25',
          grad,
        )}
      />

      {/* Initial avatar (logo fallback) */}
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          loading="lazy"
          className="relative h-16 w-16 rounded-full object-contain"
        />
      ) : (
        <span
          className={cn(
            'relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br font-display text-xl font-black text-bg shadow-[0_6px_16px_-6px_hsl(var(--saffron)/0.5)] [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]',
            grad,
          )}
        >
          {brandInitials(brand.name)}
        </span>
      )}

      <span className="relative line-clamp-2 font-display text-sm font-bold leading-tight text-cream">
        {brand.name}
      </span>
      <span className="relative text-[11px] text-cream/45">
        {brand.productCount} {brand.productCount === 1 ? 'product' : 'products'}
      </span>
    </Link>
  );
}

function BrandCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line/60 bg-surface p-5">
      <span className="h-16 w-16 animate-pulse rounded-full bg-surface-2" />
      <span className="h-3.5 w-20 animate-pulse rounded-full bg-surface-2" />
      <span className="h-2.5 w-12 animate-pulse rounded-full bg-surface-2" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const { data: brands = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="container py-8">
      {/* Heading */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum/20 text-plum">
          <Award className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black text-cream sm:text-3xl">Brands</h1>
          <p className="mt-0.5 text-sm text-cream/55">
            {isLoading ? 'Loading brands…' : `Shop ${brands.length} brands available at Ayra`}
          </p>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2">
            <AlertTriangle className="h-12 w-12 text-coral/60" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold text-cream">Couldn&apos;t load brands</h3>
          <p className="mt-2 max-w-xs text-sm text-cream/55">
            Something went wrong. Check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="btn-grad mt-6 rounded-full px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] transition active:scale-95"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && brands.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2">
            <PackageSearch className="h-12 w-12 text-cream/25" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold text-cream">No brands yet</h3>
          <p className="mt-2 max-w-xs text-sm text-cream/55">
            Brands will appear here once products are tagged with them.
          </p>
        </div>
      )}

      {/* Grid */}
      {!isError && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <BrandCardSkeleton key={i} />)
            : brands.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                >
                  <BrandCard brand={b} />
                </motion.div>
              ))}
        </div>
      )}
    </div>
  );
}
