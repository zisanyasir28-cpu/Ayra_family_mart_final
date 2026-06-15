import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  green:  'bg-green-100 text-green-700',
  gray:   'bg-gray-100 text-gray-600',
  blue:   'bg-blue-100 text-blue-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  muted:  'bg-muted text-muted-foreground',
} as const;

export type BadgeTone = keyof typeof TONES;

/**
 * Pill status badge with a fixed color palette. Each admin page maps its own
 * status enum to a tone and supplies the label as children.
 */
export function Badge({
  tone = 'muted',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
