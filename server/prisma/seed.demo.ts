/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEMO SEED — for manual testing only                                        ║
 * ║                                                                             ║
 * ║  Creates:                                                                   ║
 * ║  • admin@demo.com   / Demo@1234  (ADMIN role)                              ║
 * ║  • customer@demo.com / Demo@1234 (CUSTOMER role)                           ║
 * ║  • 1 saved delivery address for the demo customer                          ║
 * ║  • Coupon code  DEMO10  (10% off, max ৳100)                               ║
 * ║  • 5 demo orders in different states so dashboard has real-looking data     ║
 * ║                                                                             ║
 * ║  HOW TO USE                                                                 ║
 * ║  npm run db:seed:demo          — create demo data                          ║
 * ║  npm run db:seed:demo -- --clean  — wipe all demo data                     ║
 * ║                                                                             ║
 * ║  HOW TO REMOVE (before production)                                         ║
 * ║  1. Run: npm run db:seed:demo -- --clean                                   ║
 * ║  2. Delete this file: server/prisma/seed.demo.ts                           ║
 * ║  3. Remove "db:seed:demo" from server/package.json scripts                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  PrismaClient,
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  AddressType,
  DiscountType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_ADMIN_EMAIL    = 'admin@demo.com';
const DEMO_CUSTOMER_EMAIL = 'customer@demo.com';
const DEMO_PASSWORD       = 'Demo@1234';
const DEMO_COUPON_CODE    = 'DEMO10';
const DEMO_TAG            = '__DEMO__'; // tag used on orders for easy cleanup

// ─── Date helpers ─────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

// ─── Pricing helpers (must match server logic) ────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 99_900; // paisa
const STANDARD_SHIPPING       = 6_000;
const COD_SURCHARGE           = 2_000;

function calcShipping(subtotal: number): number {
  return (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING) + COD_SURCHARGE;
}

// ─── seedDemo ─────────────────────────────────────────────────────────────────

async function seedDemo() {
  console.log('🌱  Demo seed starting…');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // ── 1. Demo admin user ───────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where:  { email: DEMO_ADMIN_EMAIL },
    update: {},
    create: {
      email:           DEMO_ADMIN_EMAIL,
      name:            'Demo Admin',
      phone:           '01700000000',
      passwordHash,
      role:            UserRole.ADMIN,
      isEmailVerified: true,
      isActive:        true,
    },
  });

  console.log(`  ✓ Admin user:    ${admin.email}`);

  // ── 2. Demo customer user ─────────────────────────────────────────────────────

  const customer = await prisma.user.upsert({
    where:  { email: DEMO_CUSTOMER_EMAIL },
    update: {},
    create: {
      email:           DEMO_CUSTOMER_EMAIL,
      name:            'Ayra Rahman',
      phone:           '01712345678',
      passwordHash,
      role:            UserRole.CUSTOMER,
      isEmailVerified: true,
      isActive:        true,
    },
  });

  console.log(`  ✓ Customer user: ${customer.email}`);

  // ── 3. Demo address ──────────────────────────────────────────────────────────

  let address = await prisma.address.findFirst({
    where: { userId: customer.id, label: 'Demo Home' },
  });

  if (!address) {
    address = await prisma.address.create({
      data: {
        userId:       customer.id,
        label:        'Demo Home',
        type:         AddressType.HOME,
        fullName:     'Ayra Rahman',
        phone:        '01712345678',
        addressLine1: 'House 12, Road 4, Block C',
        district:     'Dhaka',
        thana:        'Dhanmondi',
        postalCode:   '1209',
        isDefault:    true,
      },
    });
  }

  console.log('  ✓ Demo address:  House 12, Dhanmondi, Dhaka');

  // ── 4. Demo coupon ───────────────────────────────────────────────────────────

  await prisma.coupon.upsert({
    where:  { code: DEMO_COUPON_CODE },
    update: {},
    create: {
      code:                 DEMO_COUPON_CODE,
      description:          'Demo coupon — 10% off (max ৳100). Remove before production.',
      discountType:         DiscountType.PERCENTAGE,
      discountValue:        10,
      minOrderAmountInPaisa: 30000, // min ৳300 order
      maxDiscountInPaisa:   10000, // cap ৳100
      usageLimit:           100,
      perUserLimit:         3,
      isActive:             true,
      startsAt:             new Date('2025-01-01'),
    },
  });

  console.log(`  ✓ Coupon:        ${DEMO_COUPON_CODE} (10% off, max ৳100)`);

  // ── 5. Skip order creation if demo orders already exist ──────────────────────

  const existingOrders = await prisma.order.count({
    where: { userId: customer.id },
  });

  if (existingOrders > 0) {
    console.log(`  ↩  Orders already exist (${existingOrders}). Skipping order creation.`);
    console.log('\n🎉  Demo seed complete (partially skipped)!');
    console.log(demoLoginBox());
    return;
  }

  // ── 6. Fetch real products from DB ───────────────────────────────────────────

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, sku: true, priceInPaisa: true },
  });

  if (products.length === 0) {
    console.log('  ⚠  No products found. Run npm run db:seed first, then re-run this.');
    return;
  }

  const bySlug = (sku: string) =>
    products.find((p) => p.sku === sku) ?? products[0]!;

  const apple    = bySlug('FRT-001'); // ৳180
  const milk     = bySlug('DAI-001'); // ৳68
  const eggs     = bySlug('DAI-002'); // ৳140
  const mango    = bySlug('FRT-003'); // ৳450
  const hilsha   = bySlug('FSH-001'); // ৳850
  const nescafe  = bySlug('BEV-004'); // ৳460
  const chips    = bySlug('SNK-001'); // ৳55
  const broccoli = bySlug('VEG-002'); // ৳90
  const yogurt   = bySlug('DAI-004'); // ৳185
  const juice    = bySlug('BEV-001'); // ৳220
  const ferrero  = bySlug('SNK-003'); // ৳1250
  const pantene  = bySlug('PEC-001'); // ৳550

  // snap helper
  function snapAddr() {
    return {
      snapFullName:     address!.fullName,
      snapPhone:        address!.phone,
      snapAddressLine1: address!.addressLine1,
      snapAddressLine2: null,
      snapDistrict:     address!.district,
      snapThana:        address!.thana,
      snapPostalCode:   address!.postalCode ?? null,
    };
  }

  // order builder helper
  async function makeOrder(
    num: string,
    status: OrderStatus,
    payStatus: PaymentStatus,
    items: Array<{ p: typeof apple; qty: number }>,
    createdAt: Date,
    history: Array<{ status: OrderStatus; note: string; when: Date }>,
  ) {
    const subtotal  = items.reduce((s, { p, qty }) => s + p.priceInPaisa * qty, 0);
    const shipping  = calcShipping(subtotal);
    const total     = subtotal + shipping;

    return prisma.order.create({
      data: {
        orderNumber:    num,
        userId:         customer.id,
        addressId:      address!.id,
        status,
        paymentStatus:  payStatus,
        paymentMethod:  PaymentMethod.COD,
        subtotalInPaisa: subtotal,
        discountInPaisa: 0,
        shippingInPaisa: shipping,
        totalInPaisa:   total,
        notes:          DEMO_TAG,
        createdAt,
        ...snapAddr(),
        items: {
          create: items.map(({ p, qty }) => ({
            productId:         p.id,
            productName:       p.name,
            productSku:        p.sku,
            quantity:          qty,
            unitPriceInPaisa:  p.priceInPaisa,
            totalPriceInPaisa: p.priceInPaisa * qty,
          })),
        },
        statusHistory: {
          create: history.map(({ status: s, note, when }) => ({
            status: s,
            note,
            createdAt: when,
          })),
        },
        payment: {
          create: {
            method:       PaymentMethod.COD,
            status:       payStatus,
            amountInPaisa: total,
          },
        },
      },
    });
  }

  // ── Order 1: DELIVERED (25 days ago) — premium items, free shipping ──────────

  const o1Date = daysAgo(25);
  await makeOrder(
    'ORD-20260418-DEMO01',
    OrderStatus.DELIVERED,
    PaymentStatus.PAID,
    [
      { p: ferrero, qty: 1 },  // 125000
      { p: pantene, qty: 1 },  // 55000 → subtotal 180000 → free shipping
    ],
    o1Date,
    [
      { status: OrderStatus.PENDING,    note: 'Order placed',          when: o1Date },
      { status: OrderStatus.CONFIRMED,  note: 'Order confirmed',       when: new Date(o1Date.getTime() + 3_600_000) },
      { status: OrderStatus.PROCESSING, note: 'Packing your items',    when: new Date(o1Date.getTime() + 7_200_000) },
      { status: OrderStatus.SHIPPED,    note: 'Shipped via Pathao',    when: new Date(o1Date.getTime() + 86_400_000) },
      { status: OrderStatus.OUT_FOR_DELIVERY, note: 'Out for delivery', when: new Date(o1Date.getTime() + 172_800_000) },
      { status: OrderStatus.DELIVERED,  note: 'Delivered. Payment collected.', when: new Date(o1Date.getTime() + 259_200_000) },
    ],
  );

  // ── Order 2: DELIVERED (10 days ago) — groceries ─────────────────────────────

  const o2Date = daysAgo(10);
  await makeOrder(
    'ORD-20260503-DEMO02',
    OrderStatus.DELIVERED,
    PaymentStatus.PAID,
    [
      { p: apple, qty: 2 },  // 36000
      { p: milk,  qty: 1 },  // 6800 → subtotal 42800
    ],
    o2Date,
    [
      { status: OrderStatus.PENDING,    note: 'Order placed',        when: o2Date },
      { status: OrderStatus.CONFIRMED,  note: 'Order confirmed',     when: new Date(o2Date.getTime() + 3_600_000) },
      { status: OrderStatus.PROCESSING, note: 'Packing your order',  when: new Date(o2Date.getTime() + 7_200_000) },
      { status: OrderStatus.SHIPPED,    note: 'Dispatched',          when: new Date(o2Date.getTime() + 86_400_000) },
      { status: OrderStatus.DELIVERED,  note: 'Delivered successfully.', when: new Date(o2Date.getTime() + 172_800_000) },
    ],
  );

  // ── Order 3: SHIPPED (3 days ago) — beverages + snacks ──────────────────────

  const o3Date = daysAgo(3);
  await makeOrder(
    'ORD-20260510-DEMO03',
    OrderStatus.SHIPPED,
    PaymentStatus.UNPAID,
    [
      { p: eggs,    qty: 2 },  // 28000
      { p: nescafe, qty: 1 },  // 46000
      { p: chips,   qty: 2 },  // 11000 → subtotal 85000
    ],
    o3Date,
    [
      { status: OrderStatus.PENDING,    note: 'Order placed',        when: o3Date },
      { status: OrderStatus.CONFIRMED,  note: 'Order confirmed',     when: new Date(o3Date.getTime() + 3_600_000) },
      { status: OrderStatus.PROCESSING, note: 'Being packed',        when: new Date(o3Date.getTime() + 7_200_000) },
      { status: OrderStatus.SHIPPED,    note: 'Shipped — tracking: SS-45921', when: new Date(o3Date.getTime() + 86_400_000) },
    ],
  );

  // ── Order 4: CANCELLED (5 days ago) — premium fish + mango ──────────────────

  const o4Date = daysAgo(5);
  await makeOrder(
    'ORD-20260508-DEMO04',
    OrderStatus.CANCELLED,
    PaymentStatus.UNPAID,
    [
      { p: mango,  qty: 1 },  // 45000
      { p: hilsha, qty: 1 },  // 85000 → subtotal 130000 → free shipping
    ],
    o4Date,
    [
      { status: OrderStatus.PENDING,    note: 'Order placed',            when: o4Date },
      { status: OrderStatus.CONFIRMED,  note: 'Order confirmed',         when: new Date(o4Date.getTime() + 3_600_000) },
      { status: OrderStatus.CANCELLED,  note: 'Customer requested cancellation — change of plans', when: new Date(o4Date.getTime() + 7_200_000) },
    ],
  );

  // ── Order 5: PENDING (today) — can be cancelled by demo customer ─────────────

  const o5Date = daysAgo(0);
  o5Date.setHours(9, 30, 0, 0);
  await makeOrder(
    'ORD-20260513-DEMO05',
    OrderStatus.PENDING,
    PaymentStatus.UNPAID,
    [
      { p: broccoli, qty: 2 },  // 18000
      { p: yogurt,   qty: 1 },  // 18500
      { p: juice,    qty: 1 },  // 22000 → subtotal 58500
    ],
    o5Date,
    [
      { status: OrderStatus.PENDING, note: 'Order placed', when: o5Date },
    ],
  );

  console.log('  ✓ 5 demo orders created (DELIVERED × 2, SHIPPED, CANCELLED, PENDING)');
  console.log('\n🎉  Demo seed complete!');
  console.log(demoLoginBox());
}

// ─── cleanDemo ────────────────────────────────────────────────────────────────

async function cleanDemo() {
  console.log('🧹  Cleaning demo data…');

  // Find demo users
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: [DEMO_ADMIN_EMAIL, DEMO_CUSTOMER_EMAIL] } },
    select: { id: true, email: true },
  });

  if (demoUsers.length === 0) {
    console.log('  ↩  No demo users found — nothing to clean.');
    return;
  }

  const customerUser = demoUsers.find((u) => u.email === DEMO_CUSTOMER_EMAIL);

  if (customerUser) {
    // Get demo order IDs
    const demoOrders = await prisma.order.findMany({
      where:  { userId: customerUser.id },
      select: { id: true, orderNumber: true },
    });
    const orderIds = demoOrders.map((o) => o.id);

    if (orderIds.length > 0) {
      console.log(`  → Deleting ${orderIds.length} demo orders…`);

      // Delete coupon usages (not cascade-deleted with order)
      await prisma.couponUsage.deleteMany({ where: { orderId: { in: orderIds } } });

      // Delete payments (not cascade-deleted with order)
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });

      // Delete orders (cascades: items + statusHistory)
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    // Delete addresses
    await prisma.address.deleteMany({ where: { userId: customerUser.id } });
    console.log('  → Deleted demo addresses');
  }

  // Delete demo coupon (if usage count is 0; otherwise leave it)
  const coupon = await prisma.coupon.findUnique({ where: { code: DEMO_COUPON_CODE } });
  if (coupon) {
    if (coupon.usageCount === 0) {
      await prisma.coupon.delete({ where: { code: DEMO_COUPON_CODE } });
      console.log(`  → Deleted coupon ${DEMO_COUPON_CODE}`);
    } else {
      console.log(`  ⚠  Coupon ${DEMO_COUPON_CODE} has ${coupon.usageCount} real usages — leaving it.`);
    }
  }

  // Delete demo users (must be last)
  const userIds = demoUsers.map((u) => u.id);
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  console.log(`  → Deleted ${demoUsers.length} demo user(s): ${demoUsers.map((u) => u.email).join(', ')}`);

  console.log('\n✅  Demo data removed. You can now delete this file.');
}

// ─── Login info box ───────────────────────────────────────────────────────────

function demoLoginBox(): string {
  return `
┌─────────────────────────────────────────────────────┐
│               DEMO LOGIN CREDENTIALS                │
├─────────────────────────────────────────────────────┤
│  Admin                                              │
│  Email:    admin@demo.com                           │
│  Password: Demo@1234                                │
│                                                     │
│  Customer                                           │
│  Email:    customer@demo.com                        │
│  Password: Demo@1234                                │
│                                                     │
│  Coupon code: DEMO10  (10% off, min ৳300 order)    │
│                                                     │
│  ⚠  Do NOT use these in production                 │
└─────────────────────────────────────────────────────┘`;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const mode = process.argv.includes('--clean') ? 'clean' : 'seed';

if (mode === 'clean') {
  cleanDemo()
    .catch((e: unknown) => { console.error('❌ Clean failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
} else {
  seedDemo()
    .catch((e: unknown) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
