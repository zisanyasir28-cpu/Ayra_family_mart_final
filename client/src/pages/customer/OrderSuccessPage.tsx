import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, Truck } from 'lucide-react';
import { useMyOrderById } from '@/hooks/useMyOrders';
import { formatPaisa } from '@/lib/utils';

/**
 * /orders/success/:id — confirmation screen shown after a successful COD or
 * SSLCommerz return-on-success. Heavy on reassurance: big checkmark, clear
 * order number, total + email + payment status, two next-step buttons.
 */
export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useMyOrderById(id);

  if (!id) return <Navigate to="/orders" replace />;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-saffron/30 border-t-saffron" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-cream">Order not found</h1>
        <p className="mt-2 text-cream/65">
          We couldn't find that order. Check your{' '}
          <Link to="/orders" className="text-saffron hover:text-cream">
            order history
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Big checkmark */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 240 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-saffron/15"
      >
        <CheckCircle2 className="h-12 w-12 text-saffron" strokeWidth={2} />
      </motion.div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-6 text-center"
      >
        <h1 className="text-3xl font-bold text-cream">Thank you, your order is in!</h1>
        <p className="mt-2 text-cream/65">
          {order.paymentMethod === 'COD'
            ? "We'll deliver to your doorstep — pay in cash on arrival."
            : 'Your payment was received and the order is now being prepared.'}
        </p>
      </motion.div>

      {/* Order summary card */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div className="flex items-center justify-between border-b border-line/70 px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-cream/55">
              Order number
            </div>
            <div className="font-mono text-lg font-bold text-saffron">
              {order.orderNumber}
            </div>
          </div>
          <span className="rounded-full bg-saffron/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-saffron">
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        <ul className="divide-y divide-line/70">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-6 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-cream">
                  {item.productName}
                </div>
                <div className="text-xs text-cream/55">× {item.quantity}</div>
              </div>
              <div className="text-sm font-semibold text-cream">
                {formatPaisa(item.totalPriceInPaisa)}
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-1.5 border-t border-line/70 px-6 py-4 text-sm">
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
        </div>

        <div className="border-t border-line/70 bg-surface-2/40 px-6 py-4 text-sm text-cream/80">
          <div className="flex items-start gap-3">
            <Truck className="h-4 w-4 shrink-0 text-saffron" />
            <div>
              <div className="font-semibold text-cream">
                {order.snapFullName} · {order.snapPhone}
              </div>
              <div className="text-cream/65">
                {order.snapAddressLine1}
                {order.snapAddressLine2 ? `, ${order.snapAddressLine2}` : ''}
              </div>
              <div className="text-cream/65">
                {order.snapThana}, {order.snapDistrict}
                {order.snapPostalCode ? ` — ${order.snapPostalCode}` : ''}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next steps */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center"
      >
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/40"
        >
          Continue shopping
        </Link>
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream"
        >
          <Package className="h-4 w-4" />
          Track order
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
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
      <span
        className={
          highlight ? 'font-medium text-saffron' : 'font-medium text-cream'
        }
      >
        {value}
      </span>
    </div>
  );
}
