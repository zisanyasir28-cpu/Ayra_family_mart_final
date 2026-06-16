import { useState, useCallback } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { ApiCategory, ApiBrand } from '../../types/api';

export interface FilterState {
  categoryId: string;
  brandId: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  categories: ApiCategory[];
  brands: ApiBrand[];
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── Price range inputs ───────────────────────────────────────────────────────

function PriceRangeInput({
  min, max, onMinChange, onMaxChange,
}: {
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cream/45">৳</span>
        <input
          type="number"
          min={0}
          placeholder="Min"
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg py-2 pl-7 pr-2 text-sm text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25"
        />
      </div>
      <span className="text-cream/35">–</span>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cream/45">৳</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg py-2 pl-7 pr-2 text-sm text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25"
        />
      </div>
    </div>
  );
}

// ─── Filter content (shared between desktop + mobile) ─────────────────────────

function FilterContent({
  filters, onChange, onClear, categories, brands, hasActiveFilters,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
  categories: ApiCategory[];
  brands: ApiBrand[];
  hasActiveFilters: boolean;
}) {
  const [catExpanded, setCatExpanded] = useState(true);
  // Brand list is long (one entry per brand), so default it collapsed — but
  // open it automatically when a brand is already selected.
  const [brandExpanded, setBrandExpanded] = useState(!!filters.brandId);

  const update = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-cream">
          <SlidersHorizontal className="h-4 w-4 text-saffron" strokeWidth={1.8} />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-saffron text-[9px] font-extrabold text-bg">
              ✓
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-coral transition hover:bg-coral/10"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="rounded-xl border border-line/50 bg-bg/40 overflow-hidden">
        <button
          onClick={() => setCatExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-cream/60">
            Category
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-cream/40 transition-transform duration-200',
              catExpanded && 'rotate-180',
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {catExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-0.5 px-2 pb-3">
                {/* All categories option */}
                <label className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition',
                  filters.categoryId === '' ? 'bg-saffron/15' : 'hover:bg-surface-2/60',
                )}>
                  <input
                    type="radio"
                    name="category"
                    checked={filters.categoryId === ''}
                    onChange={() => update({ categoryId: '' })}
                    className="accent-saffron"
                  />
                  <span className={cn(
                    'flex-1 text-sm font-medium',
                    filters.categoryId === '' ? 'text-saffron' : 'text-cream/80',
                  )}>
                    All Categories
                  </span>
                </label>

                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition',
                      filters.categoryId === cat.id ? 'bg-saffron/15' : 'hover:bg-surface-2/60',
                    )}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={filters.categoryId === cat.id}
                      onChange={() => update({ categoryId: cat.id })}
                      className="accent-saffron"
                    />
                    <span className={cn(
                      'flex-1 text-sm',
                      filters.categoryId === cat.id ? 'font-semibold text-saffron' : 'text-cream/75',
                    )}>
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-cream/35">{cat._count.products}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="rounded-xl border border-line/50 bg-bg/40 overflow-hidden">
          <button
            onClick={() => setBrandExpanded((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-cream/60">
              Brand
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-cream/40 transition-transform duration-200',
                brandExpanded && 'rotate-180',
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {brandExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto px-2 pb-3">
                  {/* All brands option */}
                  <label className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition',
                    filters.brandId === '' ? 'bg-saffron/15' : 'hover:bg-surface-2/60',
                  )}>
                    <input
                      type="radio"
                      name="brand"
                      checked={filters.brandId === ''}
                      onChange={() => update({ brandId: '' })}
                      className="accent-saffron"
                    />
                    <span className={cn(
                      'flex-1 text-sm font-medium',
                      filters.brandId === '' ? 'text-saffron' : 'text-cream/80',
                    )}>
                      All Brands
                    </span>
                  </label>

                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition',
                        filters.brandId === brand.id ? 'bg-saffron/15' : 'hover:bg-surface-2/60',
                      )}
                    >
                      <input
                        type="radio"
                        name="brand"
                        checked={filters.brandId === brand.id}
                        onChange={() => update({ brandId: brand.id })}
                        className="accent-saffron"
                      />
                      <span className={cn(
                        'flex-1 text-sm',
                        filters.brandId === brand.id ? 'font-semibold text-saffron' : 'text-cream/75',
                      )}>
                        {brand.name}
                      </span>
                      <span className="text-[11px] text-cream/35">{brand.productCount}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream/60">
          Price Range (BDT)
        </p>
        <PriceRangeInput
          min={filters.minPrice}
          max={filters.maxPrice}
          onMinChange={(v) => update({ minPrice: v })}
          onMaxChange={(v) => update({ maxPrice: v })}
        />
        {/* Quick presets */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[
            { label: 'Under ৳100',  min: '',    max: '100'  },
            { label: '৳100–500',    min: '100', max: '500'  },
            { label: '৳500–1000',   min: '500', max: '1000' },
            { label: 'Over ৳1000',  min: '1000', max: ''    },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => update({ minPrice: p.min, maxPrice: p.max })}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold transition',
                filters.minPrice === p.min && filters.maxPrice === p.max
                  ? 'bg-saffron/20 text-saffron ring-1 ring-saffron/30'
                  : 'bg-surface-2/60 text-cream/60 hover:bg-saffron/10 hover:text-saffron',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* In-stock toggle */}
      <div>
        <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream/60">
          Availability
        </p>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line/50 bg-bg/40 px-4 py-3">
          <span className="text-sm text-cream/80">In Stock Only</span>
          {/* Custom toggle */}
          <div
            onClick={() => update({ inStock: !filters.inStock })}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors duration-200',
              filters.inStock ? 'bg-saffron shadow-[0_0_10px_-2px_hsl(var(--saffron)/0.6)]' : 'bg-line',
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-bg shadow transition-transform duration-200',
                filters.inStock ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </div>
        </label>
      </div>

    </div>
  );
}

// ─── FilterSidebar (exported) ─────────────────────────────────────────────────

export function FilterSidebar({
  filters, onChange, onClear, categories, brands, mobileOpen, onMobileClose,
}: FilterSidebarProps) {
  const hasActiveFilters =
    !!filters.categoryId || !!filters.brandId || !!filters.minPrice || !!filters.maxPrice || filters.inStock;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">
        <div className="sticky top-[8.5rem] rounded-2xl border border-line/50 bg-surface/60 p-5 backdrop-blur-xl">
          <FilterContent
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            categories={categories}
            brands={brands}
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
              className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-md md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-line/50 bg-surface p-6 shadow-[-0_-24px_48px_-16px_hsl(var(--saffron)/0.15)] md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-base font-bold text-cream">Filter Products</span>
                <button
                  onClick={onMobileClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-cream/60 transition hover:bg-surface-2 hover:text-cream"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <FilterContent
                filters={filters}
                onChange={onChange}
                onClear={onClear}
                categories={categories}
                brands={brands}
                hasActiveFilters={hasActiveFilters}
              />

              <button
                onClick={onMobileClose}
                className="mt-6 w-full rounded-full bg-saffron py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-bg transition hover:bg-saffron/90 hover:shadow-[0_0_24px_-4px_hsl(var(--saffron)/0.6)]"
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
