import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Search, X, ChevronLeft, ChevronRight, ShieldOff, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAdminCustomers,
  useAdminCustomerById,
  useBanCustomer,
  useUnbanCustomer,
} from '@/hooks/useAdminCustomers';
import { formatPaisa, cn } from '@/lib/utils';
import type { ApiCustomer, ApiOrderStatus } from '@/types/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const STATUS_TONE: Record<ApiOrderStatus, string> = {
  PENDING:          'bg-amber-500/15 text-amber-500',
  CONFIRMED:        'bg-sky-500/15 text-sky-500',
  PROCESSING:       'bg-indigo-500/15 text-indigo-500',
  SHIPPED:          'bg-violet-500/15 text-violet-500',
  OUT_FOR_DELIVERY: 'bg-blue-500/15 text-blue-500',
  DELIVERED:        'bg-emerald-500/15 text-emerald-500',
  CANCELLED:        'bg-rose-500/15 text-rose-500',
  REFUND_REQUESTED: 'bg-orange-500/15 text-orange-500',
  REFUNDED:         'bg-zinc-500/15 text-zinc-500',
};

// ─── Customer Drawer ──────────────────────────────────────────────────────────

function CustomerDrawer({
  customerId,
  onClose,
}: {
  customerId: string;
  onClose: () => void;
}) {
  const { data: customer, isLoading } = useAdminCustomerById(customerId);
  const banMutation   = useBanCustomer();
  const unbanMutation = useUnbanCustomer();
  const [confirming, setConfirming] = useState(false);

  async function handleToggle() {
    if (!customer) return;
    if (!confirming) { setConfirming(true); return; }
    setConfirming(false);
    try {
      if (customer.isActive) {
        await banMutation.mutateAsync(customer.id);
        toast.success(`${customer.name} has been banned.`);
      } else {
        await unbanMutation.mutateAsync(customer.id);
        toast.success(`${customer.name} has been unbanned.`);
      }
    } catch {
      toast.error('Action failed.');
    }
  }

  const isBusy = banMutation.isPending || unbanMutation.isPending;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.aside
        key="customer-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Customer Detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading || !customer ? (
            <div className="space-y-4 p-5">
              <div className="h-16 animate-pulse rounded-xl bg-muted" />
              <div className="h-32 animate-pulse rounded-xl bg-muted" />
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
            </div>
          ) : (
            <>
              {/* Profile */}
              <div className="flex items-center gap-4 border-b border-border px-5 py-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {initials(customer.name)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Joined {format(new Date(customer.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 border-b border-border px-5 py-4">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {customer._count.orders}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {formatPaisa(customer.totalSpentInPaisa)}
                  </p>
                </div>
              </div>

              {/* Order history */}
              <div className="px-5 py-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent Orders
                </h3>
                {customer.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {customer.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                      >
                        <div>
                          <p className="font-mono text-xs font-semibold text-foreground">
                            {order.orderNumber}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(order.createdAt), 'dd MMM yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            STATUS_TONE[order.status],
                          )}>
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {formatPaisa(order.totalInPaisa)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer footer — ban/unban */}
        {customer && (
          <div className="border-t border-border px-5 py-4">
            <AnimatePresence mode="wait">
              {confirming ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {customer.isActive ? 'Ban this customer?' : 'Unban this customer?'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {customer.isActive
                      ? 'The customer will not be able to log in or place orders.'
                      : 'The customer will regain access to the store.'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleToggle}
                      disabled={isBusy}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60',
                        customer.isActive ? 'bg-rose-500' : 'bg-emerald-500',
                      )}
                    >
                      {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {customer.isActive ? 'Confirm Ban' : 'Confirm Unban'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="toggle-btn"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  type="button"
                  onClick={handleToggle}
                  disabled={isBusy}
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50',
                    customer.isActive
                      ? 'border border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10'
                      : 'border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10',
                  )}
                >
                  {customer.isActive
                    ? <><ShieldOff className="h-4 w-4" /> Ban Customer</>
                    : <><ShieldCheck className="h-4 w-4" /> Unban Customer</>
                  }
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.aside>
    </>
  );
}

// ─── CustomersPage ─────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Debounce search 300ms
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [search]);

  const { data, isLoading } = useAdminCustomers({
    page,
    limit:  20,
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const customers  = data?.data ?? [];
  const pagination = data?.meta.pagination;

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {pagination ? `${pagination.total.toLocaleString()} total` : ''}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 text-center font-medium">Orders</th>
                <th className="px-4 py-3 text-right font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c: ApiCustomer) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                  >
                    {/* Avatar + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(c.name)}
                        </div>
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-center text-foreground">{c._count.orders}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatPaisa(c.totalSpentInPaisa)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(c.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        c.isActive
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-rose-500/15 text-rose-500',
                      )}>
                        {c.isActive ? 'Active' : 'Banned'}
                      </span>
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

      {/* Customer drawer */}
      <AnimatePresence>
        {selectedId && (
          <CustomerDrawer
            customerId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
