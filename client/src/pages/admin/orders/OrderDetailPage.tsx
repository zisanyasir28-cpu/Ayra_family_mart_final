import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Package, Check, Truck, CheckCircle2,
  XCircle, Clock, Box, User, MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAdminOrderById, useUpdateOrderStatus } from '@/hooks/useAdminOrders';
import { formatPaisa, cn } from '@/lib/utils';
import type { ApiOrderStatus } from '@/types/api';

// ─── Status config ─────────────────────────────────────────────────────────

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

const VALID_NEXT: Record<ApiOrderStatus, ApiOrderStatus[]> = {
  PENDING:          ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:        ['PROCESSING', 'CANCELLED'],
  PROCESSING:       ['SHIPPED'],
  SHIPPED:          ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED:        [],
  CANCELLED:        [],
  REFUND_REQUESTED: ['REFUNDED'],
  REFUNDED:         [],
};

// ─── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

// ─── Admin Order Detail ────────────────────────────────────────────────────────

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrderById(id);
  const updateMutation = useUpdateOrderStatus();

  const [nextStatus, setNextStatus]   = useState<ApiOrderStatus | ''>('');
  const [statusNote, setStatusNote]   = useState('');

  async function handleUpdateStatus() {
    if (!id || !nextStatus || !statusNote.trim()) return;
    try {
      await updateMutation.mutateAsync({ id, status: nextStatus, note: statusNote.trim() });
      toast.success(`Order status updated to ${nextStatus.replace('_', ' ')}`);
      setNextStatus('');
      setStatusNote('');
    } catch {
      toast.error('Failed to update order status.');
    }
  }

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-2xl bg-card" />
        <div className="h-48 animate-pulse rounded-2xl bg-card" />
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  const validNext = VALID_NEXT[order.status] ?? [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {/* 3-col header */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Order info */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Order</p>
          <p className="mt-1 font-mono text-base font-semibold text-foreground">{order.orderNumber}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              STATUS_TONE[order.status],
            )}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.paymentMethod} · {order.paymentStatus}
          </p>
        </div>

        {/* Customer info */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
          </div>
          <p className="mt-2 font-medium text-foreground">
            {(order as { user?: { name: string; email: string } }).user?.name ?? order.snapFullName}
          </p>
          <p className="text-xs text-muted-foreground">
            {(order as { user?: { name: string; email: string } }).user?.email ?? '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{order.snapPhone}</p>
        </div>

        {/* Shipping address */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ship to</p>
          </div>
          <p className="mt-2 font-medium text-foreground">{order.snapFullName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {order.snapAddressLine1}
            {order.snapAddressLine2 ? `, ${order.snapAddressLine2}` : ''}, {order.snapThana},{' '}
            {order.snapDistrict}
            {order.snapPostalCode ? ` ${order.snapPostalCode}` : ''}
          </p>
        </div>
      </div>

      {/* Status timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Status Timeline</h2>
          <ol className="mt-4 space-y-4">
            {order.statusHistory.map((entry, i) => {
              const Icon   = STATUS_ICON[entry.status] ?? Package;
              const isLast = i === (order.statusHistory?.length ?? 0) - 1;
              return (
                <li key={entry.id} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      STATUS_TONE[entry.status],
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {!isLast && <span className="mt-1 h-full w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-foreground">
                      {entry.status.replace('_', ' ')}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground">{entry.note}</p>
                    )}
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
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium">SKU</th>
                <th className="pb-2 pr-4 text-center font-medium">Qty</th>
                <th className="pb-2 pr-4 text-right font-medium">Unit Price</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4 font-medium text-foreground">{item.productName}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{item.productSku}</td>
                  <td className="py-3 pr-4 text-center text-muted-foreground">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right text-muted-foreground">
                    {formatPaisa(item.unitPriceInPaisa)}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatPaisa(item.totalPriceInPaisa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Price breakdown */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Price Breakdown</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Subtotal"  value={formatPaisa(order.subtotalInPaisa)} />
          {order.discountInPaisa > 0 && (
            <Row
              label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}
              value={`-${formatPaisa(order.discountInPaisa)}`}
            />
          )}
          <Row
            label="Shipping"
            value={order.shippingInPaisa === 0 ? 'Free' : formatPaisa(order.shippingInPaisa)}
          />
          <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPaisa(order.totalInPaisa)}</span>
          </div>
        </dl>
      </section>

      {/* Status update panel */}
      {validNext.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Update Status</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Current:{' '}
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              STATUS_TONE[order.status],
            )}>
              {order.status.replace('_', ' ')}
            </span>
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                New Status
              </label>
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as ApiOrderStatus)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select next status…</option>
                {validNext.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Note <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Required: describe the update"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={!nextStatus || !statusNote.trim() || updateMutation.isPending}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Updating…' : 'Update Status'}
            </button>
          </div>
        </section>
      )}

      {validNext.length === 0 && (
        <section className="rounded-2xl border border-border bg-card px-5 py-4">
          <p className="text-sm text-muted-foreground">
            This order is in a terminal state (<strong className="text-foreground">{order.status.replace('_', ' ')}</strong>) and cannot be updated further.
          </p>
        </section>
      )}
    </div>
  );
}
