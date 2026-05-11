import { Link } from 'react-router-dom';
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { useMyOrders } from '@/hooks/useMyOrders';
import { formatPaisa, cn } from '@/lib/utils';
import type { ApiOrderStatus } from '@/types/api';
import { OrderStatus } from '@superstore/shared';
import { useState } from 'react';

type FilterValue = OrderStatus | 'ALL' | 'PROGRESS';

const STATUS_LABEL: Record<ApiOrderStatus, string> = {
  PENDING:           'Pending',
  CONFIRMED:         'Confirmed',
  PROCESSING:        'Processing',
  SHIPPED:           'Shipped',
  OUT_FOR_DELIVERY:  'Out for delivery',
  DELIVERED:         'Delivered',
  CANCELLED:         'Cancelled',
  REFUND_REQUESTED:  'Refund requested',
  REFUNDED:          'Refunded',
};

const STATUS_TONE: Record<ApiOrderStatus, string> = {
  PENDING:           'bg-cream/10 text-cream/80',
  CONFIRMED:         'bg-saffron/15 text-saffron',
  PROCESSING:        'bg-saffron/15 text-saffron',
  SHIPPED:           'bg-saffron/15 text-saffron',
  OUT_FOR_DELIVERY:  'bg-saffron/15 text-saffron',
  DELIVERED:         'bg-emerald-500/15 text-emerald-400',
  CANCELLED:         'bg-coral/15 text-coral',
  REFUND_REQUESTED:  'bg-coral/10 text-coral',
  REFUNDED:          'bg-coral/15 text-coral',
};

const FILTERS: Array<{ value: FilterValue; label: string }> = [
  { value: 'ALL',                 label: 'All' },
  { value: OrderStatus.PENDING,   label: 'Pending' },
  { value: 'PROGRESS',            label: 'In progress' },
  { value: OrderStatus.DELIVERED, label: 'Delivered' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled' },
];

const PROGRESS_STATUSES: ApiOrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'];

export default function OrdersPage() {
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [page,   setPage]   = useState(1);

  // The server takes a single status. The "PROGRESS" pseudo-filter falls back
  // to client-side filtering across the page's result.
  const { data, isLoading, isFetching } = useMyOrders({
    page,
    limit: 10,
    ...(filter !== 'ALL' && filter !== 'PROGRESS' && { status: filter }),
  });

  const orders = data?.data ?? [];
  const visibleOrders =
    filter === 'PROGRESS'
      ? orders.filter((o) => PROGRESS_STATUSES.includes(o.status))
      : orders;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-cream">My orders</h1>
          <p className="mt-1 text-sm text-cream/65">
            Track your purchases and get help if anything's off.
          </p>
        </div>
        {isFetching && (
          <span className="inline-flex items-center gap-1.5 text-xs text-cream/55">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing
          </span>
        )}
      </header>

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
              className={cn(
                'rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
                active
                  ? 'border-saffron bg-saffron text-bg'
                  : 'border-line text-cream/65 hover:border-saffron/40 hover:text-cream',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-surface py-20">
          <Loader2 className="h-5 w-5 animate-spin text-cream/55" />
        </div>
      ) : visibleOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {visibleOrders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-saffron/40 sm:flex-row sm:items-center"
              >
                {/* Left: number + date + items */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cream/55">
                    <Package className="h-3.5 w-3.5" />
                    <span className="font-mono font-semibold text-saffron">
                      {order.orderNumber}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day:   '2-digit',
                        month: 'short',
                        year:  'numeric',
                      })}
                    </span>
                  </div>
                  <div className="truncate text-sm text-cream/85">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    {order.items[0]
                      ? ` · ${order.items[0].productName}${
                          order.items.length > 1
                            ? ` & ${order.items.length - 1} more`
                            : ''
                        }`
                      : ''}
                  </div>
                </div>

                {/* Right: status + total + chevron */}
                <div className="flex items-center justify-between gap-3 sm:gap-5">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]',
                      STATUS_TONE[order.status],
                    )}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                  <span className="text-base font-bold text-cream">
                    {formatPaisa(order.totalInPaisa)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-cream/40 transition-transform group-hover:translate-x-0.5 group-hover:text-cream" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {data && data.meta.pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={!data.meta.pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-cream/80 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-cream/55">
            Page {data.meta.pagination.page} of {data.meta.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!data.meta.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-cream/80 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <ShoppingBag className="mx-auto h-10 w-10 text-cream/30" />
      <h2 className="mt-4 text-lg font-semibold text-cream">No orders yet</h2>
      <p className="mt-1 text-sm text-cream/55">
        Once you place an order, you'll see it here.
      </p>
      <Link
        to="/products"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-bg transition-colors hover:bg-cream"
      >
        Browse products
      </Link>
    </div>
  );
}
