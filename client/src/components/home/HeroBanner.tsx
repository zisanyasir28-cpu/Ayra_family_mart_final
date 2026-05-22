import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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

// ─── Leaf gradient stop definitions ─────────────────────────────────────────
type GradStop = { offset: string; color: string; opacity: number };
const LEAF_GRADS: Record<1 | 2 | 3, GradStop[]> = {
  1: [
    { offset: '0%',   color: 'hsl(50,100%,68%)', opacity: 0.92 },
    { offset: '48%',  color: 'hsl(38,92%,52%)',  opacity: 0.82 },
    { offset: '100%', color: 'hsl(25,95%,54%)',  opacity: 0.72 },
  ],
  2: [
    { offset: '0%',   color: 'hsl(54,100%,64%)', opacity: 0.88 },
    { offset: '100%', color: 'hsl(330,81%,62%)', opacity: 0.68 },
  ],
  3: [
    { offset: '0%',   color: 'hsl(42,92%,54%)',  opacity: 0.88 },
    { offset: '100%', color: 'hsl(158,64%,54%)', opacity: 0.62 },
  ],
};

// ─── HeroBanner ──────────────────────────────────────────────────────────────

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-bg pt-8 pb-12 sm:pt-10 sm:pb-16 md:pb-20">

      {/* ══════════════════════════════════════════════════════════════════════
          MAGICAL BG — Urban Garden Neon
          Layers: ambient orbs → dot-grid → neon city+vines+monstera (SVG)
                  → golden drifting leaves → 4-pt star sparkles
          All animations use transform+opacity only (GPU compositor)
          ══════════════════════════════════════════════════════════════════════ */}

      {/* Ambient glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-20 h-[500px] w-[500px] rounded-full bg-saffron/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-plum/20 blur-[100px]" />
        <div className="absolute -left-20 top-1/4 h-[520px] w-[520px] rounded-full bg-sage/10 blur-[140px]" />
        <div className="absolute right-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-coral/8 blur-[90px]" />
      </div>

      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--cream)/0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── NEON CITY + VINES + MONSTERA (single static SVG) ──────────────── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1400 480"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Left buildings — sage neon → plum fade */}
          <linearGradient id="hb-bL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(158,64%,58%)" stopOpacity="0.95" />
            <stop offset="62%"  stopColor="hsl(262,84%,58%)" stopOpacity="0.4"  />
            <stop offset="100%" stopColor="hsl(262,84%,58%)" stopOpacity="0"    />
          </linearGradient>
          {/* Right buildings — amber → saffron fade */}
          <linearGradient id="hb-bR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(45,100%,65%)"  stopOpacity="0.98" />
            <stop offset="55%"  stopColor="hsl(330,81%,60%)"  stopOpacity="0.42" />
            <stop offset="100%" stopColor="hsl(330,81%,60%)"  stopOpacity="0"    />
          </linearGradient>
          {/* Bridge — plum→sage→coral sweep */}
          <linearGradient id="hb-bridge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="hsl(262,84%,58%)" stopOpacity="0.28" />
            <stop offset="36%"  stopColor="hsl(158,64%,52%)" stopOpacity="0.62" />
            <stop offset="64%"  stopColor="hsl(158,64%,52%)" stopOpacity="0.62" />
            <stop offset="100%" stopColor="hsl(38,92%,52%)"  stopOpacity="0.28" />
          </linearGradient>
          {/* Vine — deep sage root → bright sage tip */}
          <linearGradient id="hb-vine" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="hsl(158,64%,36%)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="hsl(158,64%,58%)" stopOpacity="0.1"  />
          </linearGradient>
          {/* Monstera fill */}
          <linearGradient id="hb-mon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="hsl(158,64%,30%)" stopOpacity="0.7"  />
            <stop offset="100%" stopColor="hsl(158,64%,58%)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Bridge arch */}
        <path d="M-100 480 Q350 185 700 315 Q1050 185 1500 480 Z" fill="url(#hb-bridge)" />

        {/* ── Left neon buildings */}
        <rect x="14"  y="255" width="40"  height="225" fill="url(#hb-bL)" />
        <rect x="61"  y="205" width="30"  height="275" fill="url(#hb-bL)" />
        <rect x="98"  y="232" width="24"  height="248" fill="url(#hb-bL)" />
        <rect x="129" y="180" width="42"  height="300" fill="url(#hb-bL)" />
        <rect x="178" y="225" width="26"  height="255" fill="url(#hb-bL)" />
        <rect x="211" y="262" width="32"  height="218" fill="url(#hb-bL)" />
        <rect x="250" y="245" width="22"  height="235" fill="url(#hb-bL)" />
        <rect x="280" y="282" width="18"  height="198" fill="url(#hb-bL)" />
        <rect x="306" y="302" width="20"  height="178" fill="url(#hb-bL)" />
        {/* Glowing sage windows — left */}
        {([
          [21,263],[21,281],[21,299],[32,263],[32,281],[32,299],
          [67,213],[67,231],[67,249],[76,213],[76,231],
          [135,188],[135,206],[135,224],[135,242],[144,188],[144,206],[144,224],[153,188],
          [184,233],[184,251],[192,233],
          [217,270],[217,288],[225,270],
        ] as [number,number][]).map(([x, y], i) => (
          <rect key={`wl${i}`} x={x} y={y} width="5" height="5" fill="hsl(158,64%,72%)" opacity="0.75" rx="0.5" />
        ))}

        {/* ── Right neon buildings */}
        <rect x="1095" y="285" width="24" height="195" fill="url(#hb-bR)" />
        <rect x="1126" y="244" width="20" height="236" fill="url(#hb-bR)" />
        <rect x="1153" y="206" width="32" height="274" fill="url(#hb-bR)" />
        <rect x="1192" y="168" width="44" height="312" fill="url(#hb-bR)" />
        <rect x="1243" y="225" width="28" height="255" fill="url(#hb-bR)" />
        <rect x="1278" y="255" width="34" height="225" fill="url(#hb-bR)" />
        <rect x="1319" y="234" width="26" height="246" fill="url(#hb-bR)" />
        <rect x="1352" y="274" width="30" height="206" fill="url(#hb-bR)" />
        <rect x="1388" y="295" width="26" height="185" fill="url(#hb-bR)" />
        {/* Glowing amber windows — right */}
        {([
          [1198,176],[1198,194],[1198,212],[1198,230],[1207,176],[1207,194],[1207,212],[1215,176],
          [1159,214],[1159,232],[1159,250],[1167,214],[1167,232],
          [1249,233],[1249,251],[1257,233],
          [1284,263],[1284,281],[1292,263],
          [1325,242],[1325,260],[1333,242],
        ] as [number,number][]).map(([x, y], i) => (
          <rect key={`wr${i}`} x={x} y={y} width="5" height="5" fill="hsl(48,100%,72%)" opacity="0.76" rx="0.5" />
        ))}

        {/* ── Left botanical vine */}
        <path d="M158 480 C158 398,174 336,196 272 S220 198,244 148 S275 85,302 48"
          stroke="url(#hb-vine)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M178 365 C192 344,214 337,220 320" stroke="hsl(158,64%,48%)" strokeWidth="1.1" fill="none" opacity="0.52" />
        <path d="M197 290 C182 272,168 262,163 245" stroke="hsl(158,64%,48%)" strokeWidth="1"   fill="none" opacity="0.46" />
        <path d="M222 208 C238 190,250 182,262 166" stroke="hsl(158,64%,48%)" strokeWidth="1"   fill="none" opacity="0.4"  />
        <ellipse cx="222" cy="319" rx="7" ry="11" fill="hsl(158,64%,55%)" opacity="0.4"  transform="rotate(-26 222 319)" />
        <ellipse cx="165" cy="243" rx="6" ry="9"  fill="hsl(158,64%,55%)" opacity="0.34" transform="rotate(52 165 243)"  />
        <ellipse cx="264" cy="164" rx="5" ry="8"  fill="hsl(158,64%,55%)" opacity="0.32" transform="rotate(-14 264 164)" />

        {/* ── Right botanical vine */}
        <path d="M1245 480 C1240 396,1224 334,1203 272 S1178 198,1162 148 S1140 83,1115 46"
          stroke="url(#hb-vine)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M1226 365 C1211 344,1190 337,1184 320" stroke="hsl(158,64%,48%)" strokeWidth="1.1" fill="none" opacity="0.52" />
        <path d="M1205 290 C1221 272,1234 262,1240 245" stroke="hsl(158,64%,48%)" strokeWidth="1"   fill="none" opacity="0.46" />
        <ellipse cx="1182" cy="318" rx="7" ry="11" fill="hsl(158,64%,55%)" opacity="0.4"  transform="rotate(26 1182 318)"  />
        <ellipse cx="1242" cy="243" rx="6" ry="9"  fill="hsl(158,64%,55%)" opacity="0.34" transform="rotate(-52 1242 243)" />

        {/* ── Monstera silhouette — far-left edge */}
        <g opacity="0.11" fill="url(#hb-mon)" transform="translate(-28,145) scale(1.35)">
          <path d="M75 310 C55 272,14 232,22 168 C30 104,84 88,116 66 C148 44,170 54,176 86 C182 118,153 147,149 172 C170 150,196 140,207 162 C218 184,196 218,175 228 C197 221,218 228,224 248 C230 268,208 283,186 289 C203 289,220 299,220 322 C220 344,197 354,175 350 C153 346,132 328,116 312 C106 328,96 339,75 310Z" />
          <path d="M116 148 C126 130,155 135,155 157 C155 178,126 184,116 168Z" fill="hsl(260,70%,8%)" opacity="0.8" />
          <path d="M172 180 C182 163,208 166,209 188 C210 208,183 213,173 199Z" fill="hsl(260,70%,8%)" opacity="0.8" />
        </g>
      </svg>

      {/* ── GOLDEN DRIFTING LEAVES ───────────────────────────────────────────── */}
      {([
        { top: '9%',  left: '7%',   w: 52, type: 1 as const, rot: '-14deg', dur: '7s',   delay: '0s'   },
        { top: '26%', left: '14%',  w: 36, type: 2 as const, rot: '22deg',  dur: '9.5s', delay: '1.6s' },
        { top: '7%',  left: '43%',  w: 30, type: 1 as const, rot: '-32deg', dur: '6.5s', delay: '3.0s' },
        { top: '52%', left: '3%',   w: 42, type: 3 as const, rot: '11deg',  dur: '8s',   delay: '0.8s' },
        { top: '11%', right: '7%',  w: 48, type: 1 as const, rot: '26deg',  dur: '10s',  delay: '3.4s' },
        { top: '40%', right: '4%',  w: 34, type: 2 as const, rot: '-19deg', dur: '7.5s', delay: '1.3s' },
      ]).map((l, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: l.top, left: l.left, right: l.right,
            width: l.w, height: Math.round(l.w * 1.55),
            transform: `rotate(${l.rot})`,
            animation: `leaf-drift ${l.dur} ease-in-out infinite`,
            animationDelay: l.delay,
          }}
        >
          <svg viewBox="0 0 100 155" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id={`hb-lg${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {LEAF_GRADS[l.type].map((s, si) => (
                  <stop key={si} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
                ))}
              </linearGradient>
            </defs>
            <path
              d="M50 150 C28 128,4 98,7 60 C10 22,40 8,50 6 C60 8,90 22,93 60 C96 98,72 128,50 150Z"
              fill={`url(#hb-lg${i})`}
            />
            <line x1="50" y1="150" x2="50" y2="8"   stroke="hsl(42,92%,58%)" strokeWidth="0.9" opacity="0.42" />
            <path d="M50 58 Q68 45 80 52"  stroke="hsl(50,100%,72%)" strokeWidth="0.85" fill="none" opacity="0.55" />
            <path d="M50 78 Q32 65 20 72"  stroke="hsl(50,100%,72%)" strokeWidth="0.85" fill="none" opacity="0.50" />
            <path d="M50 98 Q70 85 82 92"  stroke="hsl(50,100%,72%)" strokeWidth="0.85" fill="none" opacity="0.44" />
            <path d="M50 118 Q30 105 18 112" stroke="hsl(50,100%,72%)" strokeWidth="0.85" fill="none" opacity="0.36" />
          </svg>
        </div>
      ))}

      {/* ── 4-POINT STAR SPARKLES ────────────────────────────────────────────── */}
      {([
        { top: '16%', left: '21%',  sz: 18, col: 'hsl(50,100%,74%)',       dur: '3.2s', delay: '0.4s'  },
        { top: '36%', left: '29%',  sz: 11, col: 'rgba(255,255,255,0.9)',   dur: '2.5s', delay: '1.2s'  },
        { top: '7%',  left: '58%',  sz: 15, col: 'hsl(50,100%,74%)',       dur: '4.0s', delay: '0.8s'  },
        { top: '22%', left: '74%',  sz: 13, col: 'rgba(255,255,255,0.9)',   dur: '3.5s', delay: '2.3s'  },
        { top: '46%', left: '11%',  sz: 10, col: 'hsl(158,64%,68%)',       dur: '2.8s', delay: '1.7s'  },
        { top: '19%', right: '14%', sz: 16, col: 'hsl(38,92%,70%)',        dur: '3.8s', delay: '0.6s'  },
        { top: '56%', right: '7%',  sz: 12, col: 'rgba(255,255,255,0.9)',   dur: '2.6s', delay: '2.0s'  },
        { top: '11%', right: '33%', sz: 14, col: 'hsl(50,100%,74%)',       dur: '4.2s', delay: '0.2s'  },
        { top: '63%', left: '47%',  sz: 9,  col: 'hsl(38,92%,70%)',        dur: '3.0s', delay: '3.2s'  },
        { top: '31%', right: '23%', sz: 11, col: 'hsl(158,64%,68%)',       dur: '3.4s', delay: '1.5s'  },
      ]).map((s, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: s.top, left: s.left, right: s.right,
            animation: `star-twinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        >
          <svg width={s.sz * 2} height={s.sz * 2} viewBox="-16 -16 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,-14 L3.2,-3.2 L14,0 L3.2,3.2 L0,14 L-3.2,3.2 L-14,0 L-3.2,-3.2Z" fill={s.col} />
            <circle cx="0" cy="0" r="2.2" fill={s.col} />
          </svg>
        </div>
      ))}

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
                {/* Inner glass surface — REAL glass (has something to blur) */}
                <div className="relative min-w-[145px] overflow-hidden rounded-[calc(0.5rem-1.2px)] bg-bg/85 p-3.5 backdrop-blur-xl">
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
                  {/* Sparkle accent — top-right */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute right-2.5 top-2.5 h-1 w-1 rounded-full bg-white/53 shadow-[0_0_8px_2px_rgba(255,255,255,0.7)]"
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
                    <span className="ml-1 text-cream [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                      OFF
                    </span>
                  </p>

                  {/* "This Week Only" — readable supporting line */}
                  <p className="relative mt-1 text-[10.5px] font-semibold text-cream/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.75)]">
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
