import { Link } from 'react-router-dom';
import {
  RotateCcw, CheckCircle2, XCircle, Clock, PackageCheck, Wallet, MessageCircleQuestion,
} from 'lucide-react';

const STEPS = [
  { n: 1, title: 'Request within 7 days', text: 'Contact us within 7 days of delivery with your order number and the reason for return.' },
  { n: 2, title: 'We review & approve',   text: 'Our team confirms eligibility and shares return instructions, usually within 1–2 days.' },
  { n: 3, title: 'Send the item back',    text: 'Return the item unused, in its original packaging. For damaged or wrong items, we arrange pickup.' },
  { n: 4, title: 'Get your refund',       text: 'Once received and checked, your refund is issued to the original payment method (store credit for COD).' },
];

const RETURNABLE = [
  'Unused items in original, sealed packaging',
  'Wrong item delivered',
  'Damaged or defective on arrival',
  'Significantly different from the product description',
];

const NON_RETURNABLE = [
  'Fresh produce, dairy, meat, fish & other perishables',
  'Opened or used personal-care & beauty items',
  'Items without original packaging or tags',
  'Requests made after 7 days of delivery',
];

const REFUND_FACTS = [
  { icon: Clock,        title: '7-day window',     text: 'Request within 7 days of delivery.' },
  { icon: Wallet,       title: 'Refund timeline',  text: 'Processed within 5–7 business days of approval.' },
  { icon: PackageCheck, title: 'Original condition', text: 'Items must be unused and in original packaging.' },
];

export default function ReturnsPage() {
  return (
    <div className="container py-10 md:py-14">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron/15 text-saffron">
          <RotateCcw className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-black text-cream sm:text-4xl">Returns &amp; Refunds</h1>
        <p className="mt-1 font-display text-lg italic text-saffron">ফেরত ও রিফান্ড</p>
        <p className="mt-3 text-cream/60">
          We want you to love what you buy. If something isn’t right, here’s how returns and refunds work at Ayra Family Mart.
        </p>
      </div>

      {/* How it works */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border border-line bg-surface p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron font-display font-black text-bg">{s.n}</span>
            <h3 className="mt-3 font-display font-bold text-cream">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-cream/60">{s.text}</p>
          </div>
        ))}
      </div>

      {/* Eligibility */}
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-sage" />
            <h2 className="font-display text-lg font-bold text-cream">Eligible for return</h2>
          </div>
          <ul className="space-y-2">
            {RETURNABLE.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-cream/70">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> {r}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-coral" />
            <h2 className="font-display text-lg font-bold text-cream">Not returnable</h2>
          </div>
          <ul className="space-y-2">
            {NON_RETURNABLE.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-cream/70">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral" /> {r}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Refund facts */}
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
        {REFUND_FACTS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line bg-surface-2 p-5 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-saffron/15 text-saffron">
              <c.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-2 font-display font-bold text-cream">{c.title}</h3>
            <p className="mt-1 text-xs text-cream/60">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-line bg-surface p-6 text-center">
        <MessageCircleQuestion className="mx-auto h-6 w-6 text-saffron" />
        <p className="mt-2 text-cream">Have a question about a return?</p>
        <p className="text-sm text-cream/55">Reach our support team and we’ll help you out.</p>
        <Link to="/help" className="btn-grad mt-4 inline-flex rounded-full px-6 py-2.5 text-sm font-bold">
          Visit the Help Center
        </Link>
      </div>
    </div>
  );
}
