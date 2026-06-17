import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FloatingPagerProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Dim + block taps while a page fetch is in flight. */
  disabled?: boolean;
}

/**
 * Mobile-only floating prev/next page controls — glassy circular buttons pinned
 * to the left & right screen edges so you can page without scrolling down to the
 * numeric pager. Sits at bottom-28 to clear both the product cards' "+" buttons
 * and the bottom tab bar. Hidden on lg+ (desktop has the sidebar + inline pager)
 * and when there's only one page; each side hides itself at the range ends.
 */
export function FloatingPager({ page, totalPages, onChange, disabled = false }: FloatingPagerProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const shell =
    'group fixed bottom-28 z-40 rounded-full bg-gradient-to-br from-saffron/60 via-plum/40 to-saffron/50 p-[1.5px] shadow-[0_8px_24px_-6px_hsl(var(--saffron)/0.55)] transition active:scale-90 disabled:opacity-40 disabled:active:scale-100 lg:hidden';
  const face =
    'flex h-12 w-12 items-center justify-center rounded-full bg-bg/55 text-cream backdrop-blur-md transition group-hover:bg-bg/35';

  return (
    <>
      {hasPrev && (
        <button
          type="button"
          aria-label="Previous page"
          disabled={disabled}
          onClick={() => onChange(page - 1)}
          className={cn(shell, 'left-2')}
        >
          <span className={face}>
            <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
          </span>
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          aria-label="Next page"
          disabled={disabled}
          onClick={() => onChange(page + 1)}
          className={cn(shell, 'right-2')}
        >
          <span className={face}>
            <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
          </span>
        </button>
      )}
    </>
  );
}
