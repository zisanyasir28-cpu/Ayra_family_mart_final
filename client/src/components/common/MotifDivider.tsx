import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MotifDividerProps {
  className?: string;
  /** Color of the stitch — defaults to mist for subtlety. */
  variant?:   'mist' | 'mati' | 'ink';
}

const COLORS = {
  mist: 'hsl(45 25% 78%)',
  mati: 'hsl(15 71% 41%)',
  ink:  'hsl(30 17% 11%)',
};

/**
 * Kantha-stitch inspired horizontal divider — used between page sections.
 * The motif animates on viewport entry: stitches draw left-to-right, the
 * central marigold blooms in.
 */
export function MotifDivider({ className, variant = 'mist' }: MotifDividerProps) {
  const color = COLORS[variant];

  return (
    <div className={cn('flex justify-center py-8', className)}>
      <motion.svg
        width="280"
        height="32"
        viewBox="0 0 280 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="overflow-visible"
      >
        {/* Left stitch line */}
        <motion.path
          d="M 0 16 L 110 16"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="4 4"
          variants={{
            hidden:  { pathLength: 0,  opacity: 0 },
            visible: { pathLength: 1,  opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
        {/* Right stitch line */}
        <motion.path
          d="M 170 16 L 280 16"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="4 4"
          variants={{
            hidden:  { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
        {/* Central marigold (stylised) */}
        <motion.g
          variants={{
            hidden:  { scale: 0, rotate: -45, opacity: 0 },
            visible: { scale: 1, rotate: 0,   opacity: 1, transition: { delay: 0.5, type: 'spring', stiffness: 180, damping: 14 } },
          }}
          style={{ transformOrigin: '140px 16px' }}
        >
          {/* Petals */}
          {[0, 45, 90, 135].map((deg) => (
            <ellipse
              key={deg}
              cx="140" cy="16" rx="8" ry="3"
              fill={color}
              opacity="0.5"
              transform={`rotate(${deg} 140 16)`}
            />
          ))}
          {/* Centre */}
          <circle cx="140" cy="16" r="3" fill={color} />
        </motion.g>
      </motion.svg>
    </div>
  );
}
