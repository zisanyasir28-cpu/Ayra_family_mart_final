import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HeroBanner }        from '../../components/home/HeroBanner';
import { CategoryStrip }     from '../../components/home/CategoryStrip';
import { FlashDeals }        from '../../components/home/FlashDeals';
import { FeaturedProducts }  from '../../components/home/FeaturedProducts';
import { WhyShopWithUs }     from '../../components/home/WhyShopWithUs';
import { NewsletterBar }     from '../../components/home/NewsletterBar';

// ─── Promotional banner trio ──────────────────────────────────────────────────

function PromoBanners() {
  const banners = [
    {
      title:    'Fresh Vegetables',
      subtitle: 'Farm to table daily',
      cta:      'Shop Veggies',
      href:     '/products?categoryId=vegetables',
      emoji:    '🥦',
      gradient: 'from-green-600 to-emerald-500',
    },
    {
      title:    'Daily Dairy',
      subtitle: 'Milk, curd, cheese & more',
      cta:      'Shop Dairy',
      href:     '/products?categoryId=dairy',
      emoji:    '🥛',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      title:    'Snacks & Beverages',
      subtitle: 'For every mood',
      cta:      'Shop Now',
      href:     '/products?categoryId=snacks',
      emoji:    '🍿',
      gradient: 'from-orange-500 to-amber-400',
    },
  ] as const;

  return (
    <section className="py-8">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {banners.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 180, damping: 22 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={b.href}
                className={`flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r p-5 shadow-card transition-shadow hover:shadow-card-hover ${b.gradient}`}
              >
                <div className="text-white">
                  <div className="text-lg font-extrabold leading-tight">{b.title}</div>
                  <div className="mt-0.5 text-xs text-white/75">{b.subtitle}</div>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30">
                    {b.cta} →
                  </div>
                </div>
                <div className="shrink-0 text-5xl leading-none opacity-90">{b.emoji}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App download banner ──────────────────────────────────────────────────────

function AppDownloadBanner() {
  return (
    <section className="py-8">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 sm:flex-row"
        >
          {/* Background circles */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-green-500/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/3 h-36 w-36 rounded-full bg-teal-500/10 blur-2xl" />

          <div className="relative text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80 mb-3">
              📲 Coming Soon
            </div>
            <h3 className="text-2xl font-extrabold text-white">Shop on the go!</h3>
            <p className="mt-1.5 text-sm text-white/65">
              Download our app and get <strong className="text-white">৳50 off</strong> your first order.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
              {[
                { icon: '🍎', platform: 'App Store',    sub: 'Download on the' },
                { icon: '▶',  platform: 'Google Play',  sub: 'Get it on'       },
              ].map(({ icon, platform, sub }) => (
                <a
                  key={platform}
                  href="#"
                  className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/18"
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] text-white/60">{sub}</div>
                    <div className="font-bold">{platform}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="relative shrink-0 text-[96px] leading-none opacity-75 select-none">
            📱
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryStrip />
      <PromoBanners />
      <FlashDeals />
      <FeaturedProducts />
      <WhyShopWithUs />
      <AppDownloadBanner />
      <NewsletterBar />
    </>
  );
}
