import { formatPaisa } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import {
  type PaymentMethod,
  FREE_DELIVERY_THRESHOLD_PAISA,
  DELIVERY_FEE_PAISA,
  COD_SURCHARGE_PAISA,
} from '@superstore/shared';

interface OrderSummaryProps {
  paymentMethod?: PaymentMethod | 'COD' | 'SSLCOMMERZ' | null;
}

export function OrderSummary({ paymentMethod }: OrderSummaryProps) {
  const items    = useCartStore((s) => s.items);
  const coupon   = useCartStore((s) => s.coupon);
  const subtotal = items.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0);
  const discount = coupon?.discountInPaisa ?? 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const baseShipping  = afterDiscount >= FREE_DELIVERY_THRESHOLD_PAISA ? 0 : DELIVERY_FEE_PAISA;
  const codSurcharge  = paymentMethod === 'COD' ? COD_SURCHARGE_PAISA : 0;
  const shipping      = baseShipping + codSurcharge;
  const total         = afterDiscount + shipping;

  return (
    <aside className="sticky top-[8.5rem] rounded-3xl border border-line/50 bg-surface/70 p-5 backdrop-blur-xl shadow-[0_0_40px_-16px_hsl(var(--saffron)/0.15)]">
      <h2 className="font-display text-base font-bold text-cream">Order Summary</h2>

      <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1 scrollbar-hide">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line/50 bg-bg">
              {item.image && (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-cream">{item.name}</p>
              <p className="text-xs text-cream/50">
                {item.quantity} × {formatPaisa(item.priceInPaisa)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-cream">
              {formatPaisa(item.priceInPaisa * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-line/50 pt-4 text-sm">
        <Row label="Subtotal" value={formatPaisa(subtotal)} />
        {discount > 0 && coupon && (
          <Row
            label={<>Discount <span className="text-saffron">({coupon.code})</span></>}
            value={`− ${formatPaisa(discount)}`}
            valueClassName="font-semibold text-saffron"
          />
        )}
        <Row
          label="Shipping"
          value={baseShipping === 0 ? 'Free' : formatPaisa(baseShipping)}
          valueClassName={baseShipping === 0 ? 'font-bold text-sage' : undefined}
        />
        {codSurcharge > 0 && (
          <Row label="COD surcharge" value={formatPaisa(codSurcharge)} />
        )}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-2/60 px-4 py-3">
        <span className="font-display font-bold text-cream">Total</span>
        <span className="font-display text-xl font-black text-coral">
          {formatPaisa(total)}
        </span>
      </div>
    </aside>
  );
}

function Row({
  label, value, valueClassName,
}: {
  label:          React.ReactNode;
  value:          React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cream/55">{label}</span>
      <span className={valueClassName ?? 'text-cream'}>{value}</span>
    </div>
  );
}
