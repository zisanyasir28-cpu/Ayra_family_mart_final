import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMyOrderById, useCancelMyOrder } from '@/hooks/useMyOrders';
import { formatPaisa, cn } from '@/lib/utils';
import type { ApiOrderStatus } from '@/types/api';

const CANCELLABLE: ApiOrderStatus[] = ['PENDING', 'CONFIRMED'];

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useMyOrderById(id);
  const cancel = useCancelMyOrder();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!id) return <Navigate to="/orders" replace />;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cream/55" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-cream">Order not found</h1>
        <p className="mt-2 text-cream/65">
          We couldn't find that order.{' '}
          <Link to="/orders" className="text-saffron hover:text-cream">
            Back to your orders
          </Link>
        </p>
      </div>
    );
  }

  const canCancel = CANCELLABLE.includes(order.status);

  async function handleCancel() {
    try {
      await cancel.mutateAsync({
        id: order!.id,
        ...(cancelReason.trim() && { reason: cancelReason.trim() }),
      });
      toast.success('Order cancelled. Stock has been restored.');
      setConfirmingCancel(false);
      setCancelReason('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(e?.response?.data?.error?.message ?? 'Could not cancel order.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream/65 hover:text-cream"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-cream/55">
            Order
          </div>
          <h1 className="mt-1 font-mono text-2xl font-bold text-saffron">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-cream/65">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleString('en-GB', {
              day:    '2-digit',
              month:  'short',
              year:   'numeric',
              hour:   '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span className="rounded-full bg-saffron/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-saffron">
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-3">
          {/* Status timeline */}
          <Section title="Status timeline">
            {order.statusHistory && order.statusHistory.length > 0 ? (
              <ol className="space-y-4">
                {order.statusHistory.map((entry, idx) => {
                  const isLatest = idx === order.statusHistory!.length - 1;
                  return (
                    <li key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border-2',
                            isLatest
                              ? 'border-saffron bg-saffron text-bg'
                              : 'border-line bg-surface text-cream/55',
                          )}
                        >
                          <StatusIcon status={entry.status} />
                        </span>
                        {idx < (order.statusHistory!.length - 1) && (
                          <span className="mt-1 h-full w-px flex-1 bg-line/70" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="text-sm font-semibold text-cream">
                          {STATUS_LABEL[entry.status]}
                        </div>
                        {entry.note && (
                          <div className="text-xs text-cream/65">{entry.note}</div>
                        )}
                        <div className="mt-0.5 text-xs text-cream/45">
                          {new Date(entry.createdAt).toLocaleString('en-GB', {
                            day:    '2-digit',
                            month:  'short',
                            hour:   '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-cream/55">No status updates yet.</p>
            )}
          </Section>

          {/* Items */}
          <Section title="Items">
            <ul className="divide-y divide-line/70">
              {order.items.map((item) => {
                const slug = item.product?.slug;
                const img = item.product?.images[0]?.url;
                return (
                  <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-bg">
                      {img && (
                        <img src={img} alt={item.productName} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {slug ? (
                        <Link
                          to={`/products/${slug}`}
                          className="block truncate text-sm font-semibold text-cream hover:text-saffron"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <span className="block truncate text-sm font-semibold text-cream">
                          {item.productName}
                        </span>
                      )}
                      <div className="text-xs text-cream/55">
                        {item.quantity} × {formatPaisa(item.unitPriceInPaisa)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-cream">
                      {formatPaisa(item.totalPriceInPaisa)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Cancel */}
          {canCancel && (
            <Section
              title="Need to cancel?"
              tone="warn"
            >
              {!confirmingCancel ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-cream/70">
                    You can still cancel this order. Stock will be restored and any
                    coupon will become available again.
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="rounded-full border border-coral/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-coral transition-colors hover:bg-coral hover:text-bg"
                  >
                    Cancel order
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-[0.18em] text-cream/55">
                    Reason (optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Help us improve — what changed?"
                    rows={3}
                    className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                    maxLength={500}
                  />
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingCancel(false);
                        setCancelReason('');
                      }}
                      disabled={cancel.isPending}
                      className="rounded-full border border-line px-5 py-2 text-xs font-semibold text-cream/80 hover:border-cream/40"
                    >
                      Keep order
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={cancel.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-bg transition-colors hover:opacity-90 disabled:opacity-60"
                    >
                      {cancel.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Confirm cancel
                    </button>
                  </div>
                </div>
              )}
            </Section>
          )}
        </div>

        {/* ── Right column ────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Totals */}
          <Section title="Totals">
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPaisa(order.subtotalInPaisa)} />
              {order.discountInPaisa > 0 && (
                <Row
                  label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}
                  value={`− ${formatPaisa(order.discountInPaisa)}`}
                  highlight
                />
              )}
              <Row
                label="Shipping"
                value={
                  order.shippingInPaisa === 0 ? 'Free' : formatPaisa(order.shippingInPaisa)
                }
              />
              <div className="mt-3 flex items-baseline justify-between border-t border-line/70 pt-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-cream/55">
                  Total
                </span>
                <span className="text-xl font-bold text-cream">
                  {formatPaisa(order.totalInPaisa)}
                </span>
              </div>
              <div className="mt-2 text-xs text-cream/55">
                {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online payment'}
                {' · '}
                {order.paymentStatus.toLowerCase().replace(/_/g, ' ')}
              </div>
            </div>
          </Section>

          {/* Shipping address */}
          <Section title="Shipping to">
            <div className="text-sm text-cream/85">
              <div className="font-semibold text-cream">{order.snapFullName}</div>
              <div className="text-cream/65">{order.snapPhone}</div>
              <div className="mt-1 text-cream/65">
                {order.snapAddressLine1}
                {order.snapAddressLine2 ? `, ${order.snapAddressLine2}` : ''}
              </div>
              <div className="text-cream/65">
                {order.snapThana}, {order.snapDistrict}
                {order.snapPostalCode ? ` — ${order.snapPostalCode}` : ''}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ─── Tiny presentational helpers ─────────────────────────────────────────────

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: 'warn';
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border bg-surface p-5',
        tone === 'warn' ? 'border-coral/30' : 'border-line',
      )}
    >
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-cream/55">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cream/65">{label}</span>
      <span className={highlight ? 'font-medium text-saffron' : 'font-medium text-cream'}>
        {value}
      </span>
    </div>
  );
}

function StatusIcon({ status }: { status: ApiOrderStatus }) {
  const cls = 'h-4 w-4';
  switch (status) {
    case 'DELIVERED':        return <CheckCircle2 className={cls} />;
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY': return <Truck className={cls} />;
    case 'CANCELLED':
    case 'REFUNDED':
    case 'REFUND_REQUESTED': return <XCircle className={cls} />;
    case 'PROCESSING':       return <Package className={cls} />;
    default:                 return <Clock className={cls} />;
  }
}

// silence unused-import warnings for AlertTriangle (kept for future use)
void AlertTriangle;
