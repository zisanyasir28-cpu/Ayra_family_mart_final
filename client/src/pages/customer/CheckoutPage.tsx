import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  Wallet,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Stepper } from '@/components/checkout/Stepper';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressForm } from '@/components/address/AddressForm';
import { Accordion } from '@/components/common/Accordion';
import { RadioCard } from '@/components/common/RadioCard';
import { useCartStore } from '@/store/cartStore';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/useAddresses';
import { createOrder, validateCoupon } from '@/services/orders';
import { cn, formatPaisa } from '@/lib/utils';
import { PaymentMethod, type AddressInput } from '@superstore/shared';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { number: 1 as const, label: 'Delivery' },
  { number: 2 as const, label: 'Review' },
  { number: 3 as const, label: 'Payment' },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cartItems  = useCartStore((s) => s.items);
  const cartCoupon = useCartStore((s) => s.coupon);
  const applyCouponStore  = useCartStore((s) => s.applyCoupon);
  const removeCouponStore = useCartStore((s) => s.removeCoupon);
  const clearCart  = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);

  // Step 1
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const { data: addresses = [], isLoading: loadingAddrs } = useAddresses();
  const createAddr = useCreateAddress();
  const deleteAddr = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  // Auto-select default address (or first) once loaded.
  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    const def = addresses.find((a) => a.isDefault);
    setSelectedAddressId(def?.id ?? addresses[0]!.id);
  }, [addresses, selectedAddressId]);

  // Step 2
  const [couponInput, setCouponInput]     = useState(cartCoupon?.code ?? '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]     = useState<string | null>(null);

  // Step 3
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [placing, setPlacing] = useState(false);

  // ─── Empty-cart guard ─────────────────────────────────────────────────────
  useEffect(() => {
    if (cartItems.length === 0) {
      toast('Your cart is empty.');
      navigate('/products', { replace: true });
    }
  }, [cartItems.length, navigate]);

  // ─── Derived values ───────────────────────────────────────────────────────

  const subtotalInPaisa = useMemo(
    () => cartItems.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0),
    [cartItems],
  );

  // ─── Step navigation ──────────────────────────────────────────────────────

  const goNext = (target: 2 | 3) => {
    setDirection(1);
    setStep(target);
  };
  const goPrev = (target: 1 | 2) => {
    setDirection(-1);
    setStep(target);
  };

  // ─── Coupon handlers ──────────────────────────────────────────────────────

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(code, subtotalInPaisa);
      applyCouponStore(res.code, res.discountInPaisa);
      toast.success(`Coupon "${res.code}" applied — ${formatPaisa(res.discountInPaisa)} off.`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setCouponError(e?.response?.data?.error?.message ?? 'Invalid or expired code.');
      removeCouponStore();
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    removeCouponStore();
    setCouponInput('');
    setCouponError(null);
  }

  // ─── Place order ──────────────────────────────────────────────────────────

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address.');
      goPrev(1);
      return;
    }
    setPlacing(true);
    try {
      const result = await createOrder({
        items: cartItems.map((i) => ({
          productId: i.productId,
          quantity:  i.quantity,
        })),
        shippingAddressId: selectedAddressId,
        paymentMethod,
        ...(cartCoupon?.code && { couponCode: cartCoupon.code }),
      });

      if (paymentMethod === PaymentMethod.COD) {
        clearCart();
        navigate(`/orders/success/${result.order.id}`, { replace: true });
        return;
      }

      // SSLCommerz
      clearCart();
      if (result.gatewayUrl) {
        window.location.href = result.gatewayUrl;
      } else {
        toast.error('Payment gateway is unavailable. Please retry.');
      }
    } catch (err: unknown) {
      const e = err as {
        response?: {
          status?: number;
          data?: {
            error?: { code?: string; message?: string; details?: unknown };
          };
        };
      };
      const code = e?.response?.data?.error?.code;
      const message = e?.response?.data?.error?.message ?? 'Could not place order.';

      if (code === 'INSUFFICIENT_STOCK') {
        toast.error(message);
        goPrev(2);
      } else if (code?.startsWith('COUPON_')) {
        toast.error(message);
        setCouponError(message);
        removeCouponStore();
        goPrev(2);
      } else if (code === 'PRODUCT_NOT_FOUND' || code === 'PRODUCT_INACTIVE') {
        toast.error(message);
        goPrev(2);
      } else {
        toast.error(message);
      }
    } finally {
      setPlacing(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (cartItems.length === 0) return null; // guard above will redirect

  const canContinueFromStep1 = Boolean(selectedAddressId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cream">Checkout</h1>
        <p className="mt-1 text-sm text-cream/65">
          Review your order and pick how you'd like to pay.
        </p>
      </header>

      {/* Stepper */}
      <div className="mb-10 max-w-3xl">
        <Stepper
          current={step}
          steps={STEPS}
          onJump={(to) => {
            // Allow jumping to any earlier step.
            if (to < step) {
              setDirection(-1);
              setStep(to);
            }
          }}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── Left: step content ───────────────────────────────────── */}
        <div className="min-h-[40vh] lg:col-span-3">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {step === 1 && (
                <StepDelivery
                  loading={loadingAddrs}
                  addresses={addresses}
                  selectedId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                  addingNew={addingNew}
                  onToggleAddNew={() => setAddingNew((v) => !v)}
                  creating={createAddr.isPending}
                  onCreate={async (input) => {
                    const addr = await createAddr.mutateAsync(input);
                    setSelectedAddressId(addr.id);
                    setAddingNew(false);
                    toast.success('Address saved.');
                  }}
                  onDelete={async (id) => {
                    if (!confirm('Delete this address?')) return;
                    await deleteAddr.mutateAsync(id);
                    if (selectedAddressId === id) setSelectedAddressId(null);
                    toast.success('Address deleted.');
                  }}
                  onSetDefault={async (id) => {
                    await setDefault.mutateAsync(id);
                    toast.success('Default address updated.');
                  }}
                  onContinue={() => goNext(2)}
                  canContinue={canContinueFromStep1}
                />
              )}

              {step === 2 && (
                <StepReview
                  couponInput={couponInput}
                  setCouponInput={setCouponInput}
                  couponLoading={couponLoading}
                  couponError={couponError}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  appliedCouponCode={cartCoupon?.code ?? null}
                  onBack={() => goPrev(1)}
                  onContinue={() => goNext(3)}
                />
              )}

              {step === 3 && (
                <StepPayment
                  paymentMethod={paymentMethod}
                  onChange={setPaymentMethod}
                  onBack={() => goPrev(2)}
                  onPlace={handlePlaceOrder}
                  placing={placing}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right: sticky order summary ──────────────────────────── */}
        <div className="lg:col-span-2">
          <OrderSummary paymentMethod={step === 3 ? paymentMethod : null} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 — Delivery ───────────────────────────────────────────────────────

interface StepDeliveryProps {
  loading: boolean;
  addresses: import('@/types/api').ApiAddress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  addingNew: boolean;
  onToggleAddNew: () => void;
  creating: boolean;
  onCreate: (input: AddressInput) => Promise<void>;
  onDelete: (id: string) => Promise<void> | void;
  onSetDefault: (id: string) => Promise<void> | void;
  onContinue: () => void;
  canContinue: boolean;
}

function StepDelivery({
  loading,
  addresses,
  selectedId,
  onSelect,
  addingNew,
  onToggleAddNew,
  creating,
  onCreate,
  onDelete,
  onSetDefault,
  onContinue,
  canContinue,
}: StepDeliveryProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-cream">Where should we deliver?</h2>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-surface py-16 text-cream/55">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <Truck className="mx-auto h-8 w-8 text-cream/40" />
          <p className="mt-3 text-sm text-cream/65">
            No saved addresses yet. Add your first below.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={selectedId === addr.id}
              onSelect={() => onSelect(addr.id)}
              onDelete={() => onDelete(addr.id)}
              onEdit={
                addr.isDefault
                  ? undefined
                  : () => {
                      onSetDefault(addr.id);
                    }
              }
            />
          ))}
        </div>
      )}

      <Accordion
        title={addingNew ? 'New address' : 'Add a new address'}
        open={addingNew}
        onToggle={onToggleAddNew}
      >
        <AddressForm
          submitting={creating}
          onSubmit={onCreate}
          onCancel={onToggleAddNew}
          submitLabel="Save & use"
        />
      </Accordion>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-full bg-saffron px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to review
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

// ─── Step 2 — Review ─────────────────────────────────────────────────────────

interface StepReviewProps {
  couponInput: string;
  setCouponInput: (v: string) => void;
  couponLoading: boolean;
  couponError: string | null;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  appliedCouponCode: string | null;
  onBack: () => void;
  onContinue: () => void;
}

function StepReview({
  couponInput,
  setCouponInput,
  couponLoading,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCouponCode,
  onBack,
  onContinue,
}: StepReviewProps) {
  const items = useCartStore((s) => s.items);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-cream">Review your order</h2>

      {/* Item list */}
      <div className="rounded-2xl border border-line bg-surface">
        <ul className="divide-y divide-line/70">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.variantId ?? ''}`}
              className="flex items-center gap-4 p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-bg">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-cream">{item.name}</div>
                <div className="text-xs text-cream/60">
                  {item.quantity} × {formatPaisa(item.priceInPaisa)} per {item.unit}
                </div>
              </div>
              <div className="text-right text-sm font-semibold text-cream">
                {formatPaisa(item.priceInPaisa * item.quantity)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Coupon */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cream">
          <Tag className="h-4 w-4 text-saffron" />
          Have a coupon?
        </div>

        {appliedCouponCode ? (
          <div className="flex items-center justify-between rounded-xl border border-saffron/40 bg-saffron/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-cream">
              <Tag className="h-4 w-4 text-saffron" />
              <span className="font-mono font-semibold text-saffron">{appliedCouponCode}</span>
              <span className="text-cream/65">applied</span>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-cream/55 hover:text-coral"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onBlur={() => {
                if (couponInput.trim()) onApplyCoupon();
              }}
              placeholder="Enter code"
              className={cn(
                'flex-1 rounded-xl border bg-bg px-4 py-2.5 text-sm uppercase tracking-wider text-cream placeholder:text-cream/30 placeholder:normal-case focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20',
                couponError ? 'border-coral' : 'border-line',
              )}
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="rounded-xl bg-saffron/15 px-5 py-2.5 text-sm font-bold text-saffron transition-colors hover:bg-saffron hover:text-bg disabled:opacity-60"
            >
              {couponLoading ? 'Checking…' : 'Apply'}
            </button>
          </div>
        )}
        {couponError && <p className="mt-2 text-xs text-coral">{couponError}</p>}
      </div>

      {/* Nav */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream"
        >
          Continue to payment
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

// ─── Step 3 — Payment ────────────────────────────────────────────────────────

interface StepPaymentProps {
  paymentMethod: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  onBack: () => void;
  onPlace: () => void;
  placing: boolean;
}

function StepPayment({
  paymentMethod,
  onChange,
  onBack,
  onPlace,
  placing,
}: StepPaymentProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-cream">How would you like to pay?</h2>

      <div className="space-y-3">
        <RadioCard
          selected={paymentMethod === PaymentMethod.SSLCOMMERZ}
          onSelect={() => onChange(PaymentMethod.SSLCOMMERZ)}
          icon={<CreditCard className="h-5 w-5" />}
          title="Pay online"
          badge="Online"
          description="Cards, mobile wallets, internet banking via SSLCommerz."
        />
        <RadioCard
          selected={paymentMethod === PaymentMethod.COD}
          onSelect={() => onChange(PaymentMethod.COD)}
          icon={<Wallet className="h-5 w-5" />}
          title="Cash on delivery"
          description="Pay when your order arrives at your doorstep."
          trailing="৳20 surcharge"
        />
      </div>

      {/* Nav */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={placing}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/40 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onPlace}
          disabled={placing}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-8 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream disabled:opacity-60"
        >
          {placing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing order…
            </>
          ) : (
            <>
              Place order
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
