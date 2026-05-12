import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useMyOrders } from '@/hooks/useMyOrders';
import { formatPaisa, cn } from '@/lib/utils';
import { OrderStatus } from '@superstore/shared';
import type { ApiOrderStatus } from '@/types/api';

type FilterValue = OrderStatus | 'ALL';

const FILTERS: Array<{ label: string; value: FilterValue }> = [
  { label: 'All',        value: 'ALL' },
  { label: 'Pending',    value: OrderStatus.PENDING },
  { label: 'Processing', value: OrderStatus.PROCESSING },
  { label: 'Shipped',    value: OrderStatus.SHIPPED },
  { label: 'Delivered',  value: OrderStatus.DELIVERED },
  { label: 'Cancelled',  value: OrderStatus.CANCELLED },
];

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

export default function OrdersPage() {
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [page, setPage] = useState(1);

  const params = filter === 'ALL' ? { page } : { page, status: filter };
  const { data, isLoading } = useMyOrders(params);

  const orders     = data?.data ?? [];
  const pagination = data?.meta.pagination;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex items-center gap-3">
        <Package className="h-6 w-6 text-saffron" />
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Orders</h1>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'border-saffron bg-saffron text-bg'
                : 'border-line bg-surface text-muted-foreground hover:border-saffron/40 hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-muted-foreground">No orders to show yet.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-saffron px-5 py-2 text-sm font-semibold text-bg"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-saffron/40"
            >
              <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-bg sm:block">
                {order.items[0]?.product?.images[0]?.url && (
                  <img
                    src={order.items[0].product.images[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{order.orderNumber}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', STATUS_TONE[order.status])}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.items.length} item{order.items.length === 1 ? '' : 's'} • {format(new Date(order.createdAt), 'dd MMM yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatPaisa(order.totalInPaisa)}</p>
                <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
              </div>
              <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            </Link>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
