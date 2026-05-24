import type { ApiProduct, ApiCategory } from '../types/api';

/**
 * Demo products + categories for situations where the backend API is
 * unreachable (e.g. the GitHub Pages preview build). Beautiful images,
 * realistic BDT pricing, real categories.
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
  cat('demo-personal',   'Personal Care',   'personal-care', 29),
  cat('demo-fruits',     'Fruits',          'fruits',        18),
  cat('demo-vegetables', 'Vegetables',      'vegetables',    24),
  cat('demo-dairy',      'Dairy & Eggs',    'dairy-eggs',    14),
  cat('demo-fish',       'Fish & Seafood',  'fish',           9),
  cat('demo-meat',       'Meat & Poultry',  'meat',          11),
  cat('demo-bakery',     'Bakery',          'bakery',         8),
  cat('demo-beverages',  'Beverages',       'beverages',     22),
  cat('demo-snacks',     'Snacks & Sweets', 'snacks',        16),
  cat('demo-household',  'Household',       'household',     19),
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
  const priceInPaisa   = opts.taka * 100;
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
          id: `demo-campaign-${opts.id}`,
          discountType: 'PERCENTAGE',
          discountValue: opts.campaign.discount * 100,
          endsAt: new Date(Date.now() + opts.campaign.endsInHours * 3600 * 1000).toISOString(),
        }
      : null,
    images: [
      { id: `${opts.id}-img1`, productId: opts.id, url: opts.img,  publicId: `demo/${opts.id}-1`, altText: opts.name, sortOrder: 0 },
      ...(opts.img2 ? [{ id: `${opts.id}-img2`, productId: opts.id, url: opts.img2, publicId: `demo/${opts.id}-2`, altText: opts.name, sortOrder: 1 }] : []),
    ],
    category: { id: opts.catId, name: opts.catName, slug: opts.catSlug },
  } as unknown as ApiProduct;
}

// Cloudinary optimized URL builder
const CDN = 'https://res.cloudinary.com/dzhj5tgyv/image/upload/e_trim:15/e_improve:50/q_auto:best/f_auto/c_limit,w_800';
const cld = (publicId: string) => `${CDN}/${publicId}`;

// ─── Demo product catalogue ──────────────────────────────────────────────────
// Personal Care comes FIRST so it shows on page 1

export const demoProducts: ApiProduct[] = [

  // ══ Personal Care (Cloudinary images) — PAGE 1 & 2 ══════════════════════════

  p({
    id: 'pc-vitc-serum', name: 'Vitamin C Brightening Serum', slug: 'vitamin-c-brightening-serum',
    desc: '15% stable Ethyl Ascorbic Acid paired with niacinamide and ferulic acid for maximum brightness and free-radical protection. Fades dark spots, post-acne marks, and uneven tone within 4 weeks. Lightweight water-gel texture, no stickiness.',
    taka: 890, oldTaka: 1100, unit: '30 ml dropper', stock: 29,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_5_img_7_vcf0oa'),
    featured: true,
    campaign: { discount: 18, endsInHours: 36 },
  }),
  p({
    id: 'pc-night-cream', name: 'Anti-Aging Night Repair Cream', slug: 'anti-aging-night-repair-cream',
    desc: 'Overnight cellular renewal with retinol 0.3%, peptides, and hyaluronic acid. While you sleep, this rich cream firms, plumps, and reduces fine lines. Wake up with noticeably softer, dewier skin in 4 weeks of consistent use.',
    taka: 1200, oldTaka: 1450, unit: '50 ml jar', stock: 18,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_9_img_5_yicig9'),
    featured: true,
    campaign: { discount: 17, endsInHours: 48 },
  }),
  p({
    id: 'pc-kumkumadi-oil', name: 'Kumkumadi Ayurvedic Face Oil', slug: 'kumkumadi-ayurvedic-face-oil',
    desc: 'Ancient 16-herb Ayurvedic formulation in a sesame oil base. Saffron, sandalwood, and lotus extracts restore natural radiance, reduce blemishes, and improve skin elasticity. 3–4 drops massaged nightly replace multiple serums.',
    taka: 1450, oldTaka: 1700, unit: '30 ml dropper', stock: 14,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_19_img_5_we6ltz'),
    img2: cld('page_19_img_6_sdkwtw'),
    featured: true,
    campaign: { discount: 15, endsInHours: 42 },
  }),
  p({
    id: 'pc-eye-gel', name: 'Brightening Eye Gel', slug: 'brightening-eye-gel',
    desc: 'Cooling caffeine gel that deflates under-eye puffiness within 10 minutes of application. Vitamin K and peptide complex target dark circles at the source. Patented formula penetrates the delicate eye zone without irritation.',
    taka: 980, oldTaka: 1200, unit: '15 ml', stock: 22,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_13_img_5_i0c4fn'),
    img2: cld('page_13_img_6_mfypkm'),
    featured: true,
    campaign: { discount: 18, endsInHours: 30 },
  }),
  p({
    id: 'pc-pore-serum', name: 'Pore Refining Serum', slug: 'pore-refining-serum',
    desc: '10% niacinamide + zinc PCA serum that visibly tightens enlarged pores and regulates sebum production. Clinical studies show 40% reduction in pore appearance after 4 weeks. Fragrance-free, safe for acne-prone and sensitised skin.',
    taka: 850, oldTaka: 1000, unit: '30 ml', stock: 31,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_16_img_7_th10ap'),
    featured: true,
    campaign: { discount: 12, endsInHours: 18 },
  }),
  p({
    id: 'pc-hair-oil', name: 'Aromatic Herbal Hair Oil', slug: 'aromatic-herbal-hair-oil',
    desc: 'A blend of 7 Ayurvedic herbs — amla, bhringraj, neem & sesame — in a light carrier oil. Strengthens roots, reduces breakage, and leaves hair with a healthy shine. Apply warm for best absorption.',
    taka: 380, oldTaka: 450, unit: '200 ml', stock: 55,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_1_img_8_t9mnne'),
    featured: true,
    campaign: { discount: 15, endsInHours: 24 },
  }),
  p({
    id: 'pc-sunscreen', name: 'SPF50+ Sunscreen Gel', slug: 'spf50-sunscreen-gel',
    desc: 'Broad-spectrum PA++++ protection for the harsh South Asian sun. Ultra-light aqua gel absorbs instantly — zero white cast on all skin tones. Water-resistant for 3 hours. Infused with green tea antioxidants to combat UV-induced ageing.',
    taka: 480, unit: '50 g', stock: 77,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_7_img_5_eefjvk'),
    featured: true,
    campaign: { discount: 20, endsInHours: 9 },
  }),
  p({
    id: 'pc-body-lotion', name: 'Nourishing Body Lotion', slug: 'nourishing-body-lotion',
    desc: 'Fast-absorbing, non-greasy formula with shea butter, glycerin, and ceramides. Locks in 48-hour moisture even in Bangladesh\'s humid climate. Leaves skin silky-smooth from first use. Fragrance-free, safe for all skin types.',
    taka: 580, unit: '300 ml pump', stock: 63,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_4_img_5_gczitp'),
    featured: true,
    campaign: { discount: 10, endsInHours: 12 },
  }),
  p({
    id: 'pc-lip-balm', name: 'Tinted Lip Balm Collection', slug: 'tinted-lip-balm-collection',
    desc: 'Set of 3 tinted balms in Berry, Coral, and Rose Nude. SPF20 sun protection, castor oil base for plump hydration, and buildable sheer colour. Tastes of vanilla, feels like bare lips — all day comfort.',
    taka: 280, oldTaka: 340, unit: 'set of 3', stock: 110,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_22_img_5_qfs1or'),
    img2: cld('page_22_img_6_mt5w9w'),
    campaign: { discount: 18, endsInHours: 12 },
  }),
  p({
    id: 'pc-rose-toner', name: 'Rose Water Toner', slug: 'rose-water-toner',
    desc: 'Distilled from 100 fresh Damask rose petals per bottle. Balances skin pH after cleansing, minimises redness, and preps skin for better serum absorption. Can be used as a mid-day facial mist for instant hydration & refreshment.',
    taka: 320, oldTaka: 380, unit: '150 ml spray', stock: 92,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_18_img_5_xb1nc5'),
    img2: cld('page_18_img_6_oym3kk'),
    campaign: { discount: 15, endsInHours: 10 },
  }),
  p({
    id: 'pc-charcoal-wash', name: 'Charcoal Detox Face Wash', slug: 'charcoal-detox-face-wash',
    desc: 'Activated bamboo charcoal draws out deep-seated impurities, excess sebum, and pollution particles without stripping natural moisture. Gentle enough for daily use; soap-free, SLS-free formula with aloe vera soothing base.',
    taka: 320, unit: '100 ml tube', stock: 72,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_2_img_5_jc53tm'),
    campaign: { discount: 15, endsInHours: 6 },
  }),
  p({
    id: 'pc-micellar-water', name: 'Micellar Cleansing Water', slug: 'micellar-cleansing-water',
    desc: 'No-rinse micellar water infused with pink water lily extract. Effortlessly lifts waterproof makeup, mascara, and SPF residue in a single swipe. Dermatologist-tested, zero alcohol, safe for sensitive & contact-lens wearers.',
    taka: 450, oldTaka: 520, unit: '200 ml', stock: 48,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_3_img_5_fcarh0'),
    campaign: { discount: 12, endsInHours: 8 },
  }),

  // — page 2 starts here (index 12) ————————————————————————————————————————————

  p({
    id: 'pc-neem-facewash', name: 'Neem & Tulsi Face Wash', slug: 'neem-tulsi-face-wash',
    desc: 'Classic Ayurvedic antibacterial face wash with pure neem leaf extract and holy basil (tulsi). Controls acne-causing bacteria, minimises pores, and balances oily T-zone. pH-balanced gel formula that rinses clean without tightness.',
    taka: 280, oldTaka: 350, unit: '100 ml', stock: 90,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_5_img_5_b4spke'),
    img2: cld('page_5_img_6_z7khhy'),
    campaign: { discount: 10, endsInHours: 5 },
  }),
  p({
    id: 'pc-hair-removal', name: 'Smooth Silk Hair Removal Cream', slug: 'smooth-silk-hair-removal-cream',
    desc: 'Painless hair removal in just 5–8 minutes. Enriched with almond oil and vitamin E to moisturise while it works. Results last up to 2 weeks. Gentle enough for underarms, legs, and bikini line. No razor bumps, no regrowth stubble.',
    taka: 350, oldTaka: 420, unit: '100 g tube', stock: 41,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_6_img_5_uqrbit'),
  }),
  p({
    id: 'pc-coffee-scrub', name: 'Coffee & Walnut Body Scrub', slug: 'coffee-walnut-body-scrub',
    desc: 'Finely ground arabica coffee and crushed walnut shell buff away dead skin cells and improve circulation, revealing visibly smoother skin. Caffeine content temporarily tightens the look of cellulite. Natural coconut oil base hydrates as it exfoliates.',
    taka: 650, oldTaka: 780, unit: '200 g jar', stock: 34,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_8_img_5_zyewty'),
  }),
  p({
    id: 'pc-aloe-gel', name: 'Pure Aloe Vera Soothing Gel', slug: 'pure-aloe-vera-soothing-gel',
    desc: '98% pure Aloe Barbadensis leaf gel. Instantly calms sunburn, redness, razor irritation, and insect bites. Doubles as a lightweight overnight moisturiser and after-shave soother. No added fragrance, parabens, or mineral oil.',
    taka: 240, unit: '200 ml tube', stock: 115,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_10_img_5_r8pfxu'),
  }),
  p({
    id: 'pc-fairness-cream', name: 'Whitening UV Fairness Cream', slug: 'whitening-uv-fairness-cream',
    desc: 'Dual-action day cream with SPF20 sun protection and niacinamide brightening complex. Gradually fades pigmentation, suntan, and dark patches while defending against further UV damage. Lightweight, non-sticky texture for Bangladesh\'s humid heat.',
    taka: 550, unit: '50 g tube', stock: 66,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_11_img_5_n2on8e'),
  }),
  p({
    id: 'pc-moisture-cream', name: 'Deep Moisture Face Cream', slug: 'deep-moisture-face-cream',
    desc: 'Rich, buttery cream with 5 types of hyaluronic acid for multi-depth hydration. Ceramide complex restores the skin barrier damaged by pollution and hard water. Provides 72-hour moisture lock. Perfect for dry, flaky, or dehydrated skin types.',
    taka: 720, unit: '50 ml jar', stock: 27,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_12_img_5_fq3nbm'),
  }),
  p({
    id: 'pc-day-cream', name: 'Skin Glow Day Cream', slug: 'skin-glow-day-cream',
    desc: 'Illuminating daily moisturiser with pearlescent micro-particles that give instant lit-from-within radiance. Vitamin C and turmeric extracts work over time to even skin tone. Lightweight, SPF15-infused, and non-comedogenic for all skin types.',
    taka: 680, unit: '50 ml', stock: 44,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_16_img_5_pdjldf'),
    img2: cld('page_16_img_6_nadsgs'),
  }),
  p({
    id: 'pc-acne-gel', name: 'Clear Skin Anti-Acne Gel', slug: 'clear-skin-anti-acne-gel',
    desc: 'Spot-targeting gel with 2% salicylic acid and tea tree oil. Penetrates pores to dissolve sebum plugs and reduce inflammation. Visible reduction in pimple size within 48 hours. Works on blackheads, whiteheads, and cystic spots.',
    taka: 380, unit: '30 ml gel', stock: 85,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_17_img_5_kyudbx'),
    img2: cld('page_17_img_6_vhe4hx'),
    campaign: { discount: 10, endsInHours: 5 },
  }),
  p({
    id: 'pc-body-wash', name: 'Tea Tree Body Wash', slug: 'tea-tree-body-wash',
    desc: 'Antibacterial Australian tea tree oil body wash that fights body acne, fungal issues, and odour-causing bacteria. Eucalyptus and peppermint create a refreshing cooling sensation ideal for post-workout showers in Bangladesh\'s heat.',
    taka: 420, unit: '250 ml', stock: 58,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_17_img_7_uqmyhw'),
  }),
  p({
    id: 'pc-pore-minimizer', name: 'Pore Minimizer Cream', slug: 'pore-minimizer-cream',
    desc: 'Silicone-free, blur-effect mattifying cream that visually reduces pore size and controls shine for up to 8 hours. Kaolin clay absorbs excess oil while hydration boosters ensure skin doesn\'t feel tight or dry throughout the day.',
    taka: 750, unit: '40 ml', stock: 36,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_18_img_7_qh7vgz'),
  }),

  // — page 3 starts here (index 24) ————————————————————————————————————————————

  p({
    id: 'pc-green-tea-mask', name: 'Green Tea Detox Clay Mask', slug: 'green-tea-detox-clay-mask',
    desc: 'Kaolin + bentonite clay mask supercharged with matcha green tea antioxidants and vitamin B3. Deep-cleanses pores, absorbs toxins, and leaves skin visibly clearer and plumper after each 15-minute treatment. Use 2–3 times per week.',
    taka: 560, unit: '100 ml jar', stock: 43,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_19_img_7_oz9mvh'),
  }),
  p({
    id: 'pc-intimate-wash', name: 'Intimate Hygiene Wash', slug: 'intimate-hygiene-wash',
    desc: 'Gynaecologist-tested, pH 3.8–4.5 balanced formula designed specifically for feminine intimate care. Lactic acid maintains healthy flora, prevents odour and discomfort. Free from soap, SLS, parabens, and synthetic fragrance.',
    taka: 480, unit: '150 ml', stock: 67,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_20_img_5_whtpyt'),
    img2: cld('page_20_img_6_ulejvc'),
  }),
  p({
    id: 'pc-foot-cream', name: 'Heel & Foot Repair Cream', slug: 'heel-foot-repair-cream',
    desc: '25% urea concentration softens severely cracked heels and calluses overnight. Shea butter and allantoin provide deep, long-lasting moisture to neglected dry feet. A thick, non-greasy formula — wear socks after for best results.',
    taka: 350, unit: '75 ml tube', stock: 52,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_21_img_5_jecyw0'),
    img2: cld('page_21_img_6_qet2db'),
  }),
  p({
    id: 'pc-kojic-soap', name: 'Kojic Acid Brightening Soap', slug: 'kojic-acid-brightening-soap',
    desc: 'Dual-action kojic acid + glutathione soap that inhibits melanin production at the source. 60-second lather contact time starts reversing tanning, dark elbows, knees, and uneven complexion. One bar lasts 4–6 weeks with daily use.',
    taka: 320, oldTaka: 380, unit: '135 g bar', stock: 78,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_22_img_7_o146f7'),
    campaign: { discount: 15, endsInHours: 7 },
  }),
  p({
    id: 'pc-body-butter', name: 'Rose & Shea Body Butter', slug: 'rose-shea-body-butter',
    desc: 'Whipped, velvety body butter with real shea, mango butter, and rose hip seed oil. Sinks in luxuriously without greasiness. Repairs extremely dry skin, stretch marks, and scars over time. One jar lasts 2+ months.',
    taka: 680, unit: '200 g jar', stock: 39,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_23_img_5_aqq94s'),
    img2: cld('page_23_img_6_ybc1f5'),
    featured: true,
  }),
  p({
    id: 'pc-vite-serum', name: 'Vitamin E Night Serum', slug: 'vitamin-e-night-serum',
    desc: 'High-potency vitamin E (tocopherol) serum with rosehip oil and squalane. Works overnight to repair UV and environmental damage, soften fine lines, and restore the lipid barrier. Ideal for mature, stressed, or post-acne skin.',
    taka: 780, unit: '30 ml', stock: 25,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_23_img_7_jjhiec'),
  }),
  p({
    id: 'pc-baby-rash', name: 'Baby Gentle Rash Cream', slug: 'baby-gentle-rash-cream',
    desc: 'Paediatrician-approved zinc oxide 15% rash barrier cream for infants. Forms a breathable protective layer that soothes nappy rash, heat rash, and eczema flares on delicate baby skin. No talc, no parabens, no artificial fragrance.',
    taka: 420, unit: '100 ml tube', stock: 48,
    catId: 'demo-personal', catName: 'Personal Care', catSlug: 'personal-care',
    img: cld('page_24_img_7_cnwwld'),
  }),

  // ══ Fruits ═══════════════════════════════════════════════════════════════════

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
    id: 'avocado', name: 'Hass Avocado', slug: 'hass-avocado',
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

  // — page 4 starts here (index 36) ————————————————————————————————————————————

  // ══ Vegetables ═══════════════════════════════════════════════════════════════

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

  // ══ Dairy & Eggs ═════════════════════════════════════════════════════════════

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

  // ══ Fish & Seafood ════════════════════════════════════════════════════════════

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

  // ══ Bakery ════════════════════════════════════════════════════════════════════

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

  // ══ Beverages ═════════════════════════════════════════════════════════════════

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
    taka: 720, unit: '250 g', stock: 32,
    catId: 'demo-beverages', catName: 'Beverages', catSlug: 'beverages',
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=900&q=85',
  }),

  // ══ Snacks & Sweets ═══════════════════════════════════════════════════════════

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

export const demoFeatured   = demoProducts.filter((p) => p.isFeatured);
export const demoCampaigns  = demoProducts.filter((p) => p.activeCampaign !== null);

// Exactly 20 flash-deal products (all have activeCampaign set above)
export const demoFlashDeals = demoCampaigns.slice(0, 20);
