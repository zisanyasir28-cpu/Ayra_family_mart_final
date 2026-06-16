import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, Clock, ChevronDown, LifeBuoy,
  Truck, CreditCard, RotateCcw, UserRound,
} from 'lucide-react';

// NOTE: update the contact details below with your real store phone/email.
const CONTACTS = [
  { icon: Phone, label: 'Call us', value: '+880 1XXX-XXXXXX' },
  { icon: Mail,  label: 'Email',   value: 'support@ayrafamilymart.com' },
  { icon: Clock, label: 'Hours',   value: 'Sat–Thu, 9am–9pm' },
];

const FAQ_SECTIONS = [
  {
    icon: Truck,
    title: 'Orders & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery reaches most of Bangladesh within 1–3 days. Inside Dhaka, express delivery can arrive in as little as 60 minutes on eligible items.' },
      { q: 'How much is delivery?', a: 'Delivery is free on orders of ৳1,500 or more. Below that, a flat ৳60 delivery charge applies. Cash on Delivery adds a small ৳20 handling fee.' },
      { q: 'Which areas do you deliver to?', a: 'We deliver across 64+ districts of Bangladesh. Enter your address at checkout to confirm coverage and timing.' },
      { q: 'How do I track my order?', a: 'Open your Orders page to see live status — from confirmed, to packed, to out for delivery.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments',
    items: [
      { q: 'What payment methods can I use?', a: 'Pay securely online via SSLCommerz (cards, mobile banking, net banking), or choose Cash on Delivery.' },
      { q: 'Is online payment safe?', a: 'Yes. Payments are processed through SSLCommerz over an encrypted connection — we never store your card details.' },
      { q: 'Do you have discount coupons?', a: 'Yes — apply a valid code at checkout. New customers can try WELCOME10 for 10% off their first order.' },
    ],
  },
  {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    items: [
      { q: 'Can I return an item?', a: 'Most items can be returned within 7 days if unused and in original packaging. See our full Returns & Refunds policy for details.' },
      { q: 'What if my item arrives damaged?', a: 'Contact us within 48 hours with a photo and your order number, and we will arrange a replacement or refund.' },
    ],
  },
  {
    icon: UserRound,
    title: 'Account',
    items: [
      { q: 'Do I need an account to order?', a: 'You can browse freely, but an account is required to place an order so you can track it and reorder easily.' },
      { q: 'I forgot my password.', a: 'Use “Forgot password” on the sign-in page to reset it by email.' },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line/60 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-cream">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-cream/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 pr-8 text-sm leading-relaxed text-cream/60">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="container py-10 md:py-14">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron/15 text-saffron">
          <LifeBuoy className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-black text-cream sm:text-4xl">Help Center</h1>
        <p className="mt-1 font-display text-lg italic text-saffron">সাহায্য কেন্দ্র</p>
        <p className="mt-3 text-cream/60">
          Answers to common questions about ordering, delivery, payment and returns. Still stuck? We’re a message away.
        </p>
      </div>

      {/* Contact cards */}
      <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
        {CONTACTS.map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum/15 text-saffron">
              <c.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-cream/45">{c.label}</p>
              <p className="truncate text-sm text-cream">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-10 max-w-3xl space-y-6">
        {FAQ_SECTIONS.map((sec) => (
          <section key={sec.title} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                <sec.icon className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-cream">{sec.title}</h2>
            </div>
            <div>
              {sec.items.map((it) => <FaqItem key={it.q} q={it.q} a={it.a} />)}
            </div>
          </section>
        ))}
      </div>

      {/* Returns CTA */}
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-surface-2 p-6 text-center">
        <p className="text-cream">Need to return something?</p>
        <Link to="/returns" className="btn-grad mt-3 inline-flex rounded-full px-6 py-2.5 text-sm font-bold">
          Read our Returns policy
        </Link>
      </div>
    </div>
  );
}
