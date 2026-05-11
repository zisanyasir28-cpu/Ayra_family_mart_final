import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  /** Right-aligned helper text — e.g. "৳20 surcharge". */
  trailing?: ReactNode;
  /** Optional icon shown on the left. */
  icon?: ReactNode;
  className?: string;
}

/**
 * Large clickable card with a radio dot. Used for the Payment step (SSLCommerz vs COD)
 * and reusable wherever a selectable card pattern is needed.
 */
export function RadioCard({
  selected,
  onSelect,
  title,
  description,
  badge,
  trailing,
  icon,
  className,
}: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all',
        selected
          ? 'border-saffron bg-saffron/[0.06] shadow-[0_8px_28px_-12px_rgba(238,178,69,0.3)]'
          : 'border-line bg-surface hover:border-saffron/40 hover:bg-surface-2/40',
        className,
      )}
    >
      <span
        className={cn(
          'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-saffron bg-saffron' : 'border-cream/30',
        )}
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full bg-bg transition-opacity',
            selected ? 'opacity-100' : 'opacity-0',
          )}
        />
      </span>

      {icon && (
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2/60 text-cream/85',
            selected && 'text-saffron',
          )}
        >
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-base font-semibold text-cream">
          {title}
          {badge && (
            <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-saffron">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-cream/65">{description}</p>
        )}
      </div>

      {trailing && (
        <span className="self-center text-xs font-medium text-cream/65">
          {trailing}
        </span>
      )}
    </button>
  );
}
