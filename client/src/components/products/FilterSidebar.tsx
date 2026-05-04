import { useState, useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { ApiCategory } from '../../types/api';

export interface FilterState {
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  categories: ApiCategory[];
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function PriceRangeInput({
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
        <input
          type="number"
          min={0}
          placeholder="Min"
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-6 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30"
        />
      </div>
      <span className="text-muted-foreground">–</span>
      <div className="relative flex-1">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-6 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30"
        />
      </div>
    </div>
  );
}

function FilterContent({
  filters,
  onChange,
  onClear,
  categories,
  hasActiveFilters,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
  categories: ApiCategory[];
  hasActiveFilters: boolean;
}) {
  const update = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </p>
        <div className="flex flex-col gap-1">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-muted">
            <input
              type="radio"
              name="category"
              checked={filters.categoryId === ''}
              onChange={() => update({ categoryId: '' })}
              className="accent-green-600"
            />
            <span className="flex-1 text-sm text-foreground">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-muted"
            >
              <input
                type="radio"
                name="category"
                checked={filters.categoryId === cat.id}
                onChange={() => update({ categoryId: cat.id })}
                className="accent-green-600"
              />
              <span className="flex-1 text-sm text-foreground">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat._count.products}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range (BDT)
        </p>
        <PriceRangeInput
          min={filters.minPrice}
          max={filters.maxPrice}
          onMinChange={(v) => update({ minPrice: v })}
          onMaxChange={(v) => update({ maxPrice: v })}
        />
        {/* Quick presets */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { label: 'Under ৳100', min: '', max: '100' },
            { label: '৳100–500', min: '100', max: '500' },
            { label: '৳500–1000', min: '500', max: '1000' },
            { label: 'Over ৳1000', min: '1000', max: '' },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => update({ minPrice: p.min, maxPrice: p.max })}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium transition',
                filters.minPrice === p.min && filters.maxPrice === p.max
                  ? 'bg-green-100 text-green-700'
                  : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock toggle */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Availability
        </p>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
          <span className="text-sm text-foreground">In Stock Only</span>
          <div
            onClick={() => update({ inStock: !filters.inStock })}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              filters.inStock ? 'bg-green-600' : 'bg-muted-foreground/30',
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                filters.inStock ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </div>
        </label>
      </div>
    </div>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  onClear,
  categories,
  mobileOpen,
  onMobileClose,
}: FilterSidebarProps) {
  const hasActiveFilters =
    !!filters.categoryId ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    filters.inStock;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-[130px] rounded-2xl border border-border bg-card p-5">
          <FilterContent
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            categories={categories}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </aside>

      {/* Mobile bottom drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card p-6 shadow-xl md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Filter Products</span>
                <button
                  onClick={onMobileClose}
                  className="rounded-lg p-1.5 transition hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterContent
                filters={filters}
                onChange={onChange}
                onClear={onClear}
                categories={categories}
                hasActiveFilters={hasActiveFilters}
              />
              <button
                onClick={onMobileClose}
                className="mt-6 w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
