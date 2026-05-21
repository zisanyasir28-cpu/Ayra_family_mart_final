import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LogoProps {
  size?:      'sm' | 'md' | 'lg';
  className?: string;
  asSpan?:    boolean;
  variant?:   'cream' | 'bg';
}

/**
 * Brand identity — horizontal row:
 *   ┌──────┬───────────┐
 *   │ 🌿   │  Ayra®    │  ← leaf icon LEFT + text column RIGHT
 *   │ leaf │ FAMILY MART│  ← "Ayra" large bold + "FAMILY MART" micro-caps below
 *   └──────┴───────────┘
 */
const SIZE = {
  sm: { leaf: 20, word: 'text-[1.1rem]',   sub: 'text-[7px]   tracking-[0.28em]' },
  md: { leaf: 26, word: 'text-[1.45rem]',  sub: 'text-[8.5px] tracking-[0.28em]' },
  lg: { leaf: 34, word: 'text-[1.9rem]',   sub: 'text-[10px]  tracking-[0.28em]' },
};

/** Stylized sprout — two leaves angled outward from a central stem. */
function LeafMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="block"
    >
      {/* Left leaf — fuller, primary sage */}
      <path
        d="M16 18C16 18 7 16 4 7C4 7 7 5 11 7C15 9 16 13 16 18Z"
        fill="hsl(var(--sage))"
      />
      {/* Right leaf — slightly translucent for depth */}
      <path
        d="M16 18C16 18 25 16 28 7C28 7 25 5 21 7C17 9 16 13 16 18Z"
        fill="hsl(var(--sage))"
        fillOpacity="0.78"
      />
      {/* Central stem */}
      <path
        d="M16 18V26"
        stroke="hsl(var(--sage))"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Small leaf vein highlights — subtle */}
      <path
        d="M10 9C12 11 14 14 16 17"
        stroke="hsl(var(--bg))"
        strokeOpacity="0.18"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M22 9C20 11 18 14 16 17"
        stroke="hsl(var(--bg))"
        strokeOpacity="0.18"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoMark({
  size = 'md',
  variant = 'cream',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cream' | 'bg';
}) {
  const s = SIZE[size];
  const main = variant === 'bg' ? 'text-bg' : 'text-cream';
  const subColor = variant === 'bg' ? 'text-bg/65' : 'text-cream/65';

  return (
    <motion.span
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
      className="inline-flex flex-row items-center gap-2.5 select-none"
    >
      <LeafMark size={s.leaf} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-black tracking-tight inline-flex items-start gap-[0.2em]',
            s.word,
            main,
          )}
        >
          Ayra
          <span className="mt-[0.1em] text-[0.38em] font-bold opacity-50">®</span>
        </span>
        <span
          className={cn(
            'font-display font-semibold uppercase mt-[0.25em]',
            s.sub,
            subColor,
          )}
        >
          Family Mart
        </span>
      </span>
    </motion.span>
  );
}

export function Logo({ size = 'md', className, asSpan, variant = 'cream' }: LogoProps) {
  if (asSpan) {
    return (
      <span className={cn('inline-flex', className)}>
        <LogoMark size={size} variant={variant} />
      </span>
    );
  }
  return (
    <Link to="/" className={cn('inline-flex items-center', className)} aria-label="Ayra Family Mart — Home">
      <LogoMark size={size} variant={variant} />
    </Link>
  );
}
