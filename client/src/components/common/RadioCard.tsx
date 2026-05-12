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
        'group relative flex w-full items-start gap-4 rounded-xl border bg-surface p-4 text-left transition-all',
        selected
          ? 'border-saffron bg-saffron/[0.06] shadow-sm'
          : 'border-line hover:border-saffron/40 hover:bg-bg/30',
        className,
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-saffron' : 'border-line',
        )}
      >
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-all',
            selected ? 'bg-saffron scale-100' : 'bg-transparent scale-0',
          )}
        />
      </span>
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-foreground">{title}</span>
          {badge && (
            <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-saffron">
              {badge}
            </span>
          )}
        </span>
        {description && (
          <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
        )}
      </span>
    </button>
  );
}
