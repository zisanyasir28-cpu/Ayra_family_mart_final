import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, ShieldCheck, Zap, RotateCcw, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Trust strip items ────────────────────────────────────────────────────────
const trustItems: Array<{ icon: LucideIcon; label: string; sublabel: string }> = [
  { icon: Leaf,        label: '100% Fresh',     sublabel: 'তাজা পণ্য'      },
  { icon: Zap,         label: 'Fast Delivery',  sublabel: 'দ্রুত ডেলিভারি' },
  { icon: ShieldCheck, label: 'Secure Payment', sublabel: 'নিরাপদ পেমেন্ট' },
  { icon: RotateCcw,   label: 'Easy Returns',   sublabel: 'সহজ রিটার্ন'    },
];

const AVATARS = ['🙂', '😊', '🥰', '😄'];

// ─── Small arrow SVG ──────────────────────────────────────────────────────────
function ArrowIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// ─── HeroBanner ──────────────────────────────────────────────────────────────

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-bg pt-8 pb-12 sm:pt-10 sm:pb-16 md:pb-20">

      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-saffron/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-plum/20 blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

          {/* ── Left: Content ────────────────────────────────────────────── */}
          <div className="flex-1 lg:max-w-[54%]">

            {/* Social-proof badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-saffron/25 bg-saffron/10 px-4 py-2"
            >
              <div className="flex -space-x-2">
                {AVATARS.map((emoji, i) => (
                  <span
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-surface text-sm"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <span className="text-xs font-semibold text-cream/80">
                Trusted by{' '}
                <span className="font-bold text-saffron">50K+</span>{' '}
                Happy Families ❤️
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black leading-[1.05] tracking-tight text-cream"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)' }}
            >
              Fresh Choices,
              <br />
              Better Life{' '}
              <span
                className="font-script text-saffron"
                style={{ fontSize: 'clamp(2.7rem, 6.2vw, 5rem)' }}
              >
                Everyday!
              </span>
            </motion.h1>

            {/* Bangla accent */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-3 font-bangla text-sm text-cream/50"
            >
              তাজা পণ্য, সুস্থ পরিবার, সুন্দর জীবন ❤️
            </motion.p>

            {/* Sub-heading */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.28 }}
              className="mt-4 max-w-lg text-base leading-relaxed text-cream/65 sm:text-lg"
            >
              Farm fresh produce, authentic groceries &amp; daily essentials —
              delivered to your door.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.38 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-2.5 rounded-full bg-saffron px-7 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-bg transition-all hover:bg-saffron/90 hover:shadow-[0_0_32px_-6px_hsl(var(--saffron)/0.7)] active:scale-95"
              >
                Shop Now
                <ArrowIcon
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/products?onSale=true"
                className="group inline-flex items-center gap-2.5 rounded-full border border-line px-7 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-cream/80 transition-all hover:border-saffron/50 hover:text-cream active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Explore Deals
              </Link>
            </motion.div>

            {/* Inline trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.52 }}
              className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4"
            >
              {trustItems.map(({ icon: Icon, label, sublabel }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-line/50 bg-surface/40 px-3 py-2.5 backdrop-blur-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold leading-tight text-cream">
                      {label}
                    </p>
                    <p className="font-bangla text-[10px] text-cream/45">{sublabel}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Illustration + floating cards ─────────────────────── */}
          <div className="relative mx-auto flex w-full max-w-[420px] flex-1 items-center justify-center lg:mx-0 lg:max-w-none">

            {/* Neon ring wrapper — circular container */}
            <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[360px] sm:w-[360px]">

              {/* Outer ambient glow */}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-saffron/10 blur-[80px]" />

              {/* SVG neon ring — stroke colors via CSS vars so they flip per theme */}
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 400 400"
                fill="none"
              >
                <defs>
                  <filter id="neon-glow-ring">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Outer faint ring */}
                <circle cx="200" cy="200" r="188" stroke="hsl(var(--saffron) / 0.2)" strokeWidth="2" filter="url(#neon-glow-ring)" />
                {/* Main bright ring */}
                <circle cx="200" cy="200" r="176" stroke="hsl(var(--saffron) / 0.9)" strokeWidth="2.5" filter="url(#neon-glow-ring)" />
                {/* Inner purple accent ring */}
                <circle cx="200" cy="200" r="164" stroke="hsl(var(--plum) / 0.3)" strokeWidth="1.5" />
                {/* Gold accent ring — warm in light mode (sunrise feel), subtle in dark */}
                <circle cx="200" cy="200" r="158" stroke="hsl(var(--coral) / 0.4)" strokeWidth="1.2" />
              </svg>

              {/* Illustration inside ring — circular */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.18,
                  type: 'spring',
                  stiffness: 120,
                  damping: 18,
                }}
                className="relative z-10 flex h-[230px] w-[230px] flex-col items-center justify-center rounded-full border border-line/40 bg-gradient-to-br from-surface via-surface-2/60 to-surface shadow-[0_0_60px_-20px_hsl(var(--saffron)/0.4)] sm:h-[280px] sm:w-[280px]"
              >
                <div className="text-center select-none">
                  <div className="text-[70px] leading-none sm:text-[88px]">🛍️</div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[1.8rem] sm:text-[2.2rem]">
                    <span>🥑</span>
                    <span>🍎</span>
                    <span>🥦</span>
                  </div>
                  <p className="mt-2 font-display text-[9px] font-bold uppercase tracking-[0.18em] text-cream/35">
                    Farm Fresh · Daily Essentials
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Floating offer card — top-right */}
            <motion.div
              initial={{ opacity: 0, x: 16, y: -12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="invert-card absolute -right-3 top-2 z-20 min-w-[130px] rounded-2xl border border-coral/30 bg-surface/90 p-3.5 shadow-[0_8px_32px_-8px_hsl(var(--coral)/0.3)] backdrop-blur-xl sm:-right-2 sm:top-6"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-coral/70">
                Special Offer
              </p>
              <p className="font-display text-xl font-black text-coral sm:text-2xl">
                40% OFF
              </p>
              <p className="text-[10px] text-cream/50">This Week Only</p>
              <Link
                to="/products?onSale=true"
                className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-saffron transition hover:text-cream"
              >
                Shop Now{' '}
                <ArrowIcon size={9} />
              </Link>
            </motion.div>

            {/* Floating saver pill — bottom-left */}
            <motion.div
              initial={{ opacity: 0, x: -16, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="absolute -left-3 bottom-6 z-20 flex items-center gap-2.5 rounded-full border border-sage/30 bg-surface/90 px-4 py-2 shadow-[0_8px_24px_-6px_hsl(var(--sage)/0.25)] backdrop-blur-xl sm:left-0"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20 text-base select-none">
                🎉
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sage">
                  Super Saver Pack
                </p>
                <p className="text-xs font-black text-cream">
                  Save <span className="text-coral">৳350</span>
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
