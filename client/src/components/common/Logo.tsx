import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface LogoProps {
  size?:    'sm' | 'md' | 'lg';
  className?: string;
  /** When true renders a <span> instead of a <Link> (e.g. inside the footer) */
  asSpan?: boolean;
}

const sizeMap = {
  sm: { wrap: 'h-8 w-8',  icon: 'text-lg',  text: 'text-[15px]', sub: 'text-[8px]'  },
  md: { wrap: 'h-10 w-10', icon: 'text-xl',  text: 'text-base',   sub: 'text-[9px]'  },
  lg: { wrap: 'h-12 w-12', icon: 'text-2xl', text: 'text-xl',     sub: 'text-[10px]' },
};

function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon badge */}
      <div className="relative flex shrink-0 items-center justify-center">
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-green-500/20"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Icon */}
        <motion.div
          className={cn(
            s.wrap,
            'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-md',
          )}
          whileHover={{ rotate: [0, -6, 6, 0], scale: 1.06 }}
          transition={{ duration: 0.45 }}
        >
          <span className={cn(s.icon, 'leading-none')}>🛍️</span>
        </motion.div>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className={cn(s.text, 'font-extrabold tracking-tight text-green-700')}>
          Ayra Family Mart
        </span>
        <span className={cn(s.sub, 'mt-0.5 font-semibold uppercase tracking-[0.15em] text-teal-600/70')}>
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
