import { HeroBanner } from '../../components/home/HeroBanner';
import { CategoryStrip } from '../../components/home/CategoryStrip';
import { FlashDeals } from '../../components/home/FlashDeals';
import { FeaturedProducts } from '../../components/home/FeaturedProducts';
import { WhyShopWithUs } from '../../components/home/WhyShopWithUs';
import { NewsletterBar } from '../../components/home/NewsletterBar';

// App download banner (placeholder)
function AppDownloadBanner() {
  return (
    <section className="py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-10 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Shop on the go!</h3>
            <p className="mt-1 text-sm text-white/70">
              Download our app and get ৳50 off your first order.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20"
              >
                <span className="text-xl">🍎</span>
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-70">Download on the</div>
                  <div className="font-bold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20"
              >
                <span className="text-xl">▶</span>
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-70">Get it on</div>
                  <div className="font-bold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
          <div className="shrink-0 text-8xl opacity-80">📱</div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryStrip />
      <FlashDeals />
      <FeaturedProducts />
      <WhyShopWithUs />
      <AppDownloadBanner />
      <NewsletterBar />
    </>
  );
}
