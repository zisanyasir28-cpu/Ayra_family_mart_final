import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../services/categories';

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    fruits: '🍎', vegetables: '🥦', dairy: '🥛', meat: '🥩',
    fish: '🐟', bakery: '🍞', beverages: '🧃', snacks: '🍿',
    grocery: '🛒', cleaning: '🧹', personal: '🧴', electronics: '📱',
    clothing: '👕', household: '🏠', baby: '👶', health: '💊',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (slug.includes(key)) return emoji;
  }
  return '📦';
}

export function CategoryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  }

  return (
    <section className="py-8">
      <div className="container">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Shop by Category</h2>
          <Link
            to="/products"
            className="text-sm font-medium text-green-700 transition hover:text-green-800"
          >
            View all →
          </Link>
        </div>

        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md transition hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scrollable strip */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                    <div className="h-20 w-20 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))
              : categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={`/products?categoryId=${cat.id}`}
                      className="group flex shrink-0 flex-col items-center gap-2"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-green-50 to-teal-50 text-4xl transition group-hover:border-green-400 group-hover:shadow-md">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        ) : (
                          getCategoryEmoji(cat.slug)
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-foreground group-hover:text-green-700">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {cat._count.products} items
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md transition hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
