import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Star, Truck } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-teal-500 py-16 md:py-24">
      {/* Animated pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width:  `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              top:    `${10 + i * 10}%`,
              left:   `${5 + i * 12}%`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
          {/* Text */}
          <div className="max-w-xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                Bangladesh's Most Trusted Family Mart
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              Fresh Groceries
              <br />
              <span className="text-yellow-300">Delivered Fast</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-lg leading-relaxed text-white/90"
            >
              Shop from thousands of products — fresh produce, household essentials,
              electronics & more. Free delivery above ৳999.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 shadow-lg transition hover:bg-white/90 hover:shadow-xl active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?deals=true"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
              >
                View Deals
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start"
            >
              {[
                { icon: Truck, text: 'Free delivery above ৳999' },
                { icon: Star, text: '4.8★ rated service' },
                { icon: ShoppingBag, text: '50,000+ products' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-white/80">
                  <Icon className="h-3.5 w-3.5" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden shrink-0 lg:block"
          >
            <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
              <span className="text-[140px]">🛒</span>
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 shadow-lg text-3xl"
              >
                🥦
              </motion.div>
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-400 shadow-lg text-3xl"
              >
                🍎
              </motion.div>
              <motion.div
                animate={{ y: [-5, 10, -5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-1/3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400 shadow-lg text-2xl"
              >
                🥛
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
