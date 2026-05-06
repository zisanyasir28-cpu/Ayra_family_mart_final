import { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useInView';

interface CountUpProps {
  to:          number;
  /** Duration in ms. Default: 1400. */
  duration?:   number;
  /** Format function — defaults to whole-number locale string. */
  format?:     (n: number) => string;
  className?:  string;
  /** Suffix appended after number, e.g. "+", "%". */
  suffix?:     string;
  /** Prefix prepended before number, e.g. "৳". */
  prefix?:     string;
}

/**
 * Counts from 0 to `to` once when the element enters the viewport.
 * Uses requestAnimationFrame for smoothness; eased with ease-out cubic.
 */
export function CountUp({
  to, duration = 1400, format, className, suffix, prefix,
}: CountUpProps) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  const display = format ? format(value) : value.toLocaleString('en-US');

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
