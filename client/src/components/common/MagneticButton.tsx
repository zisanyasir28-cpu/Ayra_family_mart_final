import { useRef } from 'react';
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

type MagneticBaseProps = {
  children:   React.ReactNode;
  className?: string;
  /** Maximum pixel offset toward cursor. Default: 8. */
  strength?:  number;
  /** Detection radius in pixels. Default: 90. */
  radius?:    number;
};

type MagneticButtonProps = MagneticBaseProps &
  Omit<HTMLMotionProps<'button'>, keyof MagneticBaseProps>;

/**
 * Button that translates a few pixels toward the cursor when the cursor
 * enters its proximity radius. Uses spring physics so motion feels alive,
 * not robotic. Disabled on touch devices via `(pointer: fine)` media query
 * — on coarse pointers it's a regular button.
 */
export function MagneticButton({
  children, className, strength = 8, radius = 90, ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.4 });

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    // Only fine pointers — no magnetic on touch
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) return;
    const pull = (1 - dist / radius) * strength;
    rawX.set((dx / dist || 0) * pull);
    rawY.set((dy / dist || 0) * pull);
  }

  function onPointerLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn('inline-flex items-center justify-center', className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
