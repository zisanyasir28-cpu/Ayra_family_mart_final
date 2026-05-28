import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { SlidersHorizontal, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { fetchProducts } from '../../services/products';
import { fetchCategories } from '../../services/categories';
import { ProductCard, ProductCardSkeleton } from '../../components/product/ProductCard';
import { FilterSidebar, type FilterState } from '../../components/products/FilterSidebar';
import { AyraSpinner } from '../../components/ui/AyraLoader';
import { cn } from '../../lib/utils';

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'       },
  { value: 'oldest',     label: 'Oldest First'       },
  { value: 'price_asc',  label: 'Price: Low → High'  },
  { value: 'price_desc', label: 'Price: High → Low'  },
  { value: 'name_asc',   label: 'Name: A–Z'          },
  { value: 'name_desc',  label: 'Name: Z–A'          },
] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page:       number;
  totalPages: number;
  onChange:   (p: number) => void;
  disabled?:  boolean;
}

function Pagination({ page, totalPages, onChange, disabled = false }: PaginationProps) {
  const [inputVal, setInputVal] = useState(String(page));
  useEffect(() => setInputVal(String(page)), [page]);
  if (totalPages <= 1) return null;

  function getPages(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)              return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  }

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(inputVal, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) onChange(p);
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1 || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-cream/60 transition hover:border-saffron/50 hover:text-saffron disabled:opacity-35 active:scale-90"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`el-${i}`} className="flex h-8 w-8 items-center justify-center text-cream/35">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              disabled={disabled}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition disabled:pointer-events-none',
                p === page
                  ? 'bg-saffron text-bg shadow-[0_0_12px_-2px_hsl(var(--saffron)/0.6)]'
                  : 'border border-line text-cream/70 hover:border-saffron/40 hover:text-saffron',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-cream/60 transition hover:border-saffron/50 hover:text-saffron disabled:opacity-35 active:scale-90"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Go-to page (desktop) */}
      <form onSubmit={handleGo} className="hidden items-center gap-2 text-sm sm:flex">
        <span className="text-cream/50">Go to page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-14 rounded-xl border border-line bg-surface px-2 py-1 text-center text-sm text-cream focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25"
        />
        <button
          type="submit"
          className="rounded-full border border-saffron/40 px-3 py-1 text-xs font-semibold text-saffron transition hover:bg-saffron/10"
        >
          Go
        </button>
      </form>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2">
        <PackageSearch className="h-12 w-12 text-cream/25" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-cream">No products found</h3>
      <p className="mt-2 max-w-xs text-sm text-cream/55">
        Try adjusting your filters or search terms to find what you&apos;re looking for.
      </p>
      <button
        onClick={onClear}
        className="btn-grad mt-6 rounded-full px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] transition active:scale-95"
      >
        Clear Filters
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const LIMIT = 12;
const EMPTY_FILTERS: FilterState = { categoryId: '', minPrice: '', maxPrice: '', inStock: false };

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Derive all state from URL
  const page       = parseInt(searchParams.get('page')       ?? '1', 10);
  const sortBy     = searchParams.get('sortBy')     ?? 'newest';
  const search     = searchParams.get('search')     ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const minPrice   = searchParams.get('minPrice')   ?? '';
  const maxPrice   = searchParams.get('maxPrice')   ?? '';
  const inStock    = searchParams.get('inStock')    === 'true';

  const filters: FilterState = { categoryId, minPrice, maxPrice, inStock };

  function updateParams(patch: Record<string, string>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === '' || v === 'false') next.delete(k);
        else next.set(k, v);
      });
      next.set('page', '1');
      return next;
    });
  }

  function handleFilterChange(f: FilterState) {
    updateParams({
      categoryId: f.categoryId,
      minPrice:   f.minPrice,
      maxPrice:   f.maxPrice,
      inStock:    f.inStock ? 'true' : 'false',
    });
  }

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('search')) next.set('search', prev.get('search')!);
      return next;
    });
  }, [setSearchParams]);

  // Scroll to top of product section whenever the page number changes
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  // Data
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const queryKey = ['products', 'list', { page, sortBy, search, categoryId, minPrice, maxPrice, inStock }];
  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchProducts({
        page,
        limit:      LIMIT,
        sortBy,
        search:     search     || undefined,
        categoryId: categoryId || undefined,
        minPrice:   minPrice   ? Number(minPrice) : undefined,
        maxPrice:   maxPrice   ? Number(maxPrice) : undefined,
        inStock:    inStock    || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const products   = data?.data ?? [];
  const pagination = data?.meta.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total      = pagination?.total ?? 0;

  const hasActiveFilters = !!categoryId || !!minPrice || !!maxPrice || inStock || !!search;

  return (
    <div ref={topRef} className="container py-8">

      {/* Top bar — mobile filter trigger + result count + sort */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-cream/80 transition hover:border-saffron/40 hover:text-saffron md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-saffron text-[9px] font-extrabold text-bg">
                !
              </span>
            )}
          </button>

          {/* Result count */}
          <p className="text-sm text-cream/55">
            {isLoading ? (
              <span className="inline-block h-4 w-28 animate-pulse rounded-full bg-surface-2" />
            ) : (
              <>
                <strong className="text-cream">{total}</strong> products found
              </>
            )}
          </p>
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => updateParams({ sortBy: e.target.value })}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-cream/80 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
          categories={categories}
          mobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
        />

        {/* Product grid */}
        <div className="relative min-w-0 flex-1">
          {/* Fetching overlay — shown on page change (old data still visible) */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-bg/50 backdrop-blur-[2px]">
              <AyraSpinner />
            </div>
          )}
          <div
            className={cn(
              'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 transition-opacity duration-200',
              isFetching && !isLoading && 'opacity-50',
            )}
          >
            {isLoading
              ? Array.from({ length: LIMIT }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
          </div>

          {/* Empty state */}
          {!isLoading && products.length === 0 && (
            <EmptyState onClear={clearFilters} />
          )}

          {/* Pagination */}
          {!isLoading && products.length > 0 && (
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                disabled={isFetching}
                onChange={(p) =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('page', String(p));
                    return next;
                  })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
