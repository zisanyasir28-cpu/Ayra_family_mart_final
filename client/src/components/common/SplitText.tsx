import { cn } from '../../lib/utils';

interface SplitTextProps {
  children:    string;
  className?:  string;
  /** Stagger between letters in ms. Default: 35. */
  stagger?:    number;
  /** Initial delay before first letter animates in ms. Default: 0. */
  delayMs?:    number;
}

/**
 * Splits a string into per-letter spans that animate in via CSS keyframe
 * (`letter-rise` from globals.css). Each line is wrapped so descenders
 * (g, y, j) stay visible during the slide-up.
 *
 * Whitespace is preserved as a non-breaking space.
 */
export function SplitText({ children, className, stagger = 35, delayMs = 0 }: SplitTextProps) {
  // Split on words first to allow natural wrapping
  const words = children.split(' ');
  let charIndex = 0;

  return (
    <span className={cn('inline-block', className)}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, cIdx) => {
            const i = charIndex++;
            return (
              <span key={cIdx} className="split-line">
                <span
                  className="split-letter"
                  style={{
                    animationDelay: `${delayMs + i * stagger}ms`,
                  }}
                >
                  {ch}
                </span>
              </span>
            );
          })}
          {wIdx < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
