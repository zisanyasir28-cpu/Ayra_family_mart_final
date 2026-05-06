import type { ApiProduct, ApiCategory } from '../types/api';

/**
 * Demo products + categories for situations where the backend API is
 * unreachable (e.g. the GitHub Pages preview build). Beautiful Unsplash
 * images, realistic BDT pricing, real categories.
 *
 * Used as a fallback in services/products.ts and services/categories.ts.
 */

const cat = (id: string, name: string, slug: string, count: number): ApiCategory => ({
  id, name, slug, description: null, imageUrl: null,
  sortOrder: 0, isActive: true,
  _count: { products: count },
  children: [],
});

export const demoCategories: ApiCategory[] = [
  cat('demo-fruits',     'Fruits',          'fruits',        18),
  cat('demo-vegetables', 'Vegetables',      'vegetables',    24),
  cat('demo-dairy',      'Dairy & Eggs',    'dairy-eggs',    14),
  cat('demo-fish',       'Fish & Seafood',  'fish',           9),
  cat('demo-meat',       'Meat & Poultry',  'meat',          11),
  cat('demo-bakery',     'Bakery',          'bakery',         8),
  cat('demo-beverages',  'Beverages',       'beverages',     22),
  cat('demo-snacks',     'Snacks & Sweets', 'snacks',        16),
  cat('demo-household',  'Household',       'household',     19),
  cat('demo-personal',   'Personal Care',   'personal-care', 12),
];

// Helper to build a demo product
function p(opts: {
  id:        string;
  name:      string;
  slug:      string;
  desc:      string;
  taka:      number;
  oldTaka?:  number;
  unit:      string;
  stock:     number;
  catId:     string;
  catName:   string;
  catSlug:   string;
  img:       string;
  img2?:     string;
  featured?: boolean;
  campaign?: { discount: number; endsInHours: number };
}): ApiProduct {
  const priceInPaisa  = opts.taka * 100;
  const compareInPaisa = opts.oldTaka ? opts.oldTaka * 100 : null;
  const effectiveInPaisa = opts.campaign
    ? Math.round(priceInPaisa * (1 - opts.campaign.discount / 100))
    : priceInPaisa;

  return {
    id: opts.id,
    name: opts.name,
    slug: opts.slug,
    description: opts.desc,
    sku: opts.id.toUpperCase(),
    barcode: null,
    priceInPaisa,
    comparePriceInPaisa: compareInPaisa,
    costPriceInPaisa: null,
    stockQuantity: opts.stock,
    lowStockThreshold: 5,
    unit: opts.unit,
    weight: null,
    status: 'ACTIVE',
    categoryId: opts.catId,
    brandId: null,
    tags: [],
    isFeatured: opts.featured ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    effectivePriceInPaisa: effectiveInPaisa,
    activeCampaign: opts.campaign
      ? {
          id: 'demo-campaign',
          discountType: 'PERCENTAGE',
          discountValue: opts.campaign.discount * 100,
          endsAt: new Date(Date.now() + opts.campaign.endsInHours * 3600 * 1000).toISOString(),
        }
      : null,
    images: [
      { id: `${opts.id}-img1`, productId: opts.id, url: opts.img,                publicId: `demo/${opts.id}-1`, altText: opts.name, sortOrder: 0 },
      ...(opts.img2 ? [{ id: `${opts.id}-img2`, productId: opts.id, url: opts.img2, publicId: `demo/${opts.id}-2`, altText: opts.name, sortOrder: 1 }] : []),
    ],
    category: { id: opts.catId, name: opts.catName, slug: opts.catSlug },
  } as unknown as ApiProduct;
}

// ─── Demo product catalogue ──────────────────────────────────────────────────

export const demoProducts: ApiProduct[] = [
  p({
    id: 'mango', name: 'Alphonso Mango', slug: 'alphonso-mango',
    desc: 'King of mangoes — sweet, golden flesh from Rajshahi farms. The taste of summer in every bite.',
    taka: 450, oldTaka: 540, unit: '1 kg', stock: 24,
    catId: 'demo-fruits', catName: 'Fruits', catSlug: 'fruits',
    img: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=900&q=85',
    img2: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=900&q=85',
    featured: true,
    campaign: { discount: 15, endsInHours: 6 },
  }),
  p({
    id: 'avocado', name: 'Hass Avocado',  slug: 'hass-avocado',
    desc: 'Buttery, ripe-to-eat avocados. Perfect for toast, smoothies, and salads.',
    taka: 180, unit: 'each (≈220g)', stock: 60,
    catId: 'demo-fruits', catName: 'Fruits', catSlug: 'fruits',
    img: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=900&q=85',
    img2: 'https://images.unsplash.com/photo-1632933898365-15969afe8014?w=900&q=85',
    featured: true,
  }),
  p({
    id: 'strawberry', name: 'Fresh Strawberries', slug: 'fresh-strawberries',
    desc: 'Hand-picked, sweet-tart strawberries from local greenhouses. No pesticides.',
    taka: 320, oldTaka: 380, unit: '250 g punnet', stock: 18,
    catId: 'demo-fruits', catName: 'Fruits', catSlug: 'fruits',
    img: 'https://images.unsplash.com/photo-1543528176-61b239494933?w=900&q=85',
    featured: true,
    campaign: { discount: 20, endsInHours: 4 },
  }),
  p({
    id: 'broccoli', name: 'Organic Broccoli', slug: 'organic-broccoli',
    desc: 'Bright green florets, certified organic. High in vitamin C, perfect for stir-fry.',
    taka: 140, unit: '500 g', stock: 42,
    catId: 'demo-vegetables', catName: 'Vegetables', catSlug: 'vegetables',
    img: 'https://images.unsplash.com/photo-1628773822987-2b388e84cc16?w=900&q=85',
  }),
  p({
    id: 'tomato-cherry', name: 'Cherry Tomatoes', slug: 'cherry-tomatoes',
    desc: 'Sweet, ruby-red cherry tomatoes on the vine. Excellent for salads.',
    taka: 95, oldTaka: 120, unit: '300 g', stock: 88,
    catId: 'demo-vegetables', catName: 'Vegetables', catSlug: 'vegetables',
    img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&q=85',
    featured: true,
  }),
  p({
    id: 'spinach', name: 'Baby Spinach', slug: 'baby-spinach',
    desc: 'Tender, washed-and-ready baby spinach leaves. Bursting with iron.',
    taka: 80, unit: '200 g pack', stock: 120,
    catId: 'demo-vegetables', catName: 'Vegetables', catSlug: 'vegetables',
    img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900&q=85',
  }),
  p({
    id: 'milk', name: 'Farm Fresh Milk', slug: 'farm-fresh-milk',
    desc: 'Pasteurised whole milk from grass-fed cows. Delivered the morning it was bottled.',
    taka: 95, unit: '1 litre', stock: 200,
    catId: 'demo-dairy', catName: 'Dairy & Eggs', catSlug: 'dairy-eggs',
    img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=900&q=85',
    featured: true,
  }),
  p({
    id: 'eggs', name: 'Free-range Brown Eggs', slug: 'free-range-eggs',
    desc: 'Pasture-raised brown eggs, dozen. Rich golden yolks, omega-3 boost.',
    taka: 195, oldTaka: 220, unit: 'dozen (12)', stock: 80,
    catId: 'demo-dairy', catName: 'Dairy & Eggs', catSlug: 'dairy-eggs',
    img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=900&q=85',
    campaign: { discount: 12, endsInHours: 8 },
  }),
  p({
    id: 'butter', name: 'Cultured Butter', slug: 'cultured-butter',
    desc: 'Slow-churned, lightly salted European-style butter. The kind you can spread on warm bread alone.',
    taka: 285, unit: '227 g block', stock: 35,
    catId: 'demo-dairy', catName: 'Dairy & Eggs', catSlug: 'dairy-eggs',
    img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=900&q=85',
  }),
  p({
    id: 'hilsa', name: 'Padma Hilsa', slug: 'padma-hilsa',
    desc: 'The national fish — caught from the Padma, scaled and cleaned. The pride of every Bengali table.',
    taka: 1450, oldTaka: 1650, unit: '1 kg whole', stock: 8,
    catId: 'demo-fish', catName: 'Fish & Seafood', catSlug: 'fish',
    img: 'https://images.unsplash.com/photo-1535596914280-3c5cd16b9d50?w=900&q=85',
    featured: true,
    campaign: { discount: 10, endsInHours: 12 },
  }),
  p({
    id: 'shrimp', name: 'Tiger Prawns', slug: 'tiger-prawns',
    desc: 'XL Bay-of-Bengal tiger prawns. Deveined, ready for the wok.',
    taka: 980, unit: '500 g', stock: 22,
    catId: 'demo-fish', catName: 'Fish & Seafood', catSlug: 'fish',
    img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=900&q=85',
  }),
  p({
    id: 'sourdough', name: 'Sourdough Loaf', slug: 'sourdough-loaf',
    desc: 'Naturally leavened, slow-fermented sourdough. Crackling crust, open crumb.',
    taka: 220, unit: '600 g loaf', stock: 28,
    catId: 'demo-bakery', catName: 'Bakery', catSlug: 'bakery',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=85',
    featured: true,
  }),
  p({
    id: 'cake', name: 'Chocolate Truffle Cake', slug: 'chocolate-truffle-cake',
    desc: 'Eight layers of dark chocolate sponge with whipped ganache. Made fresh daily.',
    taka: 1250, oldTaka: 1450, unit: '1 kg', stock: 6,
    catId: 'demo-bakery', catName: 'Bakery', catSlug: 'bakery',
    img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85',
    campaign: { discount: 15, endsInHours: 18 },
  }),
  p({
    id: 'oj', name: 'Cold-Pressed Orange Juice', slug: 'cold-pressed-orange-juice',
    desc: 'Just oranges. Nothing else. Cold-pressed this morning, bottled now.',
    taka: 285, unit: '1 litre', stock: 45,
    catId: 'demo-beverages', catName: 'Beverages', catSlug: 'beverages',
    img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=900&q=85',
    featured: true,
  }),
  p({
    id: 'coffee', name: 'Single-Origin Coffee', slug: 'single-origin-coffee',
    desc: 'Whole beans from Sylhet hills. Light roast, notes of stone fruit and honey.',
    taka: 720, unit: '250 g',  stock: 32,
    catId: 'demo-beverages', catName: 'Beverages', catSlug: 'beverages',
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=900&q=85',
  }),
  p({
    id: 'chocolate', name: 'Belgian Dark Chocolate', slug: 'belgian-dark-chocolate',
    desc: '70% cocoa, single-origin Ghana beans. Wrapped by hand in Antwerp.',
    taka: 480, oldTaka: 560, unit: '100 g bar', stock: 64,
    catId: 'demo-snacks', catName: 'Snacks & Sweets', catSlug: 'snacks',
    img: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=900&q=85',
    campaign: { discount: 14, endsInHours: 9 },
    featured: true,
  }),
  p({
    id: 'pistachio', name: 'Roasted Pistachios', slug: 'roasted-pistachios',
    desc: 'Iranian pistachios, roasted in their shells with a whisper of sea salt.',
    taka: 650, unit: '250 g', stock: 38,
    catId: 'demo-snacks', catName: 'Snacks & Sweets', catSlug: 'snacks',
    img: 'https://images.unsplash.com/photo-1600189261867-3a0e1a571ce5?w=900&q=85',
  }),
];

// ─── Helpers used by services ────────────────────────────────────────────────

export const demoFeatured  = demoProducts.filter((p) => p.isFeatured);
export const demoCampaigns = demoProducts.filter((p) => p.activeCampaign !== null);
