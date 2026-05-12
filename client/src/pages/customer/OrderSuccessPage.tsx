import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { useMyOrderById } from '@/hooks/useMyOrders';
import { formatPaisa } from '@/lib/utils';

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useMyOrderById(id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-saffron/15 text-saffron"
      >
        <Check className="h-10 w-10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 text-center"
      >
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Order placed!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for your order. We&apos;ve emailed you a confirmation with the details.
        </p>
      </motion.div>

      {isLoading || !order ? (
        <div className="mt-8 h-32 animate-pulse rounded-2xl bg-surface" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 rounded-2xl border border-line bg-surface p-6"
        >
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Order number</p>
              <p className="font-mono text-base font-semibold text-foreground">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="text-base font-semibold text-foreground">{formatPaisa(order.totalInPaisa)}</p>
            </div>
          </div>

          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span className="text-foreground">
                  {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="text-foreground">{formatPaisa(item.totalPriceInPaisa)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-line pt-4 text-sm text-muted-foreground">
            <p>Shipping to: <span className="text-foreground">{order.snapFullName}, {order.snapAddressLine1}, {order.snapThana}, {order.snapDistrict}</span></p>
            <p className="mt-1">Payment: <span className="text-foreground">{order.paymentMethod}</span></p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Link
          to={`/orders/${id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-bg/40"
        >
          <Package className="h-4 w-4" /> Track this order
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-saffron/90"
        >
          <ShoppingBag className="h-4 w-4" /> Continue shopping
        </Link>
      </motion.div>
    </div>
  );
}
