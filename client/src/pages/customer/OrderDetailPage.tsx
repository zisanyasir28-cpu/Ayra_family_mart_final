import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Check, Truck, CheckCircle2, XCircle, Clock, Box } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useMyOrderById, useCancelMyOrder } from '@/hooks/useMyOrders';
import { formatPaisa, cn } from '@/lib/utils';
import type { ApiOrderStatus } from '@/types/api';

const STATUS_ICON: Record<ApiOrderStatus, React.ComponentType<{ className?: string }>> = {
  PENDING:          Clock,
  CONFIRMED:        Check,
  PROCESSING:       Box,
  SHIPPED:          Truck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED:        CheckCircle2,
  CANCELLED:        XCircle,
  REFUND_REQUESTED: XCircle,
  REFUNDED:         XCircle,
};

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

const CANCELLABLE: ApiOrderStatus[] = ['PENDING', 'CONFIRMED'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useMyOrderById(id);
  const cancelMutation = useCancelMyOrder();

  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState('');

  async function handleCancel() {
    if (!id) return;
    try {
      await cancelMutation.mutateAsync({ id, reason: reason.trim() || undefined });
      toast.success('Order cancelled. Stock has been restored.');
      setShowCancel(false);
      setReason('');
    } catch {
      toast.error('Could not cancel order.');
    }
  }

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-96 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <header className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Order</p>
          <h1 className="font-mono text-xl font-semibold text-foreground">{order.orderNumber}</h1>
        </div>
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', STATUS_TONE[order.status])}>
          {order.status.replace('_', ' ')}
        </span>
      </header>

      {/* Status timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Status timeline</h2>
          <ol className="mt-4 space-y-4">
            {order.statusHistory.map((entry, i) => {
              const Icon = STATUS_ICON[entry.status] ?? Package;
              const isLast = i === order.statusHistory!.length - 1;
              return (
                <li key={entry.id} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', STATUS_TONE[entry.status])}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {!isLast && <span className="mt-1 h-full w-px flex-1 bg-line" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-foreground">{entry.status.replace('_', ' ')}</p>
                    {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Items */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Items</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-bg">
                {item.product?.images[0]?.url && (
                  <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatPaisa(item.unitPriceInPaisa)}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatPaisa(item.totalPriceInPaisa)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Totals</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Subtotal" value={formatPaisa(order.subtotalInPaisa)} />
          {order.discountInPaisa > 0 && (
            <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`-${formatPaisa(order.discountInPaisa)}`} />
          )}
          <Row label="Shipping" value={order.shippingInPaisa === 0 ? 'Free' : formatPaisa(order.shippingInPaisa)} />
          <div className="flex items-center justify-between border-t border-line pt-2 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPaisa(order.totalInPaisa)}</span>
          </div>
          <p className="pt-1 text-xs text-muted-foreground">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
        </dl>
      </section>

      {/* Shipping address */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Shipping to</h2>
        <div className="mt-3 text-sm text-foreground">
          <p>{order.snapFullName}</p>
          <p className="text-muted-foreground">{order.snapPhone}</p>
          <p className="mt-1 text-muted-foreground">
            {order.snapAddressLine1}
            {order.snapAddressLine2 ? `, ${order.snapAddressLine2}` : ''}, {order.snapThana}, {order.snapDistrict}
            {order.snapPostalCode ? ` ${order.snapPostalCode}` : ''}
          </p>
        </div>
      </section>

      {/* Cancel */}
      {canCancel && (
        <section className="mt-6">
          {showCancel ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
              <p className="text-sm font-semibold text-foreground">Cancel this order?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Stock will be restored to inventory and you&apos;ll receive a confirmation email.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={2}
                className="mt-3 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancel(false)}
                  className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground"
                >
                  Keep order
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {cancelMutation.isPending ? 'Cancelling…' : 'Confirm cancellation'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 py-3 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
            >
              Cancel order
            </button>
          )}
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
