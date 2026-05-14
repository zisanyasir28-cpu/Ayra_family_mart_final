import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore, type Theme } from '../../store/themeStore';

// ─── Compact 3-option segment control ─────────────────────────────────────────
//
// Renders Sun / Monitor / Moon as a single pill. Highlights the active option.
// Designed to slot into UserMenu / AdminLayout footer as a single row.

const OPTIONS: { id: Theme; icon: typeof Sun; label: string }[] = [
  { id: 'light',  icon: Sun,     label: 'Light'  },
  { id: 'system', icon: Monitor, label: 'System' },
  { id: 'dark',   icon: Moon,    label: 'Dark'   },
];

interface ThemeToggleProps {
  /** When true, render as a horizontal segment control (default).
   *  When false, render as a vertical list (useful in narrow popovers). */
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = true, className }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore();

  return (
    <div
      className={cn(
        compact
          ? 'flex items-center gap-0.5 rounded-full border border-line bg-surface-2 p-0.5'
          : 'flex flex-col gap-1',
        className,
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {OPTIONS.map(({ id, icon: Icon, label }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(id)}
            className={cn(
              compact
                ? 'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition'
                : 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
              active
                ? 'bg-saffron text-bg shadow-sm'
                : 'text-cream/65 hover:bg-cream/5 hover:text-cream',
            )}
            title={label}
          >
            <Icon className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            {!compact && <span>{label}</span>}
            {compact && <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
