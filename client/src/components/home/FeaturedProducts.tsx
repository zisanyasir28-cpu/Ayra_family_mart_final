import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { fetchFeaturedProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';

// ─── Stagger container variants ───────────────────────────────────────────────

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show:   {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 22 },
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn:  fetchFeaturedProducts,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="py-10">
      <div className="container">
        {/* Header */}
        <div className="section-header mb-6">
          <div>
            <p className="section-label bg-amber-100 text-amber-700">
              <Star className="h-3 w-3 fill-amber-500" />
              Handpicked
            </p>
            <h2 className="section-title mt-1">Featured Products</h2>
          </div>
          <Link
            to="/products?isFeatured=true"
            className="flex items-center gap-1 text-sm font-semibold text-green-700 transition-all hover:gap-2 hover:text-green-800"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <span className="text-6xl">📦</span>
            <p className="mt-4 font-semibold text-foreground">No featured products yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon!</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {products.map((p) => (
              <motion.div key={p.id} variants={item}>
                <ProductCard product={p} className="h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
