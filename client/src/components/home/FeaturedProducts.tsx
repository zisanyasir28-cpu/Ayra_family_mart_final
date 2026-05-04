import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchFeaturedProducts } from '../../services/products';
import { ProductCard, ProductCardSkeleton } from '../product/ProductCard';

export function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="py-8">
      <div className="container">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Featured Products</h2>
          <Link
            to="/products?isFeatured=true"
            className="text-sm font-medium text-green-700 transition hover:text-green-800"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl">📦</span>
            <p className="mt-4 text-muted-foreground">No featured products yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
