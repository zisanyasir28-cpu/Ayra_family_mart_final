import { motion } from 'motion/react';
import { Leaf, Zap, MessageCircle, ShieldCheck, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── 5-pillar data ────────────────────────────────────────────────────────────
const PILLARS: Array<{
  icon:    LucideIcon;
  label:   string;
  bangla:  string;
  accent:  string;
  ring:    string;
}> = [
  {
    icon:   Leaf,
    label:  'Farm to Doorstep',
    bangla: 'খামার থেকে দরজায়',
    accent: 'bg-sage/15 text-sage',
    ring:   'ring-sage/25',
  },
  {
    icon:   Zap,
    label:  '60 Min Delivery',
    bangla: '৬০ মিনিটে ডেলিভারি',
    accent: 'bg-saffron/15 text-saffron',
    ring:   'ring-saffron/25',
  },
  {
    icon:   MessageCircle,
    label:  '24/7 Support',
    bangla: 'সার্বক্ষণিক সহায়তা',
    accent: 'bg-plum/15 text-plum',
    ring:   'ring-plum/25',
  },
  {
    icon:   ShieldCheck,
    label:  'Secure Payment',
    bangla: 'নিরাপদ পেমেন্ট',
    accent: 'bg-coral/15 text-coral',
    ring:   'ring-coral/25',
  },
  {
    icon:   Package,
    label:  'Eco Packaging',
    bangla: 'পরিবেশবান্ধব প্যাকেজিং',
    accent: 'bg-sage/15 text-sage',
    ring:   'ring-sage/25',
  },
];

// ─── WhyShopWithUs ────────────────────────────────────────────────────────────

export function WhyShopWithUs() {
  return (
    <section className="relative overflow-hidden bg-bg py-12 sm:py-16">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 -top-24 h-72 w-72 rounded-full bg-sage/8 blur-3xl" />
        <div className="absolute right-1/4 -bottom-16 h-64 w-64 rounded-full bg-saffron/8 blur-3xl" />
        <div className="absolute left-0 bottom-1/4 h-48 w-48 rounded-full bg-plum/8 blur-3xl" />
      </div>
      <div className="container relative">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-2xl font-black text-cream sm:text-3xl">
            Why Shop With{' '}
            <span className="text-saffron">Ayra?</span>
          </h2>
          <p className="mt-2 text-sm text-cream/50">
            Five promises we keep for every order, every time.
          </p>
        </motion.div>

        {/* 5-icon strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {PILLARS.map(({ icon: Icon, label, bangla, accent, ring }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: i * 0.07,
                type: 'spring',
                stiffness: 220,
                damping: 24,
              }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-line/50 bg-surface/50 px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-saffron/30 hover:bg-surface"
            >
              {/* Icon circle */}
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full ring-1 transition-transform duration-300 hover:scale-110 ${accent} ${ring}`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.7} />
              </span>

              {/* Labels */}
              <div>
                <p className="text-sm font-bold leading-tight text-cream">
                  {label}
                </p>
                <p className="mt-1 font-bangla text-[11px] text-cream/40">
                  {bangla}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
