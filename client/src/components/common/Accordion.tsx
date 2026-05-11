import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AccordionProps {
  title: ReactNode;
  open: boolean;
  onToggle: () => void;
  /** Optional decoration on the right of the title row (chip/badge/icon). */
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Minimal Tailwind accordion matching the warm-dark theme. No shadcn primitives —
 * we use Framer Motion's height/opacity tween so the Step 1 "Add New Address"
 * panel slides open without layout jank.
 */
export function Accordion({
  title,
  open,
  onToggle,
  trailing,
  className,
  children,
}: AccordionProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-surface',
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-cream transition-colors hover:bg-surface-2/40"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="flex items-center gap-2">
          {trailing}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-cream/60 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="border-t border-line/70"
          >
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
