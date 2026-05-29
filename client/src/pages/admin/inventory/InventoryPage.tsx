import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Search, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatPaisa } from '@/lib/utils';
import { fetchProducts, patchProductStock } from '@/services/products';
import { fetchCategories } from '@/services/categories';
import type { ApiProduct } from '@/types/api';

// ─── Stock level pill ─────────────────────────────────────────────────────────

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-500">
        Out of stock
      </span>
    );
  }
  if (qty <= threshold) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
        Low stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
      In stock
    </span>
  );
}

// ─── Inline stock editor ──────────────────────────────────────────────────────

function StockEditor({ product }: { product: ApiProduct }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(product.stockQuantity));

  const { mutate, isPending } = useMutation({
    mutationFn: (qty: number) => patchProductStock(product.id, qty),
    onSuccess: () => {
      toast.success('Stock updated');
      qc.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      setEditing(false);
    },
    onError: () => toast.error('Failed to update stock'),
  });

  function handleSave() {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) { toast.error('Enter a valid number'); return; }
    mutate(n);
  }

  const qty = product.stockQuantity;
  const isLow = qty <= product.lowStockThreshold && qty > 0;
  const isOut = qty === 0;

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => { setVal(String(qty)); setEditing(true); }}
        className={cn(
          'tabular-nums text-sm font-semibold transition hover:underline',
          isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-emerald-500',
        )}
      >
        {qty}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        type="number"
        min="0"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-20 rounded border border-border bg-muted px-2 py-0.5 text-sm focus:border-primary focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground transition hover:bg-muted"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Filter type ─────────────────────────────────────────────────────────────

type StockFilter = 'all' | 'in_stock' | 'low' | 'out';

const FILTER_TABS: { label: string; value: StockFilter }[] = [
  { label: 'All',         value: 'all'      },
  { label: 'In Stock',    value: 'in_stock' },
  { label: 'Low Stock',   value: 'low'      },
  { label: 'Out of Stock',value: 'out'      },
];

// ─── useDebounce ──────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, ms = 400): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

// ─── InventoryPage ────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, categoryId, stockFilter]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  // Map stock filter to status params — fetch all statuses but filter client-side
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'inventory', { page, debouncedSearch, categoryId }],
    queryFn: () => fetchProducts({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      // fetch ACTIVE + OUT_OF_STOCK products
    }),
    placeholderData: (prev) => prev,
  });

  const allProducts = data?.data ?? [];
  const pagination  = data?.meta.pagination;

  // Client-side stock filter
  const products = stockFilter === 'all'
    ? allProducts
    : stockFilter === 'out'
    ? allProducts.filter((p) => p.stockQuantity === 0)
    : stockFilter === 'low'
    ? allProducts.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold)
    : allProducts.filter((p) => p.stockQuantity > p.lowStockThreshold);

  // Counts for filter badges
  const counts = {
    all:      allProducts.length,
    out:      allProducts.filter((p) => p.stockQuantity === 0).length,
    low:      allProducts.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length,
    in_stock: allProducts.filter((p) => p.stockQuantity > p.lowStockThreshold).length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Stock levels for all products. Click a stock number to edit it inline.
          </p>
        </div>
        {isFetching && !isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStockFilter(tab.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              stockFilter === tab.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {tab.label}
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              stockFilter === tab.value
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}>
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {/* Category filter */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />
          ))
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-10 text-center text-sm text-muted-foreground">
            No products found.
          </div>
        ) : (
          products.map((p: ApiProduct) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {p.images[0] ? (
                    <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Package className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sku}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StockBadge qty={p.stockQuantity} threshold={p.lowStockThreshold} />
                    <span className="text-xs text-muted-foreground">threshold: {p.lowStockThreshold}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <StockEditor product={p} />
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatPaisa(p.effectivePriceInPaisa)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 text-center font-medium">Stock</th>
              <th className="px-4 py-3 text-center font-medium">Threshold</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No products match this filter.
                </td>
              </tr>
            ) : (
              products.map((p: ApiProduct) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {p.images[0] ? (
                          <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <p className="max-w-[200px] truncate font-medium text-foreground">{p.name}</p>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {p.category?.name ?? '—'}
                    </span>
                  </td>
                  {/* SKU */}
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  {/* Stock — inline editable */}
                  <td className="px-4 py-3 text-center">
                    <StockEditor product={p} />
                  </td>
                  {/* Threshold */}
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {p.lowStockThreshold}
                  </td>
                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <StockBadge qty={p.stockQuantity} threshold={p.lowStockThreshold} />
                  </td>
                  {/* Price */}
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatPaisa(p.effectivePriceInPaisa)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
