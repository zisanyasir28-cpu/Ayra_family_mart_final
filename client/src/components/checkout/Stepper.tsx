import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepDefinition {
  number: 1 | 2 | 3;
  label: string;
}

interface StepperProps {
  current: 1 | 2 | 3;
  steps: StepDefinition[];
  /** When non-null the user can click the indicator to jump back. */
  onJump?: (step: 1 | 2 | 3) => void;
}

export function Stepper({ current, steps, onJump }: StepperProps) {
  return (
    <ol className="flex w-full items-center gap-2 sm:gap-4">
      {steps.map((step, idx) => {
        const isDone = step.number < current;
        const isActive = step.number === current;
        const canJump = onJump && isDone;

        return (
          <li
            key={step.number}
            className={cn(
              'flex flex-1 items-center gap-3',
              idx < steps.length - 1 && 'after:ml-3 after:h-px after:flex-1 after:bg-line',
            )}
          >
            <button
              type="button"
              disabled={!canJump}
              onClick={() => canJump && onJump(step.number)}
              className={cn(
                'flex items-center gap-3 transition-opacity',
                !canJump && 'cursor-default',
                canJump && 'hover:opacity-90',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isActive && 'border-saffron bg-saffron text-bg',
                  isDone && 'border-saffron bg-saffron/10 text-saffron',
                  !isActive && !isDone && 'border-line text-cream/40',
                )}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : step.number}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-semibold uppercase tracking-[0.16em] sm:inline',
                  isActive && 'text-cream',
                  isDone && 'text-saffron',
                  !isActive && !isDone && 'text-cream/40',
                )}
              >
                {step.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
