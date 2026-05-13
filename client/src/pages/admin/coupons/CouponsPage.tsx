import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus, Search, Copy, Trash2, RefreshCcw, AlertTriangle, Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatPaisa } from '@/lib/utils';
import {
  fetchAdminCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
  generateCouponCode,
} from '@/services/adminCoupons';
import type { ApiCoupon, ApiCouponStatus } from '@/types/api';
import { createCouponSchema, DiscountType } from '@superstore/shared';
import type { CreateCouponInput } from '@superstore/shared';
import type { Resolver } from 'react-hook-form';

// ─── Tiny UI primitives ───────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary', className)} />
  );
}

function StatusBadge({ status }: { status: ApiCouponStatus }) {
  const map: Record<ApiCouponStatus, string> = {
    active:    'bg-green-100 text-green-700',
    inactive:  'bg-gray-100 text-gray-600',
    upcoming:  'bg-blue-100 text-blue-700',
    expired:   'bg-red-100 text-red-700',
    exhausted: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', map[status])}>
      {status}
    </span>
  );
}

function TypeBadge({ type, value }: { type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-saffron/10 px-2 py-0.5 text-xs font-semibold text-saffron">
      {type === 'PERCENTAGE' ? `${value}% off` : `${formatPaisa(value)} off`}
    </span>
  );
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (c: boolean) => void; disabled?: boolean }) {
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
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200', checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  );
}

function UsageBar({ used, limit }: { used: number; limit: number | null }) {
  if (limit == null) {
    return <span className="text-xs text-muted-foreground">Unlimited · {used} used</span>;
  }
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full transition-all',
            pct >= 100 ? 'bg-coral' : pct >= 75 ? 'bg-yellow-500' : 'bg-primary',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground">{used} / {limit} · {pct}%</div>
    </div>
  );
}

// ─── Debounce helper ─────────────────────────────────────────────────────────

function useDebounced<T>(value: T, ms = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

// ─── Main page ────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'expired' | 'upcoming' | 'exhausted';

export default function CouponsPage() {
  const qc = useQueryClient();
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreate,  setShowCreate]  = useState(false);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const debouncedSearch = useDebounced(search, 400);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'coupons', { page, debouncedSearch, statusFilter }],
    queryFn:  () => fetchAdminCoupons({
      page, limit: 20,
      search: debouncedSearch || undefined,
      status: statusFilter,
    }),
    placeholderData: (prev) => prev,
  });

  const toggleMut = useMutation({
    mutationFn: toggleCoupon,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
    onError:    () => { /* demo toast already fired in service */ },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCoupon,
    onSuccess:  () => {
      toast.success('Coupon deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError:    () => { /* demo toast already fired */ },
  });

  const coupons = data?.data ?? [];

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(
      () => toast.success(`Copied "${code}"`),
      () => toast.error('Could not copy'),
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Create coupon
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by code (e.g. WELCOME10)"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="expired">Expired</option>
          <option value="exhausted">Exhausted</option>
        </select>
        <button
          type="button"
          onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <RefreshCcw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min order</th>
                <th className="px-4 py-3 font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <Ticket className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No coupons match these filters.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">{c.code}</code>
                        <button
                          type="button"
                          onClick={() => copyCode(c.code)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Copy ${c.code}`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {c.description && (
                        <div className="mt-1 max-w-xs truncate text-xs text-muted-foreground">{c.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={c.discountType} value={c.discountValue} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.minOrderAmountInPaisa != null ? formatPaisa(c.minOrderAmountInPaisa) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <UsageBar used={c.usageCount} limit={c.usageLimit} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        checked={c.isActive}
                        onChange={() => toggleMut.mutate(c.id)}
                        disabled={toggleMut.isPending}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteId(c.id)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600"
                        aria-label="Delete coupon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateCouponModal onClose={() => setShowCreate(false)} onCreated={() => {
          setShowCreate(false);
          qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
        }} />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <DeleteConfirmModal
          coupon={coupons.find((c) => c.id === deleteId)}
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            deleteMut.mutate(deleteId, {
              onSettled: () => setDeleteId(null),
            });
          }}
          pending={deleteMut.isPending}
        />
      )}
    </div>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose:   () => void;
  onCreated: () => void;
}

function CreateCouponModal({ onClose, onCreated }: CreateModalProps) {
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CreateCouponInput>({
    // zodResolver typing on schemas with .superRefine() narrows imprecisely; cast
    // the resolver to satisfy the parameterised useForm without changing runtime
    // behavior.
    resolver: zodResolver(createCouponSchema) as unknown as Resolver<CreateCouponInput>,
    defaultValues: {
      code:          '',
      description:   '',
      discountType:  DiscountType.PERCENTAGE,
      discountValue: 10,
      startsAt:      tomorrow,
      isActive:      true,
    },
  });

  const createMut = useMutation({
    mutationFn: (values: CreateCouponInput) => createCoupon(values),
    onSuccess:  () => {
      toast.success('Coupon created');
      onCreated();
    },
    onError: () => { /* demo toast already fired */ },
  });

  const codeValue = watch('code');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 font-display text-lg font-bold">Create coupon</h2>
        <p className="mb-5 text-xs text-muted-foreground">Discount codes customers can apply at checkout.</p>

        <form onSubmit={handleSubmit((v) => createMut.mutate(v))} className="space-y-4" noValidate>
          {/* Code with Generate */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Code</label>
            <div className="flex gap-2">
              <input
                {...register('code')}
                placeholder="WELCOME10 or leave blank to auto-generate"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm uppercase placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setValue('code', generateCouponCode(), { shouldValidate: true })}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted"
              >
                Generate
              </button>
            </div>
            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
            {!codeValue && <p className="mt-1 text-xs text-muted-foreground">Leave blank to auto-generate an 8-char code.</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</label>
            <input
              {...register('description')}
              placeholder="Optional"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</label>
              <select
                {...register('discountType')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed amount (paisa)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Value</label>
              <input
                type="number"
                {...register('discountValue', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              {errors.discountValue && <p className="mt-1 text-xs text-red-600">{errors.discountValue.message}</p>}
            </div>
          </div>

          {/* Min order + Usage limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Min order (paisa)</label>
              <input
                type="number"
                {...register('minOrderAmountInPaisa', { valueAsNumber: true })}
                placeholder="Optional"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Usage limit</label>
              <input
                type="number"
                {...register('usageLimit', { valueAsNumber: true })}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Starts at</label>
              <Controller
                control={control}
                name="startsAt"
                render={({ field }) => (
                  <input
                    type="datetime-local"
                    value={field.value ? toDatetimeLocal(field.value) : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                )}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Expires at</label>
              <Controller
                control={control}
                name="expiresAt"
                render={({ field }) => (
                  <input
                    type="datetime-local"
                    value={field.value ? toDatetimeLocal(field.value as Date) : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                )}
              />
              {errors.expiresAt && <p className="mt-1 text-xs text-red-600">{errors.expiresAt.message}</p>}
            </div>
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-border accent-primary" />
            Active immediately
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {(isSubmitting || createMut.isPending) && <Spinner className="!border-primary-foreground/30 !border-t-primary-foreground" />}
              Create coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toDatetimeLocal(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const pad  = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  coupon?:  ApiCoupon;
  onClose:  () => void;
  onConfirm: () => void;
  pending:  boolean;
}

function DeleteConfirmModal({ coupon, onClose, onConfirm, pending }: DeleteConfirmProps) {
  const hasUsage = (coupon?.usageCount ?? 0) > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="font-display text-lg font-bold">Delete coupon?</h2>
        </div>
        <p className="mb-1 text-sm text-muted-foreground">
          You're about to delete <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{coupon?.code}</code>.
        </p>
        {hasUsage && (
          <p className="mb-1 text-sm text-amber-700">
            This coupon has already been used {coupon?.usageCount} times. The server will reject deletion — deactivate it instead.
          </p>
        )}
        <p className="mb-5 text-sm text-muted-foreground">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending && <Spinner className="!border-white/30 !border-t-white" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
