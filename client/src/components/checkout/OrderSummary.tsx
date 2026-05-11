import { useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPaisa } from '@/lib/utils';
import { Tag } from 'lucide-react';

import { PaymentMethod } from '@superstore/shared';

interface OrderSummaryProps {
  /** When 'COD', the summary shows the ৳20 surcharge inline. */
  paymentMethod?: PaymentMethod | 'COD' | 'SSLCOMMERZ' | null;
}

const FREE_SHIPPING_THRESHOLD = 99_900;
const STANDARD_SHIPPING = 6_000;
const COD_SURCHARGE = 2_000;

/**
 * Sticky right-rail order summary used across all 3 checkout steps.
 *
 * Numbers here are PREVIEW only — the server is the source of truth. We mirror
 * the same shipping logic (≥ ৳999 free, +৳20 COD surcharge) so the user sees
 * the right total before placing the order.
 */
export function OrderSummary({ paymentMethod }: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);

  const breakdown = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0);
    const discount = coupon?.discountInPaisa ?? 0;
    const subAfter = Math.max(0, subtotal - discount);
    const baseShipping =
      subAfter === 0 || subAfter >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    const codSurcharge = paymentMethod === 'COD' ? COD_SURCHARGE : 0;
    const shipping = baseShipping + codSurcharge;
    const total = Math.max(0, subAfter + shipping);
    return { subtotal, discount, baseShipping, codSurcharge, shipping, total };
  }, [items, coupon, paymentMethod]);

  return (
    <aside className="sticky top-24 rounded-2xl border border-line bg-surface p-6">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-cream/55">
        Order summary
      </h3>

      <ul className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.variantId ?? ''}`}
            className="flex items-center gap-3 text-sm"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-bg">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1 text-[10px] font-bold text-bg">
                {item.quantity}
              </span>
            </span>
            <span className="min-w-0 flex-1 truncate text-cream/90">{item.name}</span>
            <span className="font-semibold text-cream">
              {formatPaisa(item.priceInPaisa * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-line/70 pt-4 text-sm">
        <Row label="Subtotal" value={formatPaisa(breakdown.subtotal)} />
        {breakdown.discount > 0 && (
          <Row
            label={
              <span className="inline-flex items-center gap-1.5 text-saffron">
                <Tag className="h-3 w-3" />
                {coupon?.code ?? 'Discount'}
              </span>
            }
            value={`− ${formatPaisa(breakdown.discount)}`}
            valueClass="text-saffron"
          />
        )}
        <Row
          label="Shipping"
          value={
            breakdown.baseShipping === 0 && breakdown.codSurcharge === 0
              ? 'Free'
              : formatPaisa(breakdown.shipping)
          }
        />
        {breakdown.codSurcharge > 0 && (
          <Row
            label={<span className="text-cream/55">incl. COD surcharge</span>}
            value={`+ ${formatPaisa(breakdown.codSurcharge)}`}
            valueClass="text-cream/55 text-xs"
          />
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-line/70 pt-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cream/55">
          Total
        </span>
        <span className="text-2xl font-bold text-cream">
          {formatPaisa(breakdown.total)}
        </span>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cream/65">{label}</span>
      <span className={valueClass ?? 'font-medium text-cream'}>{value}</span>
    </div>
  );
}
