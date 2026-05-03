import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { prisma } from '../lib/prisma';

// ─── Real JWT tokens (same secret as set in setup.ts) ────────────────────────
const TEST_SECRET = 'test-access-secret-minimum-32-characters!!';
const ADMIN_TOKEN = jwt.sign(
  { sub: 'admin-user-id', email: 'admin@test.com', role: 'ADMIN' },
  TEST_SECRET,
  { expiresIn: '1h' },
);
const CUSTOMER_TOKEN = jwt.sign(
  { sub: 'customer-user-id', email: 'customer@test.com', role: 'CUSTOMER' },
  TEST_SECRET,
  { expiresIn: '1h' },
);

// ─── Test fixtures (using proper UUID format) ─────────────────────────────────
const CAT_ID  = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const PROD_ID = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891';
const CAMP_ID = 'c1b2c3d4-e5f6-7890-abcd-ef1234567892';

const mockProduct = {
  id:                  PROD_ID,
  name:                'Fresh Organic Mango',
  slug:                'fresh-organic-mango',
  description:         'Sweet organic mangos from Rajshahi',
  sku:                 'MANGO-001',
  barcode:             null,
  priceInPaisa:        15000, // ৳150.00
  comparePriceInPaisa: 18000,
  costPriceInPaisa:    9000,
  stockQuantity:       50,
  lowStockThreshold:   10,
  unit:                'kg',
  weight:              1.0,
  status:              'ACTIVE',
  categoryId:          CAT_ID,
  brandId:             null,
  tags:                ['organic', 'fruit'],
  isFeatured:          true,
  searchVector:        null,
  createdAt:           new Date('2024-01-01'),
  updatedAt:           new Date('2024-01-01'),
  images: [
    {
      id:        'img-001',
      url:       'https://res.cloudinary.com/demo/mango.jpg',
      publicId:  'superstore/products/mango',
      altText:   null,
      sortOrder: 0,
    },
  ],
  category:         { id: CAT_ID, name: 'Fruits', slug: 'fruits' },
  campaignProducts: [],
};

const mockProductWithCampaign = {
  ...mockProduct,
  id:   'd1b2c3d4-e5f6-7890-abcd-ef1234567893',
  name: 'Sale Mango',
  slug: 'sale-mango',
  campaignProducts: [
    {
      campaign: {
        id:            CAMP_ID,
        discountType:  'PERCENTAGE',
        discountValue: 20,
        endsAt:        new Date(Date.now() + 86_400_000),
      },
    },
  ],
};

// ─── GET /api/v1/products ─────────────────────────────────────────────────────

describe('GET /api/v1/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.product.count).mockResolvedValue(1);
    vi.mocked(prisma.product.findMany).mockResolvedValue([mockProduct] as never);
  });

  it('returns paginated products with defaults', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta?.pagination).toMatchObject({ page: 1, limit: 12 });
  });

  it('passes page and limit to Prisma', async () => {
    await request(app).get('/api/v1/products?page=2&limit=6');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 6, take: 6 }),
    );
  });

  it('converts BDT minPrice/maxPrice to paisa in Prisma where', async () => {
    await request(app).get('/api/v1/products?minPrice=100&maxPrice=500');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          priceInPaisa: { gte: 10000, lte: 50000 },
        }),
      }),
    );
  });

  it('only sends minPrice filter when maxPrice omitted', async () => {
    await request(app).get('/api/v1/products?minPrice=50');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          priceInPaisa: { gte: 5000 },
        }),
      }),
    );
  });

  it('filters by categoryId (valid UUID)', async () => {
    await request(app).get(`/api/v1/products?categoryId=${CAT_ID}`);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoryId: CAT_ID }),
      }),
    );
  });

  it('applies inStock filter', async () => {
    await request(app).get('/api/v1/products?inStock=true');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ stockQuantity: { gt: 0 } }),
      }),
    );
  });

  it('applies full-text search across name/description/sku', async () => {
    await request(app).get('/api/v1/products?search=mango');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: { contains: 'mango', mode: 'insensitive' },
            }),
          ]),
        }),
      }),
    );
  });

  it('maps price_asc sortBy → priceInPaisa asc', async () => {
    await request(app).get('/api/v1/products?sortBy=price_asc');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { priceInPaisa: 'asc' } }),
    );
  });

  it('maps price_desc sortBy → priceInPaisa desc', async () => {
    await request(app).get('/api/v1/products?sortBy=price_desc');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { priceInPaisa: 'desc' } }),
    );
  });

  it('maps oldest sortBy → createdAt asc', async () => {
    await request(app).get('/api/v1/products?sortBy=oldest');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
    );
  });

  it('rejects limit > 48 with 400', async () => {
    const res = await request(app).get('/api/v1/products?limit=100');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('attaches effectivePriceInPaisa with active campaign (20% off ৳150 = 12000)', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      mockProductWithCampaign,
    ] as never);
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.data[0].effectivePriceInPaisa).toBe(12000);
  });

  it('returns activeCampaign object when campaign is active', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      mockProductWithCampaign,
    ] as never);
    const res = await request(app).get('/api/v1/products');
    expect(res.body.data[0].activeCampaign).toMatchObject({
      discountType:  'PERCENTAGE',
      discountValue: 20,
    });
  });

  it('effectivePriceInPaisa equals priceInPaisa when no campaign', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.body.data[0].effectivePriceInPaisa).toBe(mockProduct.priceInPaisa);
    expect(res.body.data[0].activeCampaign).toBeNull();
  });
});

// ─── GET /api/v1/products/featured ───────────────────────────────────────────

describe('GET /api/v1/products/featured', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.product.findMany).mockResolvedValue([mockProduct] as never);
  });

  it('queries only isFeatured=true ACTIVE products, limit 8', async () => {
    const res = await request(app).get('/api/v1/products/featured');
    expect(res.status).toBe(200);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isFeatured: true, status: 'ACTIVE' },
        take:  8,
      }),
    );
  });
});

// ─── GET /api/v1/products/:slug ───────────────────────────────────────────────

describe('GET /api/v1/products/:slug', () => {
  const mockDetail = {
    ...mockProduct,
    brand:           null,
    reviews:         [{ rating: 5 }, { rating: 4 }],
    _count:          { reviews: 2 },
    campaignProducts: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns product detail by slug', async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockDetail as never);
    const res = await request(app).get('/api/v1/products/fresh-organic-mango');
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe('fresh-organic-mango');
  });

  it('returns 404 for unknown slug', async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);
    const res = await request(app).get('/api/v1/products/ghost-product');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('calculates averageRating from reviews — (5+4)/2 = 4.5', async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockDetail as never);
    const res = await request(app).get('/api/v1/products/fresh-organic-mango');
    expect(res.body.data.averageRating).toBe(4.5);
    expect(res.body.data.reviewCount).toBe(2);
  });

  it('returns null averageRating when product has no reviews', async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValue({
      ...mockDetail,
      reviews: [],
      _count:  { reviews: 0 },
    } as never);
    const res = await request(app).get('/api/v1/products/fresh-organic-mango');
    expect(res.body.data.averageRating).toBeNull();
    expect(res.body.data.reviewCount).toBe(0);
  });
});

// ─── POST /api/v1/products (admin) ────────────────────────────────────────────

describe('POST /api/v1/products (admin)', () => {
  const validBody = {
    name:          'Basmati Rice 5kg',
    description:   'Premium aged basmati rice, ideal for biriyani',
    sku:           'RICE-001',
    priceInPaisa:  75000,
    stockQuantity: 100,
    categoryId:    CAT_ID,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.product.create).mockResolvedValue({
      ...mockProduct,
      ...validBody,
      slug: 'basmati-rice-5kg',
    } as never);
  });

  it('returns 403 for customer token', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send(validBody);
    expect(res.status).toBe(403);
  });

  it('returns 401 without any token', async () => {
    const res = await request(app).post('/api/v1/products').send(validBody);
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ name: 'Test only' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects negative priceInPaisa with 400', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ ...validBody, priceInPaisa: -100 });
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/v1/products/bulk-price (admin) ─────────────────────────────────

describe('POST /api/v1/products/bulk-price (admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: PROD_ID,  priceInPaisa: 15000 },
      { id: 'd1b2c3d4-e5f6-7890-abcd-ef1234567893', priceInPaisa: 20000 },
    ] as never);
    vi.mocked(prisma.$transaction).mockResolvedValue([]);
  });

  it('applies percentage increase — returns affectedCount', async () => {
    const res = await request(app)
      .post('/api/v1/products/bulk-price')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ type: 'all_active', changeType: 'percentage', changeValue: 10 });
    expect(res.status).toBe(200);
    expect(res.body.data.affectedCount).toBe(2);
  });

  it('accepts by_ids type with valid uuid array', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: PROD_ID, priceInPaisa: 15000 },
    ] as never);
    const res = await request(app)
      .post('/api/v1/products/bulk-price')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ type: 'by_ids', ids: [PROD_ID], changeType: 'fixed', changeValue: 50 });
    expect(res.status).toBe(200);
  });

  it('returns 400 when type=by_ids but ids is missing', async () => {
    const res = await request(app)
      .post('/api/v1/products/bulk-price')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ type: 'by_ids', changeType: 'percentage', changeValue: 10 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when changeValue is 0', async () => {
    const res = await request(app)
      .post('/api/v1/products/bulk-price')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ type: 'all_active', changeType: 'percentage', changeValue: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 403 for customer', async () => {
    const res = await request(app)
      .post('/api/v1/products/bulk-price')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ type: 'all_active', changeType: 'percentage', changeValue: 10 });
    expect(res.status).toBe(403);
  });
});

// ─── DELETE /api/v1/products/:id (admin) ─────────────────────────────────────

describe('DELETE /api/v1/products/:id (admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('soft-deletes product (sets status INACTIVE) — returns 204', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as never);
    vi.mocked(prisma.orderItem.count).mockResolvedValue(0);
    vi.mocked(prisma.product.update).mockResolvedValue({
      ...mockProduct,
      status: 'INACTIVE',
    } as never);

    const res = await request(app)
      .delete(`/api/v1/products/${PROD_ID}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(204);
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'INACTIVE' } }),
    );
  });

  it('blocks deletion when product has active orders', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as never);
    vi.mocked(prisma.orderItem.count).mockResolvedValue(3);

    const res = await request(app)
      .delete(`/api/v1/products/${PROD_ID}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/active order/i);
  });

  it('returns 404 for non-existent product', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/v1/products/${PROD_ID}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(404);
  });
});
