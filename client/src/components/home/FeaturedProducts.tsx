import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchFeaturedProducts } from '../../services/products';
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

export function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn:  fetchFeaturedProducts,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="bg-bg py-20 sm:py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              <span>Featured</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="display-lg mt-4 max-w-2xl text-cream"
            >
              Picked, photographed,<br className="hidden sm:block" />
              <em className="text-saffron">and waiting.</em>
            </motion.h2>
          </div>
          <Link
            to="/products?isFeatured=true"
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
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-line py-24 text-center">
            <span className="text-6xl opacity-50">📦</span>
            <p className="mt-5 font-display text-xl text-cream">No featured products yet</p>
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
            to="/products?isFeatured=true"
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
