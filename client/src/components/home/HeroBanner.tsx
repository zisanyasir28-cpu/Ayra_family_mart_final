import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'motion/react';
import { Play, ShieldCheck, Zap, RotateCcw, Leaf, BadgePercent } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Trust strip items ────────────────────────────────────────────────────────
const trustItems: Array<{ icon: LucideIcon; label: string; sublabel: string }> = [
  { icon: Leaf,        label: '100% Fresh',     sublabel: 'তাজা পণ্য'      },
  { icon: Zap,         label: 'Fast Delivery',  sublabel: 'দ্রুত ডেলিভারি' },
  { icon: ShieldCheck, label: 'Secure Payment', sublabel: 'নিরাপদ পেমেন্ট' },
  { icon: RotateCcw,   label: 'Easy Returns',   sublabel: 'সহজ রিটার্ন'    },
];

const AVATARS = ['🙂', '😊', '🥰', '😄'];

// ─── Bokeh floating particles — driven by Motion (WAAPI) so they animate
//     reliably across Chrome desktop, Android, and Claude preview. Pure
//     CSS @keyframes were being silently killed by `prefers-reduced-motion`
//     and Chrome's compositor on some desktops. Motion runs JS-driven
//     transforms that bypass those CSS rules entirely. ────────────────────
type Bokeh = {
  top?: string; left?: string; right?: string;
  size: number;
  hsl: string;          // e.g. '42, 92%, 60%'
  inner: number;        // inner-stop alpha
  outer: number;        // 42%-stop alpha
  x: [number, number, number];
  y: [number, number, number];
  s: [number, number, number]; // scale waypoints
  dur: number;
  delay: number;
};

const BOKEH: Bokeh[] = [
  { top: '14%', left:  '7%', size: 18, hsl: '42, 92%, 60%',  inner: 0.88, outer: 0.38, x: [0,  16,  26], y: [0, -28, -54], s: [0.4,  1,    0.3], dur:  8.2, delay: 0   },
  { top: '32%', left: '13%', size: 13, hsl: '158, 64%, 55%', inner: 0.85, outer: 0.35, x: [0, -18, -28], y: [0, -30, -56], s: [0.35, 0.95, 0.25], dur:  9.5, delay: 1.4 },
  { top:  '9%', left: '38%', size: 10, hsl: '50, 100%, 66%', inner: 0.90, outer: 0.40, x: [0,  10,   4], y: [0, -20, -58], s: [0.5,  1.05, 0.2],  dur:  7.1, delay: 2.6 },
  { top: '58%', left:  '4%', size: 20, hsl: '262, 84%, 68%', inner: 0.80, outer: 0.32, x: [0,  22,  36], y: [0, -32, -62], s: [0.3,  1.1,  0.2],  dur: 10.3, delay: 0.5 },
  { top: '22%', left: '55%', size: 14, hsl: '38, 92%, 54%',  inner: 0.86, outer: 0.36, x: [0,  -8, -14], y: [0, -25, -48], s: [0.45, 0.88, 0.3],  dur:  8.8, delay: 3.2 },
  { top: '44%', right:'10%', size: 11, hsl: '330, 70%, 68%', inner: 0.82, outer: 0.33, x: [0,  16,  26], y: [0, -28, -54], s: [0.4,  1,    0.3],  dur:  7.6, delay: 1.9 },
  { top: '68%', right:'24%', size: 22, hsl: '42, 92%, 60%',  inner: 0.75, outer: 0.28, x: [0,  10,   4], y: [0, -20, -58], s: [0.5,  1.05, 0.2],  dur: 11.0, delay: 0.3 },
  { top: '15%', right:'38%', size:  9, hsl: '158, 64%, 55%', inner: 0.88, outer: 0.38, x: [0,  22,  36], y: [0, -32, -62], s: [0.3,  1.1,  0.2],  dur:  6.9, delay: 4.1 },
  { top: '78%', left: '28%', size: 15, hsl: '50, 100%, 66%', inner: 0.83, outer: 0.33, x: [0, -18, -28], y: [0, -30, -56], s: [0.35, 0.95, 0.25], dur:  9.2, delay: 2.1 },
  { top: '50%', right:'42%', size:  8, hsl: '262, 84%, 68%', inner: 0.90, outer: 0.40, x: [0,  -8, -14], y: [0, -25, -48], s: [0.45, 0.88, 0.3],  dur:  7.8, delay: 3.7 },
  { top: '36%', right: '6%', size: 17, hsl: '38, 92%, 54%',  inner: 0.78, outer: 0.30, x: [0,  16,  26], y: [0, -28, -54], s: [0.4,  1,    0.3],  dur: 10.5, delay: 0.8 },
  { top:  '6%', left: '22%', size: 12, hsl: '330, 70%, 68%', inner: 0.84, outer: 0.34, x: [0,  10,   4], y: [0, -20, -58], s: [0.5,  1.05, 0.2],  dur:  8.4, delay: 1.1 },
];

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
    <section className="relative overflow-hidden  pt-8 pb-12 sm:pt-10 sm:pb-16 md:pb-20">

      {/* ── Ambient background glows ────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-20 h-[500px] w-[500px] rounded-full bg-saffron/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-plum/20 blur-[100px]" />
        {/* Sage "farm-fresh" green glow — left side, matches reference */}
        <div className="absolute -left-20 top-1/4 h-[520px] w-[520px] rounded-full bg-sage/10 blur-[140px]" />
      </div>

      {/* ── Dot-grid texture overlay ─────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--cream)/0.045) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* ── City skyline SVG watermark — bottom of hero ──────────────────────── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 w-full text-cream opacity-[0.07]"
        viewBox="0 0 1400 140"
        preserveAspectRatio="xMidYMax slice"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bridge arch */}
        <path d="M0 140 Q350 30 700 95 Q1050 30 1400 140 Z" opacity="0.4" />
        {/* Left building cluster */}
        <rect x="30"  y="80"  width="28" height="60" />
        <rect x="65"  y="55"  width="22" height="85" />
        <rect x="94"  y="70"  width="18" height="70" />
        <rect x="118" y="40"  width="30" height="100" />
        <rect x="155" y="65"  width="20" height="75" />
        <rect x="182" y="90"  width="25" height="50" />
        <rect x="214" y="75"  width="16" height="65" />
        <rect x="250" y="95"  width="18" height="45" />
        <rect x="275" y="82"  width="12" height="58" />
        <rect x="310" y="100" width="14" height="40" />
        {/* Right building cluster */}
        <rect x="1080" y="95"  width="18" height="45" />
        <rect x="1110" y="82"  width="14" height="58" />
        <rect x="1130" y="100" width="15" height="40" />
        <rect x="1155" y="72"  width="18" height="68" />
        <rect x="1180" y="60"  width="25" height="80" />
        <rect x="1212" y="40"  width="32" height="100" />
        <rect x="1251" y="70"  width="20" height="70" />
        <rect x="1278" y="85"  width="28" height="55" />
        <rect x="1313" y="55"  width="22" height="85" />
        <rect x="1342" y="75"  width="30" height="65" />
        <rect x="1378" y="90"  width="22" height="50" />
      </svg>

      {/* ── Gradient bokeh particles — driven by Motion (WAAPI, JS-backed) ────── */}
      {/* reducedMotion="never" forces these to animate even when the OS has    */}
      {/* prefers-reduced-motion set, since they're purely decorative and tiny. */}
      <MotionConfig reducedMotion="never">
        {BOKEH.map((p, i) => (
          <motion.div
            key={i}
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top:    p.top,
              left:   p.left,
              right:  p.right,
              width:  p.size,
              height: p.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, hsla(${p.hsl}, ${p.inner}) 0%, hsla(${p.hsl}, ${p.outer}) 42%, transparent 70%)`,
              filter: 'blur(1.8px)',
            }}
            initial={{ x: 0, y: 0, scale: p.s[0], opacity: 0 }}
            animate={{ x: p.x, y: p.y, scale: p.s, opacity: [0, 0.72, 0] }}
            transition={{
              duration: p.dur,
              delay:    p.delay,
              repeat:   Infinity,
              ease:     'easeInOut',
            }}
          />
        ))}
      </MotionConfig>

      {/* ── Light-mode butterflies — visible only when :root.light is active ─── */}
      {/* opacity-0 by default; globals.css :root.light .butterfly sets opacity-85 */}
      <motion.div
        aria-hidden
        className="butterfly pointer-events-none absolute"
        style={{ top: '12%', right: '16%' }}
        animate={{ y: [0, -10, 2, -8, 0], rotate: [0, 4, -3, 2, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="7"  cy="7"  rx="6.5" ry="5.5" fill="hsl(48,96%,55%)"  fillOpacity="0.88" transform="rotate(-20  7  7)"  />
          <ellipse cx="21" cy="7"  rx="6.5" ry="5.5" fill="hsl(48,96%,55%)"  fillOpacity="0.88" transform="rotate( 20 21  7)"  />
          <ellipse cx="7"  cy="15" rx="5"   ry="4"   fill="hsl(42,92%,50%)"  fillOpacity="0.75" transform="rotate( 15  7 15)"  />
          <ellipse cx="21" cy="15" rx="5"   ry="4"   fill="hsl(42,92%,50%)"  fillOpacity="0.75" transform="rotate(-15 21 15)"  />
          <path d="M13 3 Q14 11 13 19" stroke="hsl(35,50%,30%)" strokeWidth="1.2" fill="none" />
          <path d="M14 3 Q14 11 15 19" stroke="hsl(35,50%,30%)" strokeWidth="1.2" fill="none" />
          <path d="M12 3 Q10 1 8 2" stroke="hsl(35,50%,30%)" strokeWidth="0.9" fill="none" />
          <path d="M16 3 Q18 1 20 2" stroke="hsl(35,50%,30%)" strokeWidth="0.9" fill="none" />
        </svg>
      </motion.div>

      <motion.div
        aria-hidden
        className="butterfly pointer-events-none absolute"
        style={{ top: '38%', right: '8%' }}
        animate={{ y: [0, -8, 4, -6, 0], rotate: [0, -3, 5, -2, 0] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
      >
        <svg width="22" height="18" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="7"  cy="7"  rx="6.5" ry="5.5" fill="hsl(50,100%,60%)" fillOpacity="0.85" transform="rotate(-20  7  7)"  />
          <ellipse cx="21" cy="7"  rx="6.5" ry="5.5" fill="hsl(50,100%,60%)" fillOpacity="0.85" transform="rotate( 20 21  7)"  />
          <ellipse cx="7"  cy="15" rx="5"   ry="4"   fill="hsl(44,90%,52%)"  fillOpacity="0.72" transform="rotate( 15  7 15)"  />
          <ellipse cx="21" cy="15" rx="5"   ry="4"   fill="hsl(44,90%,52%)"  fillOpacity="0.72" transform="rotate(-15 21 15)"  />
          <path d="M13 3 Q14 11 13 19" stroke="hsl(35,50%,30%)" strokeWidth="1.2" fill="none" />
          <path d="M14 3 Q14 11 15 19" stroke="hsl(35,50%,30%)" strokeWidth="1.2" fill="none" />
          <path d="M12 3 Q10 1 8 2"  stroke="hsl(35,50%,30%)" strokeWidth="0.9" fill="none" />
          <path d="M16 3 Q18 1 20 2" stroke="hsl(35,50%,30%)" strokeWidth="0.9" fill="none" />
        </svg>
      </motion.div>

      <motion.div
        aria-hidden
        className="butterfly pointer-events-none absolute"
        style={{ top: '22%', right: '34%' }}
        animate={{ y: [0, -12, 3, -9, 0], rotate: [0, 6, -4, 3, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2.8 }}
      >
        <svg width="18" height="14" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="7"  cy="7"  rx="6.5" ry="5.5" fill="hsl(45,95%,58%)"  fillOpacity="0.90" transform="rotate(-20  7  7)"  />
          <ellipse cx="21" cy="7"  rx="6.5" ry="5.5" fill="hsl(45,95%,58%)"  fillOpacity="0.90" transform="rotate( 20 21  7)"  />
          <ellipse cx="7"  cy="15" rx="5"   ry="4"   fill="hsl(40,92%,48%)"  fillOpacity="0.78" transform="rotate( 15  7 15)"  />
          <ellipse cx="21" cy="15" rx="5"   ry="4"   fill="hsl(40,92%,48%)"  fillOpacity="0.78" transform="rotate(-15 21 15)"  />
          <path d="M13 3 Q14 11 13 19" stroke="hsl(35,50%,30%)" strokeWidth="1.2" fill="none" />
          <path d="M14 3 Q14 11 15 19" stroke="hsl(35,50%,30%)" strokeWidth="1.2" fill="none" />
          <path d="M12 3 Q10 1 8 2"  stroke="hsl(35,50%,30%)" strokeWidth="0.9" fill="none" />
          <path d="M16 3 Q18 1 20 2" stroke="hsl(35,50%,30%)" strokeWidth="0.9" fill="none" />
        </svg>
      </motion.div>

      {/* ── Botanical leaf-cluster SVG watermark — upper-right ───────────────── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute right-6 top-4 h-36 w-36 -rotate-12 text-sage opacity-[0.07]"
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M60 105 C60 105 18 72 23 34 C28 8 60 4 60 4 C60 4 92 8 97 34 C102 72 60 105 60 105Z" />
        <path d="M60 105 C60 105 8 82 16 44 C23 16 54 14 60 4 C66 14 97 16 104 44 C112 82 60 105 60 105Z" opacity="0.45" />
        <line x1="60" y1="105" x2="60" y2="6" strokeDasharray="3 5" />
        <path d="M60 42 Q76 32 87 38" />
        <path d="M60 54 Q44 44 33 50" />
        <path d="M60 66 Q79 56 90 62" />
        <path d="M60 78 Q41 68 30 74" />
      </svg>

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
              {/* Shop Now — pink → orange gradient pill with double-glow */}
              <Link
                to="/products"
                className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-saffron via-saffron to-blush px-7 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-bg shadow-[0_8px_28px_-8px_hsl(var(--saffron)/0.6),0_2px_8px_-2px_hsl(var(--blush)/0.4)] transition-all hover:shadow-[0_12px_36px_-6px_hsl(var(--saffron)/0.8),0_4px_14px_-2px_hsl(var(--blush)/0.5)] active:scale-95"
              >
                Shop Now
                <ArrowIcon
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              {/* Explore Deals — glass pill with gradient ring border */}
              <Link
                to="/products?onSale=true"
                className="group relative inline-flex rounded-full bg-gradient-to-r from-saffron/70 via-plum/40 to-blush/70 p-[1.5px] shadow-[0_4px_18px_-4px_hsl(var(--saffron)/0.3)] transition-all hover:shadow-[0_6px_22px_-2px_hsl(var(--saffron)/0.55)] active:scale-95"
              >
                <span className="inline-flex items-center gap-2.5 rounded-full bg-bg/40 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-cream/85 backdrop-blur-md transition-colors group-hover:bg-bg/20 group-hover:text-cream">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Explore Deals
                </span>
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
                  className="flex items-center gap-2.5 rounded-sm border border-line/100 bg-surface/2 px-3 py-2.5 backdrop-blur-ms"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full backdrop-blur-xxl bg-saffron7 din dey na korun 5 s text-saffron">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold   leading-tight text-cream">
                      {label}
                    </p>
                    <p className="font-bangla text-[10px] text-cream/45">{sublabel}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Illustration + floating cards ─────────────────────── */}
          <div className="relative mx-auto flex w-full max-w-[460px] flex-1 items-center justify-center lg:mx-0 lg:max-w-none">

            {/* Neon ring wrapper — circular container */}
            <div className="relative flex h-[320px] w-[320px] items-center justify-center sm:h-[420px] sm:w-[420px]">

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

              {/* Illustration inside ring — circular photo */}
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
                className="relative z-10 h-[252px] w-[252px] overflow-hidden rounded-full border border-saffron/20 bg-surface shadow-[0_0_60px_-20px_hsl(var(--saffron)/0.5)] sm:h-[336px] sm:w-[336px]"
              >
                <img
                  src="https://images.unsplash.com/photo-1543168256-418811576931?w=672&h=672&fit=crop&crop=center&q=85"
                  alt="Fresh groceries & daily essentials"
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                {/* Vignette — blends edge with dark bg */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent"
                />
              </motion.div>
            </div>

            {/* Floating offer card — magical neon-glass medallion (top-right) */}
            <motion.div
              initial={{ opacity: 0, x: 16, y: -12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -3 }}
              className="absolute -right-3 top-2 z-20 sm:-right-2 sm:top-6"
            >
              {/* Coral neon ring border */}
              <div
                className="group rounded-sm bg-gradient-to-br from-coral/60 via-saffron/40 to-coral/20 p-[1.5px] transition-all duration-300 hover:from-coral/75 hover:via-saffron/60 hover:to-coral/35"
                style={{
                  boxShadow:
                    '0 0 7px -8px hsl(var(--coral)/0.55), 0 0 8px -10px hsl(var(--coral)/0.4), 0 10px 28px -14px hsl(var(--coral)/0.5)',
                }}
              >
                {/* Inner glass surface — always dark in both themes */}
                <div className="relative min-w-[145px] overflow-hidden rounded-[calc(0.5rem-1.2px)] bg-surface-dark/90 p-3.5 backdrop-blur-xl">
                  {/* Inner coral wash for warmth */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-coral/15 via-transparent to-saffron/8"
                  />
                  {/* Decorative BadgePercent watermark — bottom-right corner */}
                  <BadgePercent
                    aria-hidden
                    className="pointer-events-none absolute -bottom-2 -right-2 h-14 w-14 text-coral/15"
                    strokeWidth={1.5}
                  />
                  {/* Sparkle accent — top-right, theme-aware */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute right-2.5 top-2.5 h-1 w-1 rounded-full"
                    style={{
                      background: 'hsl(var(--shine-color) / 0.65)',
                      boxShadow:  '0 0 8px 2px hsl(var(--shine-color) / 0.5)',
                    }}
                  />
                  {/* Glass shine arc — top-left */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(0_0%_100%/0.12)_0%,transparent_45%)]"
                  />

                  {/* "SPECIAL OFFER" — eyebrow label */}
                  <p className="relative text-[9px] font-bold uppercase tracking-[0.2em] text-coral [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
                    Special Offer
                  </p>

                  {/* "40% OFF" — gradient on "40%", solid on "OFF" */}
                  <p className="relative font-display text-2xl font-black leading-none sm:text-[1.7rem]">
                    <span
                      style={{
                        background: 'linear-gradient(to right, hsl(var(--saffron)), hsl(var(--blush)))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      40%
                    </span>
                    <span className="ml-1 text-dark-fg [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                      OFF
                    </span>
                  </p>

                  {/* "This Week Only" — readable supporting line */}
                  <p className="relative mt-1 text-[10.5px] font-semibold text-dark-fg/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.75)]">
                    This Week Only
                  </p>

                  {/* Shop Now — saffron→blush neon pill */}
                  <Link
                    to="/products?onSale=true"
                    className="relative mt-3 inline-flex items-center gap-1.5 rounded-sm bg-gradient-to-r from-saffron to-blush px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bg shadow-[0_0_14px_-2px_hsl(var(--saffron)/0.7)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_20px_-2px_hsl(var(--saffron)/0.95)]"
                  >
                    Shop Now
                    <ArrowIcon size={10} />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Floating saver pill — bottom-left */}
            <motion.div
              initial={{ opacity: 0, x: -16, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="absolute -left-3 bottom-6 z-20 flex items-center gap-2.5 rounded-full border border-sage/45 bg-surface/50 px-4 py-2 shadow-[0_8px_10px_-15px_hsl(var(--sage)/0.25)] backdrop-blur-xl sm:left-0"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20 shadow-lg text-base select-none">
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
