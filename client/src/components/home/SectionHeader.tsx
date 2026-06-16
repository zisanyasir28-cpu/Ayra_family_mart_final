import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRightIcon } from '../common/HandIcon';
import { cn } from '../../lib/utils';

// Shared section header for the home product sections. Keeps a consistent
// rhythm (icon chip · English eyebrow · small Bengali accent · big heading ·
// "View all") while letting each section carry its own accent colour, icon,
// and meaning — so the sections feel like a family, not carbon copies.

type Accent = 'saffron' | 'coral' | 'plum' | 'sage';

const ACCENT: Record<Accent, { text: string; ring: string; glow: string; dot: string; hover: string }> = {
  saffron: { text: 'text-saffron', ring: 'ring-saffron/30', glow: 'bg-saffron/20', dot: 'bg-saffron', hover: 'hover:border-saffron hover:text-saffron' },
  coral:   { text: 'text-coral',   ring: 'ring-coral/30',   glow: 'bg-coral/20',   dot: 'bg-coral',   hover: 'hover:border-coral hover:text-coral' },
  plum:    { text: 'text-plum',    ring: 'ring-plum/35',    glow: 'bg-plum/25',    dot: 'bg-plum',    hover: 'hover:border-plum hover:text-plum' },
  sage:    { text: 'text-sage',    ring: 'ring-sage/30',    glow: 'bg-sage/20',    dot: 'bg-sage',    hover: 'hover:border-sage hover:text-sage' },
};

interface SectionHeaderProps {
  icon:        LucideIcon;
  /** English eyebrow label, e.g. "Most Loved" */
  eyebrow:     string;
  /** Small Bengali accent shown beside the eyebrow, e.g. "সবার পছন্দ" */
  bangla:      string;
  /** The big display headline (may include <em> accents) */
  title:       ReactNode;
  accent:      Accent;
  viewAllHref: string;
}

export function SectionHeader({ icon: Icon, eyebrow, bangla, title, accent, viewAllHref }: SectionHeaderProps) {
  const a = ACCENT[accent];
  return (
    <div className="mb-10 flex items-end justify-between gap-6">
      <div>
        {/* Eyebrow row — icon chip · English · Bengali accent */}
        <div className="flex items-center gap-2.5">
          <span className={cn('relative grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1', a.ring)}>
            <span aria-hidden className={cn('absolute inset-0 rounded-full blur-md', a.glow)} />
            <Icon className={cn('relative h-4 w-4', a.text)} strokeWidth={2} />
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-cream/55">{eyebrow}</span>
            <span aria-hidden className={cn('h-1 w-1 rounded-full', a.dot)} />
            <span className={cn('font-bangla text-sm font-semibold leading-none', a.text)}>{bangla}</span>
          </span>
        </div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="display-lg mt-4 max-w-2xl text-cream"
        >
          {title}
        </motion.h2>
      </div>

      <Link
        to={viewAllHref}
        className={cn(
          'group hidden items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-cream transition-colors md:inline-flex',
          a.hover,
        )}
      >
        <span>View all</span>
        <ArrowRightIcon size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
