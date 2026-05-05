import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../services/categories';

// ─── Category color palette (cycles through these) ───────────────────────────

const PALETTE = [
  { bg: 'from-green-100 to-emerald-50',  border: 'border-green-200',   icon: 'bg-green-100',   ring: 'group-hover:border-green-400'  },
  { bg: 'from-orange-100 to-amber-50',   border: 'border-orange-200',  icon: 'bg-orange-100',  ring: 'group-hover:border-orange-400' },
  { bg: 'from-blue-100 to-cyan-50',      border: 'border-blue-200',    icon: 'bg-blue-100',    ring: 'group-hover:border-blue-400'   },
  { bg: 'from-purple-100 to-violet-50',  border: 'border-purple-200',  icon: 'bg-purple-100',  ring: 'group-hover:border-purple-400' },
  { bg: 'from-rose-100 to-pink-50',      border: 'border-rose-200',    icon: 'bg-rose-100',    ring: 'group-hover:border-rose-400'   },
  { bg: 'from-yellow-100 to-amber-50',   border: 'border-yellow-200',  icon: 'bg-yellow-100',  ring: 'group-hover:border-yellow-400' },
  { bg: 'from-teal-100 to-cyan-50',      border: 'border-teal-200',    icon: 'bg-teal-100',    ring: 'group-hover:border-teal-400'   },
  { bg: 'from-indigo-100 to-blue-50',    border: 'border-indigo-200',  icon: 'bg-indigo-100',  ring: 'group-hover:border-indigo-400' },
];

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    fruits:      '🍎', vegetables: '🥦', dairy:       '🥛', meat:    '🥩',
    fish:        '🐟', bakery:     '🍞', beverages:   '🧃', snacks:  '🍿',
    grocery:     '🛒', cleaning:   '🧹', personal:    '🧴', electronics: '📱',
    clothing:    '👕', household:  '🏠', baby:        '👶', health:  '💊',
    spices:      '🌶️', frozen:     '🧊', organic:     '🌱', beauty:  '💄',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (slug.includes(key)) return emoji;
  }
  return '📦';
}

// ─── Scroll arrow button ──────────────────────────────────────────────────────

function ScrollArrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all hover:-translate-y-1/2 hover:scale-110 hover:shadow-lg active:scale-95"
      style={{ [dir === 'left' ? 'left' : 'right']: '-14px' }}
    >
      {dir === 'left'
        ? <ChevronLeft  className="h-4 w-4 text-foreground" />
        : <ChevronRight className="h-4 w-4 text-foreground" />}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CategoryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  }

  return (
    <section className="py-10">
      <div className="container">
        {/* Header */}
        <div className="section-header mb-6">
          <div>
            <p className="section-label bg-green-100 text-green-700">Browse</p>
            <h2 className="section-title mt-1">Shop by Category</h2>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm font-semibold text-green-700 transition-all hover:gap-2 hover:text-green-800"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="relative">
          <ScrollArrow dir="left"  onClick={() => scroll('left')}  />

          {/* Scrollable strip */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          >
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                    <div className="h-[88px] w-[88px] skeleton rounded-2xl" />
                    <div className="h-3 w-16 skeleton rounded-lg" />
                  </div>
                ))
              : categories.map((cat, i) => {
                  const palette = PALETTE[i % PALETTE.length]!;
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 22 }}
                    >
                      <Link
                        to={`/products?categoryId=${cat.id}`}
                        className="group flex shrink-0 flex-col items-center gap-2.5"
                      >
                        {/* Icon circle */}
                        <motion.div
                          whileHover={{ scale: 1.08, y: -3 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-2xl border bg-gradient-to-br transition-all duration-300 ${palette.bg} ${palette.border} ${palette.ring} group-hover:shadow-md`}
                        >
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="h-full w-full rounded-2xl object-cover"
                            />
                          ) : (
                            <span className="text-3xl leading-none select-none">
                              {getCategoryEmoji(cat.slug)}
                            </span>
                          )}
                          {/* Count badge */}
                          {cat._count.products > 0 && (
                            <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow-sm border border-border/50">
                              {cat._count.products}
                            </span>
                          )}
                        </motion.div>

                        {/* Name */}
                        <p className="text-center text-xs font-semibold text-foreground transition-colors group-hover:text-green-700 leading-tight">
                          {cat.name}
                        </p>
                      </Link>
                    </motion.div>
                  );
                })}
          </div>

          <ScrollArrow dir="right" onClick={() => scroll('right')} />
        </div>
      </div>
    </section>
  );
}
