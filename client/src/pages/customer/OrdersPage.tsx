import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { AyraSpinner } from '@/components/ui/AyraLoader';
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
  PENDING:          'bg-coral/15 text-coral',
  CONFIRMED:        'bg-saffron/15 text-saffron',
  PROCESSING:       'bg-plum/15 text-plum',
  SHIPPED:          'bg-blush/15 text-blush',
  OUT_FOR_DELIVERY: 'bg-blush/20 text-blush',
  DELIVERED:        'bg-sage/15 text-sage',
  CANCELLED:        'bg-rose-500/15 text-rose-400',
  REFUND_REQUESTED: 'bg-coral/10 text-coral',
  REFUNDED:         'bg-line/30 text-cream/55',
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [page, setPage] = useState(1);

  const params = filter === 'ALL' ? { page } : { page, status: filter };
  const { data, isLoading, isFetching } = useMyOrders(params);

  const orders     = data?.data ?? [];
  const pagination = data?.meta.pagination;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex items-center gap-3">
        <Package className="h-6 w-6 text-saffron" />
        <h1 className="font-display text-2xl font-black text-cream sm:text-3xl">My Orders</h1>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
              filter === f.value
                ? 'border-saffron bg-saffron text-bg shadow-[0_0_12px_-2px_hsl(var(--saffron)/0.5)]'
                : 'border-line/50 bg-surface/60 text-cream/55 hover:border-saffron/40 hover:text-cream',
            )}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <div className="relative mt-6 space-y-3">
        {/* Fetching overlay — shown on page/filter change */}
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-bg/50 backdrop-blur-[2px]">
            <AyraSpinner />
          </div>
        )}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface/60" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-10 text-center">
            <p className="text-cream/55">No orders to show yet.</p>
            <Link
              to="/products"
              className="btn-grad btn-wm-arrow mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center gap-4 rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-4 transition-all hover:border-saffron/40 hover:shadow-[0_0_24px_-8px_hsl(var(--saffron)/0.25)]"
            >
              <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line/50 bg-bg sm:block">
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
                  <span className="font-mono text-sm font-semibold text-cream">{order.orderNumber}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', STATUS_TONE[order.status])}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-cream/55">
                  {order.items.length} item{order.items.length === 1 ? '' : 's'} • {format(new Date(order.createdAt), 'dd MMM yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-cream">{formatPaisa(order.totalInPaisa)}</p>
                <p className="text-xs text-cream/55">{order.paymentMethod}</p>
              </div>
              <ChevronRight className="hidden h-4 w-4 shrink-0 text-cream/40 sm:block" />
            </Link>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={!pagination.hasPrevPage || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-outline-grad rounded-full border border-line/50 px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex items-center gap-2 text-sm text-cream/55">
            {isFetching && <span className="h-3 w-3 animate-spin rounded-full border-2 border-saffron border-t-transparent" />}
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!pagination.hasNextPage || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="btn-outline-grad rounded-full border border-line/50 px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
