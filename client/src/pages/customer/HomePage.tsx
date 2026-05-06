import { HeroBanner }       from '../../components/home/HeroBanner';
import { CategoryStrip }    from '../../components/home/CategoryStrip';
import { FlashDeals }       from '../../components/home/FlashDeals';
import { FeaturedProducts } from '../../components/home/FeaturedProducts';
import { WhyShopWithUs }    from '../../components/home/WhyShopWithUs';
import { NewsletterBar }    from '../../components/home/NewsletterBar';
import { MarqueeBand }      from '../../components/common/MarqueeBand';

export default function HomePage() {
  return (
    <>
      <HeroBanner />

      <MarqueeBand
        items={['Fresh today', 'Free above ৳999', 'Same-day delivery', 'Daily essentials', 'Curated picks']}
        banglaAccent="তাজা"
        variant="cream"
      />

      <FeaturedProducts />

      <FlashDeals />

      <MarqueeBand
        items={['10% off with WELCOME10', 'Track every order', '64+ districts', '60-min express']}
        direction="right"
        variant="outline"
      />

      <CategoryStrip />

      <WhyShopWithUs />

      <NewsletterBar />
    </>
  );
}
