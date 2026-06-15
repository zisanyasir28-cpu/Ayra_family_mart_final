import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
import {
  PaymentMethod,
  type AddressInput,
  FREE_DELIVERY_THRESHOLD_PAISA,
  DELIVERY_FEE_PAISA,
  COD_SURCHARGE_PAISA,
} from '@superstore/shared';

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
  const clearCart  = useCartStore((s) => s.clearCart);
  const removeItem = useCartStore((s) => s.removeItem);

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
    // Purge any stale demo/preview items whose productId is not a real UUID.
    // These sneak in when the backend had no campaigns and Flash Deals fell
    // back to hardcoded demo data — placing an order with them fails Zod
    // uuid validation on the server.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const badItems = items.filter((i) => !UUID_RE.test(i.productId));
    if (badItems.length > 0) {
      badItems.forEach((i) => removeItem(i.productId));
      toast.error(
        badItems.length === items.length
          ? 'Your cart had outdated items and was cleared. Please add fresh products.'
          : `${badItems.length} outdated item${badItems.length > 1 ? 's were' : ' was'} removed. Please review your cart.`,
      );
      return;
    }

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
    <div className="mx-auto max-w-6xl px-4 py-10 pb-32 md:pb-10">
      <h1 className="font-display text-2xl font-black text-cream sm:text-3xl">Checkout</h1>

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
                <header className="flex items-center gap-2 text-cream">
                  <Truck className="h-5 w-5 text-saffron" />
                  <h2 className="text-lg font-semibold">Delivery address</h2>
                </header>

                {loadingAddresses ? (
                  <div className="rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-6 text-center text-cream/55">
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
                    className="btn-grad btn-wm-check inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition-all active:scale-95 disabled:opacity-50"
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
                <header className="flex items-center gap-2 text-cream">
                  <ShoppingBag className="h-5 w-5 text-saffron" />
                  <h2 className="text-lg font-semibold">Review items</h2>
                </header>

                <ul className="space-y-3 rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-4">
                  {items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line/50 bg-bg">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-cream">{item.name}</p>
                        <p className="text-xs text-cream/55">
                          {item.quantity} × {formatPaisa(item.priceInPaisa)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-cream">
                        {formatPaisa(item.priceInPaisa * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl border border-line/50 bg-surface/60 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-cream">
                    <Tag className="h-4 w-4 text-saffron" />
                    Promo code
                  </div>

                  {coupon ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-saffron/40 bg-saffron/[0.06] px-3 py-2">
                      <span className="text-sm">
                        <span className="font-semibold text-saffron">{coupon.code}</span>
                        <span className="ml-2 text-cream/55">
                          -{formatPaisa(coupon.discountInPaisa)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-cream/55 hover:text-cream"
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
                        className="flex-1 rounded-full border border-line/50 bg-bg px-4 py-2 text-sm text-cream focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim() || couponLoading}
                        className="btn-grad btn-wm-tag rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
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
                    className="btn-outline-grad inline-flex items-center gap-2 rounded-full border border-line/50 px-5 py-2.5 text-sm font-medium transition active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-grad btn-wm-check inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition-all active:scale-95"
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
                <header className="flex items-center gap-2 text-cream">
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
                    className="btn-outline-grad inline-flex items-center gap-2 rounded-full border border-line/50 px-5 py-2.5 text-sm font-medium transition active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className={cn(
                      'btn-grad btn-wm-check inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition-all active:scale-95',
                      'disabled:opacity-60',
                    )}
                  >
                    {placing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg" />
                        Placing order…
                      </>
                    ) : 'Place order'}
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:col-span-1 md:block lg:col-span-2">
          <OrderSummary paymentMethod={paymentMethod} />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-cream/55">
        Need help? <Link to="/" className="text-saffron hover:underline">Contact support</Link>
      </p>

      {/* Mobile sticky total bar */}
      <div
        className="fixed inset-x-0 z-[42] border-t border-line bg-bg/95 backdrop-blur md:hidden"
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))', paddingBottom: '0.5rem' }}
      >
        <div className="container flex items-center justify-between py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-cream/55">
              {items.length} item{items.length !== 1 ? 's' : ''} · Total
            </p>
            <p className="font-display text-lg font-bold text-cream">
              {formatPaisa(
                subtotalInPaisa
                  - (coupon?.discountInPaisa ?? 0)
                  + (subtotalInPaisa - (coupon?.discountInPaisa ?? 0) >= FREE_DELIVERY_THRESHOLD_PAISA ? 0 : DELIVERY_FEE_PAISA)
                  + (paymentMethod === PaymentMethod.COD ? COD_SURCHARGE_PAISA : 0),
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-saffron">
            <span>Step {step}/3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
