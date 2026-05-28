/**
 * AyraLoader  —  Premium branded loading animation
 *
 * Two variants:
 *   • AyraLoader   – full-page Suspense fallback (min-h-screen) or section
 *                    (min-h-[60vh]).  Animates the full Ayra brand wordmark.
 *   • AyraSpinner  – compact inline/section loader (leaf pulse + tri-dots).
 *                    Drop-in replacement for `animate-spin` spinners.
 *
 * Uses Motion (motion/react) — JS-backed WAAPI, not CSS keyframes,
 * so animations survive prefers-reduced-motion and Chrome's compositor.
 */

import { motion } from 'motion/react';

// ─── Shared: Leaf SVG ─────────────────────────────────────────────────────────
// Exact copy of the LeafMark from Logo.tsx so both share identical brand art.

function LeafMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      {/* Left leaf */}
      <path
        d="M16 18C16 18 7 16 4 7C4 7 7 5 11 7C15 9 16 13 16 18Z"
        fill="hsl(var(--sage))"
      />
      {/* Right leaf — translucent for depth */}
      <path
        d="M16 18C16 18 25 16 28 7C28 7 25 5 21 7C17 9 16 13 16 18Z"
        fill="hsl(var(--sage))"
        fillOpacity="0.78"
      />
      {/* Stem */}
      <path
        d="M16 18V26"
        stroke="hsl(var(--sage))"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Vein highlights */}
      <path d="M10 9C12 11 14 14 16 17" stroke="hsl(var(--bg))" strokeOpacity="0.18" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M22 9C20 11 18 14 16 17" stroke="hsl(var(--bg))" strokeOpacity="0.18" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Shared: Tri-dot progress indicator ──────────────────────────────────────

const DOT_COLORS = [
  'hsl(var(--saffron))',
  'hsl(var(--coral))',
  'hsl(var(--blush))',
];

function TriDots({ size = 5 }: { size?: number }) {
  return (
    <div className="flex items-center gap-[7px]">
      {DOT_COLORS.map((bg, i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ backgroundColor: bg, width: size, height: size }}
          animate={{ y: [0, -7, 0], opacity: [0.3, 1, 0.3], scale: [0.75, 1.25, 0.75] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// ─── AYRA letter constants ────────────────────────────────────────────────────

const LETTERS = ['A', 'Y', 'R', 'A'] as const;

// ─── AyraSpinner — compact section-level indicator ───────────────────────────

export function AyraSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={['flex flex-col items-center gap-3', className].join(' ')}>
      {/* Leaf — gentle breath pulse */}
      <motion.div
        animate={{ scale: [0.86, 1.08, 0.86], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <LeafMark size={28} />
      </motion.div>
      <TriDots size={4} />
    </div>
  );
}

// ─── AyraLoader — full branded page / section loader ─────────────────────────

interface AyraLoaderProps {
  /** true = fills the entire viewport (Suspense page fallback) */
  fullScreen?: boolean;
}

export function AyraLoader({ fullScreen = false }: AyraLoaderProps) {
  return (
    <div
      className={[
        'relative flex flex-col items-center justify-center overflow-hidden',
        fullScreen ? 'min-h-screen bg-bg' : 'min-h-[60vh]',
      ].join(' ')}
    >
      {/* ── Ambient glow field ─────────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Saffron orb — drifts up/down slowly */}
        <motion.div
          className="absolute left-[38%] top-[32%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
          style={{ background: 'hsl(var(--saffron) / 0.07)' }}
          animate={{ y: [-14, 14, -14], scale: [0.88, 1.12, 0.88] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Blush orb — opposite phase */}
        <motion.div
          className="absolute right-[38%] bottom-[32%] h-56 w-56 translate-x-1/2 translate-y-1/2 rounded-full blur-[75px]"
          style={{ background: 'hsl(var(--blush) / 0.06)' }}
          animate={{ y: [14, -14, 14], scale: [1.06, 0.90, 1.06] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        />
        {/* Sage accent — slow horizontal drift */}
        <motion.div
          className="absolute left-1/2 bottom-[28%] h-44 w-44 -translate-x-1/2 rounded-full blur-[65px]"
          style={{ background: 'hsl(var(--sage) / 0.05)' }}
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
      </div>

      {/* ── Central brand content ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
        className="relative z-[1] flex flex-col items-center"
        style={{ gap: 18 }}
      >

        {/* ── Leaf icon — spring bounce in ─────────────────────────────── */}
        <motion.div
          initial={{ scale: 0, rotate: -22, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 250, damping: 16, delay: 0.1 }}
          className="relative"
        >
          {/* Sage halo glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full blur-xl"
            style={{ background: 'hsl(var(--sage) / 0.24)' }}
          />
          <LeafMark size={52} />
        </motion.div>

        {/* ── "AYRA" — staggered letter cascade ───────────────────────── */}
        <div className="relative" aria-label="Ayra">

          {/* Shimmer highlight — sweeps left→right once after letters land */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm">
            <motion.div
              className="absolute top-0 h-full"
              style={{
                width: '44%',
                background:
                  'linear-gradient(108deg, transparent 0%, hsl(var(--cream) / 0.22) 50%, transparent 100%)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '300%' }}
              transition={{ duration: 0.72, delay: 0.9, ease: 'easeInOut' }}
            />
          </div>

          {/* Letters */}
          <div className="flex items-baseline gap-[0.03em]">
            {LETTERS.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 22,
                  delay: 0.22 + i * 0.09,
                }}
                className="font-display font-black leading-none select-none"
                style={{
                  fontSize: 'clamp(2.8rem, 11vw, 4.6rem)',
                  letterSpacing: '-0.025em',
                  background:
                    'linear-gradient(135deg, hsl(var(--saffron)) 5%, hsl(var(--blush)) 95%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* ── "FAMILY MART" sub-label ────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, delay: 0.68 }}
          className="font-display font-semibold uppercase leading-none text-cream/28"
          style={{
            fontSize: '8.5px',
            letterSpacing: '0.46em',
            marginTop: -8,
          }}
        >
          Family&nbsp;Mart
        </motion.p>

        {/* ── Tri-dot progress indicator ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.78 }}
          style={{ marginTop: 2 }}
        >
          <TriDots size={5} />
        </motion.div>

      </motion.div>
    </div>
  );
}
