import { formatPaisa } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import type { PaymentMethod } from '@superstore/shared';

interface OrderSummaryProps {
  paymentMethod?: PaymentMethod | 'COD' | 'SSLCOMMERZ' | null;
}

const FREE_SHIPPING_THRESHOLD_PAISA = 99_900;
const STANDARD_SHIPPING_PAISA       = 6_000;
const COD_SURCHARGE_PAISA           = 2_000;

export function OrderSummary({ paymentMethod }: OrderSummaryProps) {
  const items    = useCartStore((s) => s.items);
  const coupon   = useCartStore((s) => s.coupon);
  const subtotal = items.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0);
  const discount = coupon?.discountInPaisa ?? 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const baseShipping  = afterDiscount >= FREE_SHIPPING_THRESHOLD_PAISA ? 0 : STANDARD_SHIPPING_PAISA;
  const codSurcharge  = paymentMethod === 'COD' ? COD_SURCHARGE_PAISA : 0;
  const shipping      = baseShipping + codSurcharge;
  const total         = afterDiscount + shipping;

  return (
    <aside className="sticky top-24 rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground">Order Summary</h2>

      <ul className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-bg">
              {item.image && (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} × {formatPaisa(item.priceInPaisa)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-medium text-foreground">
              {formatPaisa(item.priceInPaisa * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <Row label="Subtotal" value={formatPaisa(subtotal)} />
        {discount > 0 && coupon && (
          <Row
            label={<>Discount <span className="text-saffron">({coupon.code})</span></>}
            value={`- ${formatPaisa(discount)}`}
            valueClassName="text-saffron"
          />
        )}
        <Row
          label="Shipping"
          value={baseShipping === 0 ? 'Free' : formatPaisa(baseShipping)}
        />
        {codSurcharge > 0 && (
          <Row label="COD surcharge" value={formatPaisa(codSurcharge)} />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-semibold text-foreground">Total</span>
        <span className="text-lg font-bold text-foreground">{formatPaisa(total)}</span>
      </div>
    </aside>
  );
}

function Row({
  label, value, valueClassName,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClassName ?? 'text-foreground'}>{value}</span>
    </div>
  );
}
