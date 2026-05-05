import { motion } from 'framer-motion';

// ─── Feature data ─────────────────────────────────────────────────────────────

const features = [
  {
    emoji:       '🚚',
    title:       'Express Delivery',
    description: 'Same-day delivery in Dhaka. Next-day for all other cities. Track your order live.',
    gradient:    'from-blue-500 to-cyan-500',
    bg:          'bg-blue-50',
    border:      'border-blue-100',
    badge:       'bg-blue-100 text-blue-700',
    glow:        'group-hover:shadow-[0_8px_30px_-6px_rgba(59,130,246,0.35)]',
  },
  {
    emoji:       '🌿',
    title:       'Farm-Fresh Quality',
    description: 'Sourced directly from farms. Freshness guaranteed or your money back — no questions.',
    gradient:    'from-green-500 to-emerald-500',
    bg:          'bg-green-50',
    border:      'border-green-100',
    badge:       'bg-green-100 text-green-700',
    glow:        'group-hover:shadow-[0_8px_30px_-6px_rgba(34,197,94,0.35)]',
  },
  {
    emoji:       '↩️',
    title:       '7-Day Easy Returns',
    description: 'Not 100% satisfied? Return within 7 days for a full refund — hassle-free.',
    gradient:    'from-orange-500 to-amber-500',
    bg:          'bg-orange-50',
    border:      'border-orange-100',
    badge:       'bg-orange-100 text-orange-700',
    glow:        'group-hover:shadow-[0_8px_30px_-6px_rgba(249,115,22,0.35)]',
  },
  {
    emoji:       '🔒',
    title:       '100% Secure Payment',
    description: 'SSL-encrypted checkout with bKash, cards & COD. Your data is safe, always.',
    gradient:    'from-purple-500 to-violet-500',
    bg:          'bg-purple-50',
    border:      'border-purple-100',
    badge:       'bg-purple-100 text-purple-700',
    glow:        'group-hover:shadow-[0_8px_30px_-6px_rgba(168,85,247,0.35)]',
  },
] as const;

// ─── Feature card ─────────────────────────────────────────────────────────────

interface FeatureCardProps {
  feature: (typeof features)[number];
  index:   number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 180, damping: 22 }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${feature.bg} ${feature.border} ${feature.glow}`}
    >
      {/* Icon */}
      <div
        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-sm ${feature.gradient}`}
      >
        <span className="leading-none">{feature.emoji}</span>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </div>

      {/* Decorative circle */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 ${feature.gradient}`}
      />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WhyShopWithUs() {
  return (
    <section className="py-12">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <p className="section-label mx-auto bg-green-100 text-green-700">Our Promise</p>
          <h2 className="section-title mt-2">Why Shop With Ayra?</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            We're committed to making your grocery shopping simple, affordable, and delightful.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border bg-card px-8 py-5"
        >
          {[
            { value: '50,000+',   label: 'Products'         },
            { value: '1 Lakh+',   label: 'Happy Customers'  },
            { value: '4.8/5',     label: 'Average Rating'   },
            { value: '60-Min',    label: 'Express Delivery' },
            { value: '64+',       label: 'Districts'        },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-5">
              {i > 0 && <div className="hidden h-6 w-px bg-border sm:block" />}
              <div className="text-center">
                <div className="text-xl font-extrabold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
