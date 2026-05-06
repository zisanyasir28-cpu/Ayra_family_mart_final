import { motion } from 'framer-motion';
import { TruckIcon, LeafIcon, ReturnIcon, ShieldIcon } from '../common/HandIcon';

const PILLARS = [
  {
    n:    '01',
    title: 'Same-day, every day',
    desc:  'Order before 6pm — get it before dinner. Track every step from kitchen to your door.',
    Icon:  TruckIcon,
    accent: 'saffron' as const,
  },
  {
    n:    '02',
    title: 'Fresh or refunded',
    desc:  'Sourced direct from farms. If anything arrives less than perfect, we replace it instantly.',
    Icon:  LeafIcon,
    accent: 'sage' as const,
  },
  {
    n:    '03',
    title: 'Returns in seven',
    desc:  'Not happy? Return within seven days for a full refund — a rider picks it up.',
    Icon:  ReturnIcon,
    accent: 'coral' as const,
  },
  {
    n:    '04',
    title: 'Encrypted checkout',
    desc:  'bKash, Nagad, cards, COD. Your data stays in Bangladesh, locked behind SSL.',
    Icon:  ShieldIcon,
    accent: 'blush' as const,
  },
] as const;

const ACCENT_BG: Record<typeof PILLARS[number]['accent'], string> = {
  saffron: 'bg-saffron text-bg',
  sage:    'bg-sage text-bg',
  coral:   'bg-coral text-bg',
  blush:   'bg-blush text-bg',
};

export function WhyShopWithUs() {
  return (
    <section className="bg-bg py-20 sm:py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-3xl"
        >
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            <span>Why us</span>
          </div>
          <h2 className="display-lg mt-4 text-cream">
            Four small things we'll <em className="text-saffron">never</em> compromise on.
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.article
              key={p.n}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-saffron/30"
            >
              {/* Number watermark */}
              <span className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[8rem] font-black leading-none text-cream/[0.04] transition-all duration-500 group-hover:text-cream/[0.08]">
                {p.n}
              </span>

              {/* Icon */}
              <div
                className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg] ${ACCENT_BG[p.accent]}`}
              >
                <p.Icon size={22} strokeWidth={1.6} />
              </div>

              {/* Text */}
              <h3 className="relative mt-6 font-display text-xl font-bold leading-tight text-cream sm:text-2xl">
                {p.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-cream/65">
                {p.desc}
              </p>

              {/* Bottom edge underline */}
              <span className="absolute inset-x-7 bottom-5 h-px scale-x-0 bg-gradient-to-r from-transparent via-saffron to-transparent transition-transform duration-500 group-hover:scale-x-100" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
