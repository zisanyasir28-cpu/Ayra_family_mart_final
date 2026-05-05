/**
 * Ayra Family Mart — Database Seed
 *
 * Creates: categories, brands, products, product images
 * Run: npx ts-node prisma/seed.ts   (or use `npm run db:seed`)
 */

import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Unsplash placeholder images (stable, free, no signup) ───────────────────

const IMG = {
  // Fruits & Veg
  apple:      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
  banana:     'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
  mango:      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
  tomato:     'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&q=80',
  potato:     'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  broccoli:   'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
  carrot:     'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
  spinach:    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  // Dairy
  milk:       'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  eggs:       'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
  butter:     'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
  cheese:     'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80',
  yogurt:     'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  // Meat & Fish
  chicken:    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80',
  fish:       'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
  shrimp:     'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80',
  // Bakery
  bread:      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  cake:       'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
  // Beverages
  juice:      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80',
  water:      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80',
  tea:        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80',
  coffee:     'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80',
  // Snacks
  chips:      'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400&q=80',
  biscuit:    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  chocolate:  'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&q=80',
  // Household
  soap:       'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&q=80',
  detergent:  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80',
  // Personal care
  shampoo:    'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80',
  toothpaste: 'https://images.unsplash.com/photo-1559638564-a89a9ef2cb82?w=400&q=80',
  // Baby
  babyFood:   'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80',
} as const;

type ImgKey = keyof typeof IMG;

// ─── Helper to build a product image record ───────────────────────────────────

function img(key: ImgKey, alt: string, order = 0) {
  return {
    url:      IMG[key],
    publicId: `seed/${key}-${Date.now()}`,
    altText:  alt,
    sortOrder: order,
  };
}

// ─── Main seed function ───────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed...');

  // ── Categories ──────────────────────────────────────────────────────────────

  const [
    catFruits,
    catVegetables,
    catDairy,
    catMeat,
    catFish,
    catBakery,
    catBeverages,
    catSnacks,
    catHousehold,
    catPersonalCare,
    catBaby,
  ] = await Promise.all([
    prisma.category.upsert({
      where:  { slug: 'fruits' },
      update: {},
      create: { name: 'Fruits', slug: 'fruits', description: 'Fresh seasonal fruits', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where:  { slug: 'vegetables' },
      update: {},
      create: { name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh vegetables daily', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where:  { slug: 'dairy-eggs' },
      update: {},
      create: { name: 'Dairy & Eggs', slug: 'dairy-eggs', description: 'Milk, eggs, cheese and more', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where:  { slug: 'meat' },
      update: {},
      create: { name: 'Meat & Poultry', slug: 'meat', description: 'Fresh chicken, beef, mutton', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where:  { slug: 'fish' },
      update: {},
      create: { name: 'Fish & Seafood', slug: 'fish', description: 'Fresh river and sea fish', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where:  { slug: 'bakery' },
      update: {},
      create: { name: 'Bakery & Bread', slug: 'bakery', description: 'Freshly baked breads and pastries', sortOrder: 6 },
    }),
    prisma.category.upsert({
      where:  { slug: 'beverages' },
      update: {},
      create: { name: 'Beverages', slug: 'beverages', description: 'Juices, water, tea and coffee', sortOrder: 7 },
    }),
    prisma.category.upsert({
      where:  { slug: 'snacks' },
      update: {},
      create: { name: 'Snacks & Sweets', slug: 'snacks', description: 'Chips, biscuits, chocolates', sortOrder: 8 },
    }),
    prisma.category.upsert({
      where:  { slug: 'household' },
      update: {},
      create: { name: 'Household & Cleaning', slug: 'household', description: 'Detergents, cleaners and more', sortOrder: 9 },
    }),
    prisma.category.upsert({
      where:  { slug: 'personal-care' },
      update: {},
      create: { name: 'Personal Care', slug: 'personal-care', description: 'Shampoo, skincare, toiletries', sortOrder: 10 },
    }),
    prisma.category.upsert({
      where:  { slug: 'baby' },
      update: {},
      create: { name: 'Baby & Kids', slug: 'baby', description: 'Baby food, diapers and care products', sortOrder: 11 },
    }),
  ]);

  console.log('  ✓ Categories created');

  // ── Products ─────────────────────────────────────────────────────────────────

  const products = [
    // ── Fruits ──────────────────────────────────────────────────────────────
    {
      name: 'Red Apple (Premium)',
      slug: 'red-apple-premium',
      sku: 'FRT-001',
      description: 'Crisp, sweet and juicy red apples sourced from the hills. Rich in fibre and antioxidants. Perfect for snacking and cooking.',
      priceInPaisa: 18000,        // ৳180
      comparePriceInPaisa: 22000, // ৳220
      stockQuantity: 120,
      unit: '1 kg',
      categoryId: catFruits.id,
      isFeatured: true,
      tags: ['fresh', 'fruit', 'apple', 'imported'],
      status: ProductStatus.ACTIVE,
      images: [img('apple', 'Fresh red apples')],
    },
    {
      name: 'Fresh Banana (Deshi)',
      slug: 'fresh-banana-deshi',
      sku: 'FRT-002',
      description: 'Sweet local Bangladeshi bananas, rich in potassium and vitamins. Great for breakfast or post-workout.',
      priceInPaisa: 5000,
      stockQuantity: 200,
      unit: '1 dozen',
      categoryId: catFruits.id,
      isFeatured: false,
      tags: ['fresh', 'fruit', 'banana', 'local'],
      status: ProductStatus.ACTIVE,
      images: [img('banana', 'Fresh yellow bananas')],
    },
    {
      name: 'Alphonso Mango (Imported)',
      slug: 'alphonso-mango-imported',
      sku: 'FRT-003',
      description: 'The king of mangoes — sweet, creamy Alphonso mangoes from India. Limited seasonal availability.',
      priceInPaisa: 45000,
      comparePriceInPaisa: 55000,
      stockQuantity: 40,
      unit: '1 kg',
      categoryId: catFruits.id,
      isFeatured: true,
      tags: ['fresh', 'mango', 'premium', 'imported', 'seasonal'],
      status: ProductStatus.ACTIVE,
      images: [img('mango', 'Ripe Alphonso mangoes')],
    },

    // ── Vegetables ───────────────────────────────────────────────────────────
    {
      name: 'Fresh Tomatoes',
      slug: 'fresh-tomatoes',
      sku: 'VEG-001',
      description: 'Firm, ripe tomatoes sourced fresh from local farms. Ideal for salads, curries and chutneys.',
      priceInPaisa: 6000,
      stockQuantity: 300,
      unit: '500 g',
      categoryId: catVegetables.id,
      isFeatured: false,
      tags: ['fresh', 'vegetable', 'tomato', 'local'],
      status: ProductStatus.ACTIVE,
      images: [img('tomato', 'Fresh red tomatoes')],
    },
    {
      name: 'Premium Broccoli',
      slug: 'premium-broccoli',
      sku: 'VEG-002',
      description: 'Bright green, nutrient-packed broccoli crowns. High in vitamin C and fibre. Ideal for stir-fry and steaming.',
      priceInPaisa: 9000,
      comparePriceInPaisa: 12000,
      stockQuantity: 80,
      unit: '500 g',
      categoryId: catVegetables.id,
      isFeatured: true,
      tags: ['fresh', 'vegetable', 'broccoli', 'healthy'],
      status: ProductStatus.ACTIVE,
      images: [img('broccoli', 'Fresh broccoli florets')],
    },
    {
      name: 'Himalayan Red Potato',
      slug: 'himalayan-red-potato',
      sku: 'VEG-003',
      description: 'Firm red-skinned potatoes with a buttery, creamy taste. Great for boiling, mashing and roasting.',
      priceInPaisa: 4500,
      stockQuantity: 500,
      unit: '1 kg',
      categoryId: catVegetables.id,
      isFeatured: false,
      tags: ['potato', 'vegetable', 'fresh', 'local'],
      status: ProductStatus.ACTIVE,
      images: [img('potato', 'Red skinned potatoes')],
    },
    {
      name: 'Baby Carrots (Washed)',
      slug: 'baby-carrots-washed',
      sku: 'VEG-004',
      description: 'Ready-to-eat washed baby carrots. Great for snacking, dipping and salads. Packed with beta-carotene.',
      priceInPaisa: 7500,
      comparePriceInPaisa: 9000,
      stockQuantity: 60,
      unit: '250 g pack',
      categoryId: catVegetables.id,
      isFeatured: false,
      tags: ['carrot', 'vegetable', 'snack', 'healthy'],
      status: ProductStatus.ACTIVE,
      images: [img('carrot', 'Fresh baby carrots')],
    },
    {
      name: 'Organic Spinach',
      slug: 'organic-spinach',
      sku: 'VEG-005',
      description: 'Certified organic spinach leaves, freshly harvested. Ideal for salads, smoothies and sautéeing.',
      priceInPaisa: 8000,
      stockQuantity: 45,
      unit: '200 g bundle',
      categoryId: catVegetables.id,
      isFeatured: true,
      tags: ['organic', 'spinach', 'leafy', 'healthy'],
      status: ProductStatus.ACTIVE,
      images: [img('spinach', 'Fresh organic spinach leaves')],
    },

    // ── Dairy & Eggs ─────────────────────────────────────────────────────────
    {
      name: 'Fresh Full-Cream Milk',
      slug: 'fresh-full-cream-milk',
      sku: 'DAI-001',
      description: 'Fresh, pasteurised full-cream milk. Rich in calcium and protein. Sourced from grass-fed cows.',
      priceInPaisa: 6800,
      stockQuantity: 250,
      unit: '1 litre',
      categoryId: catDairy.id,
      isFeatured: true,
      tags: ['milk', 'dairy', 'fresh', 'calcium'],
      status: ProductStatus.ACTIVE,
      images: [img('milk', 'Fresh full cream milk bottle')],
    },
    {
      name: 'Farm Eggs (Deshi)',
      slug: 'farm-eggs-deshi',
      sku: 'DAI-002',
      description: 'Free-range farm eggs from healthy hens raised in open spaces. Rich in protein and omega-3.',
      priceInPaisa: 14000,
      comparePriceInPaisa: 16000,
      stockQuantity: 180,
      unit: 'Pack of 12',
      categoryId: catDairy.id,
      isFeatured: false,
      tags: ['eggs', 'dairy', 'farm', 'fresh', 'protein'],
      status: ProductStatus.ACTIVE,
      images: [img('eggs', 'Farm fresh eggs in carton')],
    },
    {
      name: 'Unsalted Butter',
      slug: 'unsalted-butter-200g',
      sku: 'DAI-003',
      description: 'Creamy unsalted butter made from fresh cream. Perfect for baking, cooking and spreading.',
      priceInPaisa: 19000,
      stockQuantity: 70,
      unit: '200 g',
      categoryId: catDairy.id,
      isFeatured: false,
      tags: ['butter', 'dairy', 'baking', 'cooking'],
      status: ProductStatus.ACTIVE,
      images: [img('butter', 'Block of unsalted butter')],
    },
    {
      name: 'Greek Yogurt (Plain)',
      slug: 'greek-yogurt-plain',
      sku: 'DAI-004',
      description: 'Thick, creamy Greek yogurt with live cultures. High in protein and probiotics. Low in sugar.',
      priceInPaisa: 18500,
      stockQuantity: 90,
      unit: '400 g',
      categoryId: catDairy.id,
      isFeatured: true,
      tags: ['yogurt', 'dairy', 'probiotic', 'healthy'],
      status: ProductStatus.ACTIVE,
      images: [img('yogurt', 'Plain Greek yogurt in jar')],
    },

    // ── Meat & Poultry ────────────────────────────────────────────────────────
    {
      name: 'Fresh Broiler Chicken',
      slug: 'fresh-broiler-chicken',
      sku: 'MEA-001',
      description: 'Fresh whole broiler chicken, cleaned and ready to cook. Sourced from certified farms with no hormones.',
      priceInPaisa: 24000,
      comparePriceInPaisa: 28000,
      stockQuantity: 60,
      unit: '1 kg (whole)',
      categoryId: catMeat.id,
      isFeatured: true,
      tags: ['chicken', 'meat', 'fresh', 'protein'],
      status: ProductStatus.ACTIVE,
      images: [img('chicken', 'Whole fresh broiler chicken')],
    },

    // ── Fish & Seafood ────────────────────────────────────────────────────────
    {
      name: 'Hilsha Fish (Padma)',
      slug: 'hilsha-fish-padma',
      sku: 'FSH-001',
      description: 'Fresh Padma Hilsha (Ilish) — the national fish of Bangladesh. Rich, oily and full of flavour.',
      priceInPaisa: 85000,
      comparePriceInPaisa: 95000,
      stockQuantity: 20,
      unit: 'Per kg',
      categoryId: catFish.id,
      isFeatured: true,
      tags: ['hilsha', 'ilish', 'fish', 'padma', 'premium'],
      status: ProductStatus.ACTIVE,
      images: [img('fish', 'Fresh Hilsha fish')],
    },
    {
      name: 'Tiger Prawns (XL)',
      slug: 'tiger-prawns-xl',
      sku: 'FSH-002',
      description: 'Extra-large tiger prawns from the Bay of Bengal. Deveined and cleaned. Great for grilling and curry.',
      priceInPaisa: 65000,
      stockQuantity: 30,
      unit: '500 g',
      categoryId: catFish.id,
      isFeatured: false,
      tags: ['prawn', 'shrimp', 'seafood', 'fresh'],
      status: ProductStatus.ACTIVE,
      images: [img('shrimp', 'Fresh tiger prawns')],
    },

    // ── Bakery ────────────────────────────────────────────────────────────────
    {
      name: 'Whole Wheat Bread',
      slug: 'whole-wheat-bread',
      sku: 'BAK-001',
      description: 'Freshly baked whole wheat bread, high in fibre and nutrients. Made with 100% whole grain flour.',
      priceInPaisa: 5500,
      stockQuantity: 100,
      unit: '400 g loaf',
      categoryId: catBakery.id,
      isFeatured: false,
      tags: ['bread', 'wheat', 'whole-grain', 'bakery'],
      status: ProductStatus.ACTIVE,
      images: [img('bread', 'Sliced whole wheat bread loaf')],
    },
    {
      name: 'Chocolate Birthday Cake',
      slug: 'chocolate-birthday-cake',
      sku: 'BAK-002',
      description: 'Moist, rich chocolate cake with ganache frosting. Perfect for birthdays and celebrations. Made fresh daily.',
      priceInPaisa: 85000,
      stockQuantity: 10,
      unit: '1 kg',
      categoryId: catBakery.id,
      isFeatured: true,
      tags: ['cake', 'chocolate', 'celebration', 'bakery'],
      status: ProductStatus.ACTIVE,
      images: [img('cake', 'Rich chocolate birthday cake')],
    },

    // ── Beverages ─────────────────────────────────────────────────────────────
    {
      name: 'Tropicana Orange Juice',
      slug: 'tropicana-orange-juice',
      sku: 'BEV-001',
      description: 'Pure squeezed orange juice with pulp. No added sugar, no preservatives. 100% natural.',
      priceInPaisa: 22000,
      comparePriceInPaisa: 25000,
      stockQuantity: 150,
      unit: '1 litre',
      categoryId: catBeverages.id,
      isFeatured: true,
      tags: ['juice', 'orange', 'beverage', 'healthy'],
      status: ProductStatus.ACTIVE,
      images: [img('juice', 'Fresh orange juice carton')],
    },
    {
      name: 'Mum Drinking Water',
      slug: 'mum-drinking-water-500ml',
      sku: 'BEV-002',
      description: 'Pure drinking water processed by multi-stage filtration. Safe for all ages including infants.',
      priceInPaisa: 2000,
      stockQuantity: 500,
      unit: '500 ml bottle',
      categoryId: catBeverages.id,
      isFeatured: false,
      tags: ['water', 'beverage', 'drinking', 'pure'],
      status: ProductStatus.ACTIVE,
      images: [img('water', 'Clear drinking water bottle')],
    },
    {
      name: 'Tetley Green Tea (25 bags)',
      slug: 'tetley-green-tea-25-bags',
      sku: 'BEV-003',
      description: 'Premium green tea bags with natural antioxidants. Light, fresh flavour. Ideal for morning and afternoon.',
      priceInPaisa: 14500,
      stockQuantity: 120,
      unit: 'Pack of 25',
      categoryId: catBeverages.id,
      isFeatured: false,
      tags: ['tea', 'green-tea', 'healthy', 'antioxidant'],
      status: ProductStatus.ACTIVE,
      images: [img('tea', 'Green tea bags box')],
    },
    {
      name: 'Nescafé Classic Coffee',
      slug: 'nescafe-classic-coffee-200g',
      sku: 'BEV-004',
      description: 'Rich, full-bodied instant coffee blend. Made from 100% arabica beans. Perfect for a morning boost.',
      priceInPaisa: 46000,
      stockQuantity: 85,
      unit: '200 g jar',
      categoryId: catBeverages.id,
      isFeatured: true,
      tags: ['coffee', 'nescafe', 'instant', 'morning'],
      status: ProductStatus.ACTIVE,
      images: [img('coffee', 'Nescafe classic coffee jar')],
    },

    // ── Snacks ────────────────────────────────────────────────────────────────
    {
      name: "Lays Classic Chips",
      slug: 'lays-classic-chips',
      sku: 'SNK-001',
      description: "Crunchy, golden potato chips with light salt flavour. America's favourite snack brand.",
      priceInPaisa: 5500,
      comparePriceInPaisa: 6000,
      stockQuantity: 200,
      unit: '90 g pack',
      categoryId: catSnacks.id,
      isFeatured: false,
      tags: ['chips', 'lays', 'snack', 'crispy'],
      status: ProductStatus.ACTIVE,
      images: [img('chips', 'Lays potato chips packet')],
    },
    {
      name: 'Digestive Biscuits',
      slug: 'digestive-biscuits-mcvities',
      sku: 'SNK-002',
      description: 'Classic whole wheat digestive biscuits. Perfect with tea or as a snack. High in fibre.',
      priceInPaisa: 9500,
      stockQuantity: 180,
      unit: '400 g pack',
      categoryId: catSnacks.id,
      isFeatured: false,
      tags: ['biscuit', 'digestive', 'wheat', 'snack'],
      status: ProductStatus.ACTIVE,
      images: [img('biscuit', 'Digestive biscuits pack')],
    },
    {
      name: 'Ferrero Rocher (Box of 16)',
      slug: 'ferrero-rocher-box-16',
      sku: 'SNK-003',
      description: 'Premium Italian chocolate with whole hazelnut wrapped in crisp wafer shell. Perfect gift.',
      priceInPaisa: 125000,
      comparePriceInPaisa: 140000,
      stockQuantity: 25,
      unit: 'Box of 16',
      categoryId: catSnacks.id,
      isFeatured: true,
      tags: ['chocolate', 'ferrero', 'premium', 'gift'],
      status: ProductStatus.ACTIVE,
      images: [img('chocolate', 'Ferrero Rocher chocolate box')],
    },

    // ── Household ─────────────────────────────────────────────────────────────
    {
      name: 'Dettol Liquid Soap (500ml)',
      slug: 'dettol-liquid-soap-500ml',
      sku: 'HSD-001',
      description: 'Antibacterial liquid hand soap that kills 99.9% of bacteria. Dermatologically tested and gentle on skin.',
      priceInPaisa: 28000,
      stockQuantity: 130,
      unit: '500 ml pump',
      categoryId: catHousehold.id,
      isFeatured: false,
      tags: ['dettol', 'soap', 'antibacterial', 'hygiene'],
      status: ProductStatus.ACTIVE,
      images: [img('soap', 'Dettol liquid soap pump')],
    },
    {
      name: 'Surf Excel Detergent Powder',
      slug: 'surf-excel-detergent-2kg',
      sku: 'HSD-002',
      description: "Surf Excel's advanced formula removes tough stains in just one wash. Fresh fragrance lasts all day.",
      priceInPaisa: 42000,
      comparePriceInPaisa: 48000,
      stockQuantity: 100,
      unit: '2 kg bag',
      categoryId: catHousehold.id,
      isFeatured: true,
      tags: ['detergent', 'surf-excel', 'laundry', 'cleaning'],
      status: ProductStatus.ACTIVE,
      images: [img('detergent', 'Surf Excel detergent powder bag')],
    },

    // ── Personal Care ─────────────────────────────────────────────────────────
    {
      name: "Pantene Pro-V Shampoo",
      slug: 'pantene-pro-v-shampoo-400ml',
      sku: 'PEC-001',
      description: "Pantene's signature Pro-V formula strengthens and adds shine to dull hair. Nourishes from root to tip.",
      priceInPaisa: 55000,
      comparePriceInPaisa: 62000,
      stockQuantity: 75,
      unit: '400 ml bottle',
      categoryId: catPersonalCare.id,
      isFeatured: true,
      tags: ['shampoo', 'pantene', 'hair-care', 'pro-v'],
      status: ProductStatus.ACTIVE,
      images: [img('shampoo', 'Pantene Pro-V shampoo bottle')],
    },
    {
      name: 'Colgate Total Toothpaste',
      slug: 'colgate-total-toothpaste-150g',
      sku: 'PEC-002',
      description: 'Colgate Total provides 12-hour antibacterial protection. Fights cavities, plaque and freshens breath.',
      priceInPaisa: 14500,
      stockQuantity: 200,
      unit: '150 g tube',
      categoryId: catPersonalCare.id,
      isFeatured: false,
      tags: ['toothpaste', 'colgate', 'dental', 'hygiene'],
      status: ProductStatus.ACTIVE,
      images: [img('toothpaste', 'Colgate total toothpaste')],
    },

    // ── Baby ──────────────────────────────────────────────────────────────────
    {
      name: "Gerber Baby Food (Stage 1)",
      slug: 'gerber-baby-food-stage-1',
      sku: 'BAB-001',
      description: "Gerber's Stage 1 single-ingredient purees for babies 4 months+. No added salt, sugar or starch.",
      priceInPaisa: 35000,
      stockQuantity: 50,
      unit: 'Pack of 6 (125g each)',
      categoryId: catBaby.id,
      isFeatured: false,
      tags: ['baby-food', 'gerber', 'puree', 'organic'],
      status: ProductStatus.ACTIVE,
      images: [img('babyFood', 'Gerber baby food jars')],
    },
  ];

  let created = 0;

  for (const product of products) {
    const { images, ...rest } = product;

    await prisma.product.upsert({
      where:  { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        images: {
          create: images,
        },
      },
    });

    created++;
  }

  console.log(`  ✓ ${created} products created / verified`);
  console.log('🎉  Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
