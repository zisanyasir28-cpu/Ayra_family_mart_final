/**
 * TopLoadingBar
 *
 * A 3-px saffron→coral→blush gradient bar pinned to the top of the viewport.
 * It shows whenever TanStack Query has an in-flight request, giving the user
 * immediate visual feedback that data is being fetched — even before any
 * skeleton/spinner renders in the content area.
 *
 * Design tokens used: --saffron, --coral, --blush (maps to green/gold/orange in
 * light mode automatically, pink/gold/orange in dark mode).
 */

import { useEffect, useRef, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';

export function TopLoadingBar() {
  const isFetching  = useIsFetching();
  const isActive    = isFetching > 0;

  // width: 0 → 72% while fetching, then 100% on complete, then disappear
  const [width,   setWidth]   = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isActive) {
      // Instantly show and grow to ~72 %
      setVisible(true);
      setWidth(72);
    } else if (visible) {
      // Complete the bar, then fade it out
      setWidth(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 380);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{ width: `${width}%` }}
      className={[
        // Layout — fixed to very top, above everything
        'pointer-events-none fixed left-0 top-0 z-[9999] h-[3px]',
        // Gradient fill
        'bg-gradient-to-r from-saffron via-coral to-blush',
        // Smooth width transition (ease-out feels like real progress)
        'transition-[width] duration-[600ms] ease-out',
        // Glow beneath the bar
        'shadow-[0_0_10px_0px_hsl(var(--saffron)/0.8),0_0_4px_0px_hsl(var(--saffron)/1)]',
        // Rounded right cap
        'rounded-r-full',
        // Fade out when complete
        width === 100 ? 'opacity-0 transition-opacity duration-[380ms]' : 'opacity-100',
      ].join(' ')}
    >
      {/* Shimmer sweep overlay — white highlight moving left→right */}
      <div
        className="animate-loadbar-sweep absolute inset-y-0 w-[40%] rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
    </div>
  );
}
