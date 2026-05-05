import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Copy, ChevronLeft, ChevronRight, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatPaisa } from '@/lib/utils';
import {
  fetchProducts,
  deleteAdminProduct,
  patchProductStatus,
  bulkPriceUpdate,
} from '@/services/products';
import { fetchCategories } from '@/services/categories';
import type { ApiProduct } from '@/types/api';
import { ProductFormSheet } from '@/components/admin/products/ProductFormSheet';

// ─── Tiny UI primitives ───────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary',
        className,
      )}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE:       'bg-green-100 text-green-700',
    INACTIVE:     'bg-gray-100 text-gray-600',
    OUT_OF_STOCK: 'bg-yellow-100 text-yellow-700',
    DISCONTINUED: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        map[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  );
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

interface ActionsDropdownProps {
  product: ApiProduct;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function ActionsDropdown({ product, onEdit, onDuplicate, onDelete }: ActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => { onDuplicate(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition hover:bg-muted"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </button>
          <div className="my-1 border-t border-border" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Bulk price modal ─────────────────────────────────────────────────────────

interface BulkPriceModalProps {
  selectedIds: string[];
  onClose: () => void;
}

function BulkPriceModal({ selectedIds, onClose }: BulkPriceModalProps) {
  const queryClient = useQueryClient();
  const [changeType, setChangeType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      bulkPriceUpdate({
        type: 'by_ids',
        ids: selectedIds,
        changeType,
        changeValue: parseFloat(value) || 0,
      }),
    onSuccess: (data) => {
      toast.success(`Updated ${data.affectedCount} product(s)`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      onClose();
    },
    onError: () => toast.error('Bulk price update failed'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Update Price ({selectedIds.length} products)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Change type</label>
            <div className="flex gap-2">
              {(['percentage', 'fixed'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChangeType(t)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition',
                    changeType === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {t === 'percentage' ? 'Percentage (%)' : 'Fixed (৳)'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {changeType === 'percentage' ? 'Percentage change (e.g. 10 or -5)' : 'Fixed change in BDT (e.g. 50 or -20)'}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={changeType === 'percentage' ? '10' : '50'}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending || !value}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Updating…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

interface DeleteConfirmProps {
  product: ApiProduct;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function DeleteConfirmDialog({ product, onConfirm, onCancel, isPending }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Delete product?</h3>
            <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          <strong className="text-foreground">{product.name}</strong> will be marked as inactive.
          Products with active orders cannot be deleted.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── useDebounce ──────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsListPage() {
  const queryClient = useQueryClient();

  // ── Filters & pagination state
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(12);
  const [search, setSearch]       = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const debouncedSearch = useDebounce(search, 400);

  // ── Selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Sheet state
  const [sheetOpen, setSheetOpen]     = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);

  // ── Modals
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);

  // ── Data
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'products', { page, limit, debouncedSearch, categoryId, statusFilter }],
    queryFn: () =>
      fetchProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        status: statusFilter,
      }),
    placeholderData: (prev) => prev,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const products   = data?.data ?? [];
  const pagination = data?.meta.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // ── Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, categoryId, statusFilter]);

  // ── Status toggle mutation (optimistic)
  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      patchProductStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'products'] });
      const prev = queryClient.getQueryData<typeof data>(['admin', 'products']);
      queryClient.setQueryData<typeof data>(
        ['admin', 'products', { page, limit, debouncedSearch, categoryId, statusFilter }],
        (old) =>
          old
            ? {
                ...old,
                data: old.data.map((p) =>
                  p.id === id ? { ...p, status: status as ApiProduct['status'] } : p,
                ),
              }
            : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(
          ['admin', 'products', { page, limit, debouncedSearch, categoryId, statusFilter }],
          ctx.prev,
        );
      }
      toast.error('Failed to update status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  // ── Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => {
      toast.success('Product deleted');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: () => toast.error('Delete failed'),
  });

  // ── Select helpers
  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Duplicate: open form with product data, clear id
  const handleDuplicate = useCallback((product: ApiProduct) => {
    setEditProduct({ ...product, id: '', name: `${product.name} (Copy)`, slug: '' });
    setSheetOpen(true);
  }, []);

  // ── Bulk status change
  function handleBulkStatus(status: string) {
    const ids = Array.from(selected);
    Promise.all(ids.map((id) => patchProductStatus(id, status))).then(() => {
      toast.success(`Updated ${ids.length} product(s)`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-border bg-muted py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add product */}
        <button
          onClick={() => { setEditProduct(null); setSheetOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* ── Bulk actions bar ─────────────────────────────────────────────────── */}
      {someSelected && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium text-primary">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-primary/30" />
          <button
            onClick={() => handleBulkStatus('ACTIVE')}
            className="text-sm font-medium text-primary transition hover:underline"
          >
            Set Active
          </button>
          <button
            onClick={() => handleBulkStatus('INACTIVE')}
            className="text-sm font-medium text-primary transition hover:underline"
          >
            Set Inactive
          </button>
          <button
            onClick={() => setBulkPriceOpen(true)}
            className="text-sm font-medium text-primary transition hover:underline"
          >
            Update Price
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-muted-foreground transition hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border text-primary accent-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Active
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Spinner className="mx-auto h-6 w-6" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLowStock =
                    product.stockQuantity <= product.lowStockThreshold &&
                    product.stockQuantity > 0;
                  const isOutOfStock = product.stockQuantity === 0;
                  const isActive = product.status === 'ACTIVE';

                  return (
                    <tr
                      key={product.id}
                      className={cn(
                        'transition hover:bg-muted/30',
                        selected.has(product.id) && 'bg-primary/5',
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggleOne(product.id)}
                          className="h-4 w-4 rounded border-border text-primary accent-primary"
                        />
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            {product.images[0] ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          {product.category?.name ?? '—'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <div>
                          <span className="font-medium text-foreground">
                            {formatPaisa(product.effectivePriceInPaisa)}
                          </span>
                          {product.comparePriceInPaisa &&
                            product.comparePriceInPaisa > product.priceInPaisa && (
                              <span className="ml-1.5 text-xs text-muted-foreground line-through">
                                {formatPaisa(product.comparePriceInPaisa)}
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            'font-medium tabular-nums',
                            isOutOfStock
                              ? 'text-red-600'
                              : isLowStock
                              ? 'text-yellow-600'
                              : 'text-foreground',
                          )}
                        >
                          {product.stockQuantity}
                        </span>
                        {isLowStock && (
                          <span className="ml-1 text-xs text-yellow-600">(low)</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={product.status} />
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <ToggleSwitch
                          checked={isActive}
                          disabled={toggleMutation.isPending}
                          onChange={(checked) =>
                            toggleMutation.mutate({
                              id: product.id,
                              status: checked ? 'ACTIVE' : 'INACTIVE',
                            })
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <ActionsDropdown
                          product={product}
                          onEdit={() => { setEditProduct(product); setSheetOpen(true); }}
                          onDuplicate={() => handleDuplicate(product)}
                          onDelete={() => setDeleteTarget(product)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        {pagination && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of{' '}
                {pagination.total}
              </span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="rounded border border-border bg-muted px-1 py-0.5 text-xs focus:outline-none"
              >
                {[12, 24, 48].map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
              {isFetching && !isLoading && <Spinner />}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p =
                  totalPages <= 5
                    ? i + 1
                    : page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                    ? totalPages - 4 + i
                    : page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition',
                      page === p
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Product form sheet ───────────────────────────────────────────────── */}
      <ProductFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        product={editProduct ?? undefined}
        categories={categories}
        onSuccess={() => {
          setSheetOpen(false);
          setEditProduct(null);
          queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        }}
      />

      {/* ── Delete confirm ───────────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmDialog
          product={deleteTarget}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Bulk price modal ─────────────────────────────────────────────────── */}
      {bulkPriceOpen && (
        <BulkPriceModal
          selectedIds={Array.from(selected)}
          onClose={() => setBulkPriceOpen(false)}
        />
      )}
    </div>
  );
}
