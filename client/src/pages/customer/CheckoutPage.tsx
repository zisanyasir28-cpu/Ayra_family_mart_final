import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, Tag, X, ShoppingBag, Truck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { useCartStore } from '@/store/cartStore';
import { useAddresses, useCreateAddress } from '@/hooks/useAddresses';
import { Stepper } from '@/components/checkout/Stepper';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressForm } from '@/components/address/AddressForm';
import { Accordion } from '@/components/common/Accordion';
import { RadioCard } from '@/components/common/RadioCard';
import { createOrder, validateCoupon } from '@/services/orders';
import { formatPaisa, cn } from '@/lib/utils';
import { PaymentMethod, type AddressInput } from '@superstore/shared';

const STEPS = ['Delivery', 'Review', 'Payment'];

const slideVariants = {
  enter: { opacity: 0, x: 32 },
  show:  { opacity: 1, x: 0 },
  exit:  { opacity: 0, x: -32 },
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items     = useCartStore((s) => s.items);
  const coupon    = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotalInPaisa = items.reduce((s, i) => s + i.priceInPaisa * i.quantity, 0);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress]       = useState(false);
  const [paymentMethod, setPaymentMethod]         = useState<PaymentMethod>(PaymentMethod.COD);
  const [couponInput, setCouponInput]             = useState('');
  const [couponLoading, setCouponLoading]         = useState(false);
  const [placing, setPlacing] = useState(false);

  const { data: addresses = [], isLoading: loadingAddresses } = useAddresses();
  const createAddrMutation = useCreateAddress();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !placing) {
      toast('Your cart is empty.', { icon: '🛒' });
      navigate('/products');
    }
  }, [items.length, navigate, placing]);

  // Auto-select default address on first load
  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    setSelectedAddressId(def?.id ?? null);
  }, [addresses, selectedAddressId]);

  // ── Coupon apply ─────────────────────────────────────────────────────────────
  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(code, subtotalInPaisa);
      applyCoupon(result.code, result.discountInPaisa);
      setCouponInput('');
      toast.success(`Coupon "${result.code}" applied.`);
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data?.error?.message ?? 'Invalid coupon')
        : 'Invalid coupon';
      toast.error(message);
    } finally {
      setCouponLoading(false);
    }
  }

  // ── Save new address ────────────────────────────────────────────────────────
  async function handleSaveAddress(values: AddressInput) {
    try {
      const created = await createAddrMutation.mutateAsync(values);
      setSelectedAddressId(created.id);
      setShowNewAddress(false);
      toast.success('Address saved.');
    } catch {
      toast.error('Could not save address.');
    }
  }

  // ── Place order ─────────────────────────────────────────────────────────────
  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address.');
      setStep(1);
      return;
    }
    setPlacing(true);
    try {
      const result = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddressId: selectedAddressId,
        paymentMethod,
        couponCode: coupon?.code,
      });

      clearCart();

      if (paymentMethod === PaymentMethod.SSLCOMMERZ && result.gatewayUrl) {
        window.location.href = result.gatewayUrl;
        return;
      }

      navigate(`/orders/success/${result.order.id}`);
    } catch (err) {
      setPlacing(false);
      if (isAxiosError(err)) {
        const code    = err.response?.data?.error?.code;
        const message = err.response?.data?.error?.message ?? 'Could not place order';
        toast.error(message);
        if (code === 'INSUFFICIENT_STOCK') {
          navigate('/products');
        } else if (typeof code === 'string' && code.startsWith('COUPON_')) {
          removeCoupon();
          setStep(2);
        }
      } else {
        toast.error('Could not place order.');
      }
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Checkout</h1>

      <div className="mt-6">
        <Stepper current={step} steps={STEPS} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
        <div className="md:col-span-2 lg:col-span-3">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="step-1"
                variants={slideVariants}
                initial="enter" animate="show" exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <header className="flex items-center gap-2 text-foreground">
                  <Truck className="h-5 w-5 text-saffron" />
                  <h2 className="text-lg font-semibold">Delivery address</h2>
                </header>

                {loadingAddresses ? (
                  <div className="rounded-xl border border-line bg-surface p-6 text-center text-muted-foreground">
                    Loading addresses…
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        selectable
                        selected={selectedAddressId === addr.id}
                        onSelect={() => setSelectedAddressId(addr.id)}
                      />
                    ))}
                  </div>
                )}

                <Accordion
                  open={showNewAddress}
                  onToggle={() => setShowNewAddress((v) => !v)}
                  title={
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-saffron" />
                      Add a new address
                    </span>
                  }
                >
                  <AddressForm
                    onSubmit={handleSaveAddress}
                    onCancel={() => setShowNewAddress(false)}
                    submitting={createAddrMutation.isPending}
                  />
                </Accordion>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!selectedAddressId}
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-saffron/90 disabled:opacity-50"
                  >
                    Continue to review <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="step-2"
                variants={slideVariants}
                initial="enter" animate="show" exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <header className="flex items-center gap-2 text-foreground">
                  <ShoppingBag className="h-5 w-5 text-saffron" />
                  <h2 className="text-lg font-semibold">Review items</h2>
                </header>

                <ul className="space-y-3 rounded-xl border border-line bg-surface p-4">
                  {items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-bg">
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
                      <p className="text-sm font-medium text-foreground">
                        {formatPaisa(item.priceInPaisa * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Tag className="h-4 w-4 text-saffron" />
                    Promo code
                  </div>

                  {coupon ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-saffron/40 bg-saffron/[0.06] px-3 py-2">
                      <span className="text-sm">
                        <span className="font-semibold text-saffron">{coupon.code}</span>
                        <span className="ml-2 text-muted-foreground">
                          -{formatPaisa(coupon.discountInPaisa)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Remove coupon"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim() || couponLoading}
                        className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50"
                      >
                        {couponLoading ? 'Checking…' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-bg/40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-lg bg-saffron px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-saffron/90"
                  >
                    Continue to payment <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="step-3"
                variants={slideVariants}
                initial="enter" animate="show" exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <header className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-5 w-5 text-saffron" />
                  <h2 className="text-lg font-semibold">Payment method</h2>
                </header>

                <div className="space-y-3">
                  <RadioCard
                    selected={paymentMethod === PaymentMethod.SSLCOMMERZ}
                    onSelect={() => setPaymentMethod(PaymentMethod.SSLCOMMERZ)}
                    title="SSLCommerz"
                    badge="Online"
                    description="Pay securely with cards, bKash, Nagad, or bank."
                  />
                  <RadioCard
                    selected={paymentMethod === PaymentMethod.COD}
                    onSelect={() => setPaymentMethod(PaymentMethod.COD)}
                    title="Cash on Delivery"
                    description="Pay when you receive your order. ৳20 surcharge applies."
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-bg/40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg bg-saffron px-6 py-2.5 text-sm font-semibold text-bg transition-colors',
                      'hover:bg-saffron/90 disabled:opacity-60',
                    )}
                  >
                    {placing ? 'Placing order…' : 'Place order'}
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-1 lg:col-span-2">
          <OrderSummary paymentMethod={paymentMethod} />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need help? <Link to="/" className="text-saffron hover:underline">Contact support</Link>
      </p>
    </div>
  );
}
