import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  current: number;
  steps:   string[];
}

export function Stepper({ current, steps }: StepperProps) {
  return (
    <ol className="flex w-full items-center gap-2 sm:gap-4">
      {steps.map((label, i) => {
        const stepNum  = i + 1;
        const isDone   = stepNum < current;
        const isActive = stepNum === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300',
                  isDone   && 'border-saffron bg-saffron text-bg shadow-[0_0_12px_-2px_hsl(var(--saffron)/0.5)]',
                  isActive && 'border-saffron text-saffron ring-4 ring-saffron/15',
                  !isDone && !isActive && 'border-line text-cream/40',
                )}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : stepNum}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-semibold sm:block',
                  isActive ? 'text-cream' : 'text-cream/45',
                )}
              >
                {label}
              </span>
            </div>
            {stepNum < steps.length && (
              <span
                className={cn(
                  'h-px flex-1 transition-colors duration-300',
                  isDone ? 'bg-saffron' : 'bg-line/60',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
