import { cn } from '@/lib/utils';

/** Small inline loading spinner (admin tables, buttons). */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary',
        className,
      )}
    />
  );
}
