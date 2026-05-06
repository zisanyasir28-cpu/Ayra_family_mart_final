import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Desktop-only cursor follower — a small mati-coloured dot that trails
 * the cursor with spring delay, expanding into a ring when hovering over
 * any element with `data-cursor="hover"` (or links, buttons by default).
 *
 * Mounted globally at the layout level. Bails out on touch devices and
 * on `prefers-reduced-motion`.
 */
export function CursorFollower() {
  const [enabled, setEnabled] = useState(false);
  const [hover,   setHover]   = useState(false);
  const [pressed, setPressed] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 320, damping: 28, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 320, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.body.dataset.cursor = 'on';

    function move(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        'a, button, input, textarea, select, [role="button"], [data-cursor="hover"]',
      );
      setHover(Boolean(interactive));
    }

    function down() { setPressed(true); }
    function up()   { setPressed(false); }

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup',   up);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup',   up);
      delete document.body.dataset.cursor;
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-5 -mt-5"
      >
        <motion.div
          animate={{
            scale:   hover ? 1.5 : pressed ? 0.6 : 1,
            opacity: hover ? 0.4 : 0.55,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="h-10 w-10 rounded-full border border-mati"
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1"
      >
        <motion.div
          animate={{
            scale: pressed ? 0.7 : hover ? 0.4 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className="h-2 w-2 rounded-full bg-mati"
        />
      </motion.div>
    </>
  );
}
