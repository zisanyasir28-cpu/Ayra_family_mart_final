import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { fetchProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';
import { ArrowRightIcon } from '../common/HandIcon';

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 22 } },
};

export function NewArrivals() {
  const { data, isLoading } = useQuery({
    queryKey:  ['products', 'new-arrivals'],
    queryFn:   () => fetchProducts({ sortBy: 'newest', limit: 8 }),
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.data ?? [];
  // Nothing to show (e.g. API empty) — hide the section rather than leave a gap.
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="bg-bg py-20 sm:py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              <span>Just In</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="display-lg mt-4 max-w-2xl text-cream"
            >
              Fresh off the shelf — <em className="text-saffron">new arrivals.</em>
            </motion.h2>
          </div>
          <Link
            to="/products?sortBy=newest"
            className="group hidden items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-cream transition-colors hover:border-saffron hover:text-saffron md:inline-flex"
          >
            <span>View all</span>
            <ArrowRightIcon size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5"
          >
            {products.slice(0, 8).map((p) => (
              <motion.div key={p.id} variants={item} className="h-full">
                <ProductCard product={p} className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile "view all" */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            to="/products?sortBy=newest"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-cream"
          >
            View all
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
