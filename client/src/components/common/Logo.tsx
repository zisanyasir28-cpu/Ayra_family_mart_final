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
 * Brand identity — vertical stack:
 *   ┌──────────┐
 *   │  🌿 leaf  │   ← stylized green sprout mark
 *   │   Ayra®  │   ← display wordmark (white in dark, forest in light)
 *   │FAMILY MART│  ← letter-spaced micro-caps subtitle
 *   └──────────┘
 */
const SIZE = {
  sm: { leaf: 18, word: 'text-[1.25rem]',   sub: 'text-[7px]  tracking-[0.32em]' },
  md: { leaf: 24, word: 'text-[1.6rem]',    sub: 'text-[9px]  tracking-[0.32em]' },
  lg: { leaf: 32, word: 'text-[2rem]',      sub: 'text-[10px] tracking-[0.32em]' },
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
      className="inline-flex flex-col items-center select-none leading-none"
    >
      <LeafMark size={s.leaf} />
      <span
        className={cn(
          'font-display font-black tracking-tight mt-0.5 inline-flex items-start gap-0.5',
          s.word,
          main,
        )}
      >
        Ayra
        <span className="mt-[0.15em] text-[0.42em] font-bold text-cream/55">®</span>
      </span>
      <span
        className={cn(
          'font-display font-semibold uppercase mt-1',
          s.sub,
          subColor,
        )}
      >
        Family Mart
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
