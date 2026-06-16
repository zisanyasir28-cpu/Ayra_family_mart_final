import { HeroBanner }       from '../../components/home/HeroBanner';
import { PromoStrip }       from '../../components/home/PromoStrip';
import { BazarPanel }       from '../../components/home/BazarPanel';
import { FlashDeals }       from '../../components/home/FlashDeals';
import { FeaturedProducts } from '../../components/home/FeaturedProducts';
import { BestSellers }      from '../../components/home/BestSellers';
import { NewArrivals }      from '../../components/home/NewArrivals';
import { WhyShopWithUs }    from '../../components/home/WhyShopWithUs';
import { NewsletterBar }    from '../../components/home/NewsletterBar';
import { MarqueeBand }      from '../../components/common/MarqueeBand';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <PromoStrip />

      <MarqueeBand
        items={['Fresh today', 'Free above ৳1,500', 'Same-day delivery', 'Daily essentials', 'Curated picks']}
        banglaAccent="তাজা"
        variant="cream"
      />

      <FeaturedProducts />

      <BestSellers />

      <FlashDeals />

      <NewArrivals />

      <MarqueeBand
        items={['10% off with WELCOME10', 'Track every order', '64+ districts', '60-min express']}
        direction="right"
        variant="outline"
      />

      <BazarPanel />

      <WhyShopWithUs />

      <NewsletterBar />
    </>
  );
}
