import { cn } from '@/lib/utils';

interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  title:    React.ReactNode;
  description?: React.ReactNode;
  badge?:   React.ReactNode;
  icon?:    React.ReactNode;
  className?: string;
}

export function RadioCard({
  selected, onSelect, title, description, badge, icon, className,
}: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex w-full items-start gap-4 rounded-2xl border bg-surface/60 backdrop-blur-sm p-4 text-left transition-all',
        selected
          ? 'border-saffron bg-saffron/[0.06] shadow-[0_0_20px_-6px_hsl(var(--saffron)/0.3)]'
          : 'border-line/50 hover:border-saffron/40 hover:bg-surface/80',
        className,
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all',
          selected ? 'border-saffron' : 'border-line/60',
        )}
      >
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-all duration-200',
            selected ? 'bg-saffron scale-100' : 'bg-transparent scale-0',
          )}
        />
      </span>
      {icon && <span className="mt-0.5 text-cream/40">{icon}</span>}
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-cream">{title}</span>
          {badge && (
            <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-saffron">
              {badge}
            </span>
          )}
        </span>
        {description && (
          <span className="mt-1 block text-sm text-cream/55">{description}</span>
        )}
      </span>
    </button>
  );
}
