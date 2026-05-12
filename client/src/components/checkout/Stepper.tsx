import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  current: number; // 1, 2, or 3
  steps:   string[];
}

export function Stepper({ current, steps }: StepperProps) {
  return (
    <ol className="flex w-full items-center gap-2 sm:gap-4">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone     = stepNum < current;
        const isActive   = stepNum === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  isDone   && 'border-saffron bg-saffron text-bg',
                  isActive && 'border-saffron text-saffron',
                  !isDone && !isActive && 'border-line text-muted-foreground',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : stepNum}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:block',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {stepNum < steps.length && (
              <span
                className={cn(
                  'h-px flex-1 transition-colors',
                  isDone ? 'bg-saffron' : 'bg-line',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
