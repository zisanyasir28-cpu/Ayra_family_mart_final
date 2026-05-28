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
        <div className="h-96 animate-pulse rounded-2xl bg-surface/60" />
      </div>
    );
  }

  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-cream/55 hover:text-saffron transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <header className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-cream/40">Order</p>
          <h1 className="font-mono text-xl font-semibold text-cream">{order.orderNumber}</h1>
        </div>
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', STATUS_TONE[order.status])}>
          {order.status.replace('_', ' ')}
        </span>
      </header>

      {/* Status timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <section className="mt-6 rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-5">
          <h2 className="text-sm font-semibold text-cream">Status timeline</h2>
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
                    {!isLast && <span className="mt-1 h-full w-px flex-1 bg-line/50" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-cream">{entry.status.replace('_', ' ')}</p>
                    {entry.note && <p className="text-xs text-cream/55">{entry.note}</p>}
                    <p className="mt-0.5 text-xs text-cream/40">
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
      <section className="mt-6 rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-5">
        <h2 className="text-sm font-semibold text-cream">Items</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line/50 bg-bg">
                {item.product?.images[0]?.url && (
                  <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-cream">{item.productName}</p>
                <p className="text-xs text-cream/55">
                  {item.quantity} × {formatPaisa(item.unitPriceInPaisa)}
                </p>
              </div>
              <p className="text-sm font-medium text-cream">
                {formatPaisa(item.totalPriceInPaisa)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals */}
      <section className="mt-6 rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-5">
        <h2 className="text-sm font-semibold text-cream">Totals</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Subtotal" value={formatPaisa(order.subtotalInPaisa)} />
          {order.discountInPaisa > 0 && (
            <Row
              label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}
              value={`-${formatPaisa(order.discountInPaisa)}`}
              valueClassName="text-saffron font-semibold"
            />
          )}
          <Row
            label="Shipping"
            value={order.shippingInPaisa === 0 ? 'Free' : formatPaisa(order.shippingInPaisa)}
            valueClassName={order.shippingInPaisa === 0 ? 'text-sage font-semibold' : undefined}
          />
          <div className="flex items-center justify-between border-t border-line/50 pt-3">
            <span className="font-display font-bold text-cream">Total</span>
            <span className="font-display text-lg font-black text-coral">
              {formatPaisa(order.totalInPaisa)}
            </span>
          </div>
          <p className="pt-1 text-xs text-cream/40">
            Payment: {order.paymentMethod} ({order.paymentStatus})
          </p>
        </dl>
      </section>

      {/* Shipping address */}
      <section className="mt-6 rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-5">
        <h2 className="text-sm font-semibold text-cream">Shipping to</h2>
        <div className="mt-3 text-sm text-cream">
          <p>{order.snapFullName}</p>
          <p className="text-cream/55">{order.snapPhone}</p>
          <p className="mt-1 text-cream/55">
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
              <p className="text-sm font-semibold text-cream">Cancel this order?</p>
              <p className="mt-1 text-xs text-cream/55">
                Stock will be restored to inventory and you&apos;ll receive a confirmation email.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={2}
                className="mt-3 w-full rounded-xl border border-line/50 bg-bg px-3 py-2 text-sm text-cream focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancel(false)}
                  className="btn-outline-grad rounded-full border border-line/50 px-4 py-2 text-sm font-medium transition-all"
                >
                  Keep order
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:bg-rose-400 transition-all"
                >
                  {cancelMutation.isPending ? 'Cancelling…' : 'Confirm cancellation'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 py-3 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10"
            >
              Cancel order
            </button>
          )}
        </section>
      )}
    </div>
  );
}

function Row({
  label, value, valueClassName,
}: {
  label:          string;
  value:          string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-cream/55">{label}</dt>
      <dd className={valueClassName ?? 'text-cream'}>{value}</dd>
    </div>
  );
}
