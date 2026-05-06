import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LogoProps {
  size?:      'sm' | 'md' | 'lg';
  className?: string;
  asSpan?:    boolean;
  variant?:   'cream' | 'bg';
}

const SIZE = {
  sm: { mark: 'h-8 w-8',  text: 'text-base' },
  md: { mark: 'h-10 w-10', text: 'text-lg'   },
  lg: { mark: 'h-12 w-12', text: 'text-xl'  },
};

function LogoMark({ size = 'md', variant = 'cream' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'cream' | 'bg' }) {
  const s = SIZE[size];
  const main = variant === 'bg' ? 'text-bg' : 'text-cream';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {/* Mark — simple "A" inside saffron round */}
      <motion.span
        whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className={cn(
          s.mark,
          'relative flex items-center justify-center rounded-full bg-saffron font-display text-bg shadow-saffron',
        )}
      >
        <span className="font-display font-black tracking-tight">A</span>
        {/* Coral dot */}
        <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-coral ring-2 ring-bg" />
      </motion.span>

      {/* Wordmark */}
      <span className={cn('font-display font-black tracking-tight', s.text, main)}>
        Ayra<span className="text-saffron">.</span>
      </span>
    </span>
  );
}

export function Logo({ size = 'md', className, asSpan, variant = 'cream' }: LogoProps) {
  if (asSpan) {
    return (
      <span className={cn('inline-flex', className)}>
        <LogoMark size={size} variant={variant} />
      </span>
    );
  }
  return (
    <Link to="/" className={cn('inline-flex items-center', className)}>
      <LogoMark size={size} variant={variant} />
    </Link>
  );
}
