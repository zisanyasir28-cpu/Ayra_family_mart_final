import { cn } from '../../lib/utils';

/**
 * Hand-drawn ink-line icons. Stroke-only, preserves currentColor for
 * easy theming. Drop-in replacement for select Lucide icons in places
 * where the editorial vibe matters.
 */

interface IconProps {
  className?: string;
  size?:     number;
  strokeWidth?: number;
}

const baseProps = (size: number, sw: number, className?: string) => ({
  width:           size,
  height:          size,
  viewBox:         '0 0 24 24',
  fill:            'none',
  stroke:          'currentColor',
  strokeWidth:     sw,
  strokeLinecap:   'round' as const,
  strokeLinejoin:  'round' as const,
  className:       cn('inline-block', className),
});

export function BasketIcon({ className, size = 22, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M3 8 h18 l-1.6 11 a2 2 0 0 1 -2 2 H6.6 a2 2 0 0 1 -2 -2 Z" />
      <path d="M8 8 L10 3" />
      <path d="M16 8 L14 3" />
      <path d="M9 13 v4" />
      <path d="M15 13 v4" />
    </svg>
  );
}

export function LeafIcon({ className, size = 22, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M4 20 C 4 11, 11 4, 20 4 C 20 13, 13 20, 4 20 Z" />
      <path d="M4 20 C 9 15, 14 10, 19 5" />
    </svg>
  );
}

export function TruckIcon({ className, size = 22, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M2 7 h11 v10 H4 a2 2 0 0 1 -2 -2 Z" />
      <path d="M13 10 h5 l3 4 v3 h-8 Z" />
      <circle cx="7"  cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function ReturnIcon({ className, size = 22, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M3 12 a 9 9 0 1 0 9 -9" />
      <path d="M3 4 v8 h8" />
    </svg>
  );
}

export function ShieldIcon({ className, size = 22, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 3 L20 6 V12 C20 16.5 16.5 20 12 21 C 7.5 20 4 16.5 4 12 V6 Z" />
      <path d="M9 12 l2 2 4 -4" />
    </svg>
  );
}

export function HeartLineIcon({ className, size = 18, strokeWidth = 1.4, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...baseProps(size, strokeWidth, className)}
      fill={filled ? 'currentColor' : 'none'}
    >
      <path d="M12 20 C 6 16, 2 12, 2 8 a 4 4 0 0 1 8 -1 a 4 4 0 0 1 8 1 c 0 4 -4 8 -10 12 Z" />
    </svg>
  );
}

export function SearchIcon({ className, size = 18, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M16 16 L21 21" />
    </svg>
  );
}

export function ArrowRightIcon({ className, size = 18, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M4 12 H20" />
      <path d="M14 6 L20 12 L14 18" />
    </svg>
  );
}

export function PlusIcon({ className, size = 16, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M12 5 V19" />
      <path d="M5 12 H19" />
    </svg>
  );
}

export function MinusIcon({ className, size = 16, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)}>
      <path d="M5 12 H19" />
    </svg>
  );
}

export function MarigoldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn('inline-block', className)}>
      {/* Stylised marigold — solid fill */}
      {[0, 45, 90, 135].map((deg) => (
        <ellipse
          key={deg}
          cx="12" cy="12" rx="9" ry="3.5"
          fill="currentColor"
          opacity="0.55"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
