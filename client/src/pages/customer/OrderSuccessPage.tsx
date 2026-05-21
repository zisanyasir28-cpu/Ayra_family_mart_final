import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { useMyOrderById } from '@/hooks/useMyOrders';
import { formatPaisa } from '@/lib/utils';

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useMyOrderById(id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-saffron/15 text-saffron shadow-[0_0_48px_-8px_hsl(var(--saffron)/0.55)]"
      >
        <Check className="h-12 w-12" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 text-center"
      >
        <h1 className="font-display text-2xl font-black text-cream sm:text-3xl">
          Order placed! 🎉
        </h1>
        <p className="mt-2 text-cream/55">
          Thank you for your order. We&apos;ve emailed you a confirmation with the details.
        </p>
      </motion.div>

      {isLoading || !order ? (
        <div className="mt-8 h-32 animate-pulse rounded-2xl bg-surface/60" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-6 shadow-[0_0_40px_-16px_hsl(var(--saffron)/0.12)]"
        >
          <div className="flex items-center justify-between border-b border-line/50 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-cream/40">Order number</p>
              <p className="font-mono text-base font-semibold text-cream">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-cream/40">Total</p>
              <p className="font-display text-base font-black text-coral">{formatPaisa(order.totalInPaisa)}</p>
            </div>
          </div>

          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span className="text-cream">
                  {item.productName} <span className="text-cream/40">× {item.quantity}</span>
                </span>
                <span className="text-cream">{formatPaisa(item.totalPriceInPaisa)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-line/50 pt-4 text-sm text-cream/55">
            <p>
              Shipping to:{' '}
              <span className="text-cream">
                {order.snapFullName}, {order.snapAddressLine1}, {order.snapThana}, {order.snapDistrict}
              </span>
            </p>
            <p className="mt-1">
              Payment: <span className="text-cream">{order.paymentMethod}</span>
            </p>
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
          className="inline-flex items-center gap-2 rounded-full border border-line/50 bg-surface/60 px-5 py-2.5 text-sm font-medium text-cream transition-all hover:border-saffron/40 hover:text-saffron"
        >
          <Package className="h-4 w-4" /> Track this order
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-bg transition-all hover:bg-saffron/90 hover:shadow-[0_0_20px_-4px_hsl(var(--saffron)/0.6)]"
        >
          <ShoppingBag className="h-4 w-4" /> Continue shopping
        </Link>
      </motion.div>
    </div>
  );
}
