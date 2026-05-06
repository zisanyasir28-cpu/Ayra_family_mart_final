import { cn } from '../../lib/utils';

interface MarqueeBandProps {
  /** Words/phrases to scroll. Repeated to fill width. */
  items:      string[];
  /** Direction. Default: 'left'. */
  direction?: 'left' | 'right';
  /** Default speed class — 'normal' | 'slow'. */
  speed?:     'normal' | 'slow';
  /** Visual style. */
  variant?:   'cream' | 'saffron' | 'coral' | 'outline';
  /** Bangla word shown between phrases — used sparingly. */
  banglaAccent?: string;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<MarqueeBandProps['variant']>, string> = {
  cream:    'bg-cream text-bg',
  saffron:  'bg-saffron text-bg',
  coral:    'bg-coral text-bg',
  outline:  'bg-bg text-cream border-y border-line',
};

/**
 * A full-width band of kinetic text that scrolls horizontally. Used between
 * sections as a punctuation mark — very high impact, GPU-only, paused on hover.
 */
export function MarqueeBand({
  items,
  direction = 'left',
  speed     = 'normal',
  variant   = 'cream',
  banglaAccent,
  className,
}: MarqueeBandProps) {
  const animClass = speed === 'slow' ? 'animate-marquee-x-slow' : 'animate-marquee-x';
  const dirStyle  = direction === 'right' ? { animationDirection: 'reverse' as const } : undefined;

  // Build a single set; we render twice for seamless loop
  const set = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8 px-6 sm:gap-12 sm:px-10">
          <span className="font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {item}
          </span>
          <span className="text-2xl opacity-50 sm:text-3xl">✦</span>
          {banglaAccent && i % 2 === 0 && (
            <>
              <span className="font-bangla text-2xl font-bold sm:text-3xl">{banglaAccent}</span>
              <span className="text-2xl opacity-50 sm:text-3xl">✦</span>
            </>
          )}
        </span>
      ))}
    </>
  );

  return (
    <div className={cn('relative overflow-hidden py-5', VARIANT_CLASSES[variant], className)}>
      <div className={cn('flex whitespace-nowrap will-change-transform', animClass)} style={dirStyle}>
        <div className="flex shrink-0">{set}</div>
        <div className="flex shrink-0" aria-hidden>{set}</div>
      </div>
    </div>
  );
}
