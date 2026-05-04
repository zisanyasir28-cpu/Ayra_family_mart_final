import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** When true renders a <span> instead of a <Link> (e.g. inside the footer) */
  asSpan?: boolean;
}

const sizeMap = {
  sm: { icon: 'text-xl',  text: 'text-base',  sub: 'text-[8px]'  },
  md: { icon: 'text-2xl', text: 'text-lg',    sub: 'text-[9px]'  },
  lg: { icon: 'text-4xl', text: 'text-2xl',   sub: 'text-xs'     },
};

function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Animated icon badge */}
      <div className="relative flex shrink-0 items-center justify-center">
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-green-500/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Icon container */}
        <motion.div
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-md"
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
          transition={{ duration: 0.4 }}
        >
          <span className={cn(s.icon, 'leading-none')}>🛍️</span>
        </motion.div>
      </div>

      {/* Text stack */}
      <div className="flex flex-col leading-none">
        <motion.span
          className={cn(
            s.text,
            'font-extrabold tracking-tight text-green-700',
          )}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Ayra Family Mart
        </motion.span>
        <span className={cn(s.sub, 'font-medium tracking-widest text-teal-600/80 uppercase')}>
          Fresh · Fast · Trusted
        </span>
      </div>
    </div>
  );
}

export function Logo({ size = 'md', className, asSpan }: LogoProps) {
  if (asSpan) {
    return (
      <span className={cn('inline-flex', className)}>
        <LogoMark size={size} />
      </span>
    );
  }

  return (
    <Link to="/" className={cn('inline-flex items-center', className)}>
      <LogoMark size={size} />
    </Link>
  );
}
