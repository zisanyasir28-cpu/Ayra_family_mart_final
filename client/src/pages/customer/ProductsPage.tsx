import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { fetchProducts } from '../../services/products';
import { fetchCategories } from '../../services/categories';
import { ProductCard, ProductCardSkeleton } from '../../components/product/ProductCard';
import { FilterSidebar, type FilterState } from '../../components/products/FilterSidebar';
import { cn } from '../../lib/utils';

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc',   label: 'Name: A–Z' },
  { value: 'name_desc',  label: 'Name: Z–A' },
] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const [inputVal, setInputVal] = useState(String(page));

  useEffect(() => {
    setInputVal(String(page));
  }, [page]);

  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  function getPages(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) {
      return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  }

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(inputVal, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) onChange(p);
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      {/* Page numbers */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition',
                p === page
                  ? 'bg-green-600 text-white'
                  : 'border border-border text-foreground hover:bg-muted',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Go to page (desktop) */}
      <form onSubmit={handleGo} className="hidden items-center gap-2 text-sm sm:flex">
        <span className="text-muted-foreground">Go to page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm text-foreground focus:border-green-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg border border-green-600 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
        >
          Go
        </button>
      </form>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <PackageSearch className="h-16 w-16 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">No products found</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Try adjusting your filters or search terms to find what you're looking for.
      </p>
      <button
        onClick={onClear}
        className="mt-6 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 active:scale-95"
      >
        Clear Filters
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const LIMIT = 12;

const EMPTY_FILTERS: FilterState = {
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  // Data
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const queryKey = ['products', 'list', { page, sortBy, search, categoryId, minPrice, maxPrice, inStock }];
  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchProducts({
        page,
        limit: LIMIT,
        sortBy,
        search:     search || undefined,
        categoryId: categoryId || undefined,
        minPrice:   minPrice ? Number(minPrice) : undefined,
        maxPrice:   maxPrice ? Number(maxPrice) : undefined,
        inStock:    inStock || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const products    = data?.data ?? [];
  const pagination  = data?.meta.pagination;
  const totalPages  = pagination?.totalPages ?? 1;
  const total       = pagination?.total ?? 0;

  const hasActiveFilters = !!categoryId || !!minPrice || !!maxPrice || inStock || !!search;

  return (
    <div className="container py-6">
      {/* Mobile filter button + sort bar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>

          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <span>
                <strong className="text-foreground">{total}</strong> products found
              </span>
            )}
          </p>
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => updateParams({ sortBy: e.target.value })}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
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
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 transition-opacity',
              isFetching && !isLoading && 'opacity-60',
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
