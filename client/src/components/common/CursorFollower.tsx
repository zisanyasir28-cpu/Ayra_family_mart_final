import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Lightweight cursor follower — a small mati-coloured dot that tracks
 * the cursor with a tiny spring delay, expanding into a ring when over
 * any interactive element.
 *
 * - Bails out on touch devices (no hover capability)
 * - Bails out on prefers-reduced-motion
 * - Inner dot tracks raw cursor (no spring) — zero perceived lag
 * - Only outer ring uses spring (cheap, runs as one transform)
 */
export function CursorFollower() {
  const [enabled, setEnabled] = useState(false);
  const [hover,   setHover]   = useState(false);

  // Inner dot — tracks raw cursor, no spring (zero lag)
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Outer ring — gentle spring trail
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.3 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Strict gates — only on real desktop with hover capability
    const fine    = window.matchMedia('(any-pointer: fine)').matches;
    const hovers  = window.matchMedia('(any-hover: hover)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || !hovers || reduced) return;

    setEnabled(true);
    document.body.dataset.cursor = 'on';

    let ticking = false;
    function move(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const target = e.target as HTMLElement | null;
        if (target) {
          const interactive = target.closest(
            'a, button, input, textarea, select, [role="button"], [data-cursor="hover"]',
          );
          setHover(Boolean(interactive));
        }
        ticking = false;
      });
    }

    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      delete document.body.dataset.cursor;
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring (springy) */}
      <motion.div
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-5 -mt-5"
      >
        <div
          className={`h-10 w-10 rounded-full border border-saffron transition-[transform,opacity] duration-200 ${
            hover ? 'scale-150 opacity-30' : 'scale-100 opacity-50'
          }`}
        />
      </motion.div>

      {/* Inner dot (raw, no spring) */}
      <motion.div
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1"
      >
        <div
          className={`h-2 w-2 rounded-full bg-saffron transition-transform duration-150 ${
            hover ? 'scale-50' : 'scale-100'
          }`}
        />
      </motion.div>
    </>
  );
}
