import { motion } from 'motion/react';
import { Truck, Clock, RefreshCw, ShieldCheck, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── 5-pillar data ────────────────────────────────────────────────────────────
const PILLARS: Array<{
  Icon:   LucideIcon;
  label:  string;
  desc:   string;
  accent: string;
}> = [
  {
    Icon:   Truck,
    label:  'Farm to Doorstep',
    desc:   'From our farms to your home',
    accent: 'bg-sage/15 text-sage',
  },
  {
    Icon:   Clock,
    label:  '60 Min Delivery',
    desc:   'Super fast delivery in 60 minutes',
    accent: 'bg-saffron/15 text-saffron',
  },
  {
    Icon:   RefreshCw,
    label:  '24/7 Support',
    desc:   'We’re here anytime',
    accent: 'bg-plum/15 text-plum',
  },
  {
    Icon:   ShieldCheck,
    label:  'Secure Payment',
    desc:   '100% secure transactions',
    accent: 'bg-coral/15 text-coral',
  },
  {
    Icon:   Leaf,
    label:  'Eco Friendly',
    desc:   'Sustainable packing for a better tomorrow',
    accent: 'bg-sage/15 text-sage',
  },
];

// ─── WhyShopWithUs ────────────────────────────────────────────────────────────

export function WhyShopWithUs() {
  return (
    <section className="relative overflow-hidden border-y border-line/40 bg-surface/40 py-5 backdrop-blur-sm sm:py-6">

      {/* Ambient glow underlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/2 h-40 w-80 -translate-y-1/2 rounded-full bg-saffron/6 blur-3xl" />
        <div className="absolute -right-24 top-1/2 h-40 w-80 -translate-y-1/2 rounded-full bg-plum/6 blur-3xl" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6"
        >
          {PILLARS.map(({ Icon, label, desc, accent }) => (
            <div key={label} className="flex items-center gap-3">
              {/* Icon circle */}
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>

              {/* Text block */}
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight text-cream">{label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-cream/55">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
