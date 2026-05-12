/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { prisma } from '../lib/prisma';
import { sendOrderConfirmation, sendOrderStatusChange } from '../lib/email';
import { initiatePayment } from '../lib/sslcommerz';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const TEST_SECRET = 'test-access-secret-minimum-32-characters!!';
const USER_ID    = '11111111-1111-1111-1111-111111111111';
const OTHER_ID   = '22222222-2222-2222-2222-222222222222';
const ADMIN_ID   = '33333333-3333-3333-3333-333333333333';

const CUSTOMER_TOKEN = jwt.sign(
  { sub: USER_ID,  email: 'customer@test.com', role: 'CUSTOMER' },
  TEST_SECRET, { expiresIn: '1h' },
);
const ADMIN_TOKEN = jwt.sign(
  { sub: ADMIN_ID, email: 'admin@test.com',    role: 'ADMIN' },
  TEST_SECRET, { expiresIn: '1h' },
);

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const PROD_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PROD_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const ADDR_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const ORDER_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

const mockUser = {
  id: USER_ID, email: 'customer@test.com', name: 'Test Customer',
  phone: '01711111111',
};

const mockAddress = {
  id: ADDR_ID, userId: USER_ID, label: 'Home', type: 'HOME',
  fullName: 'Test Customer', phone: '01711111111',
  addressLine1: 'House 1, Road 1', addressLine2: null,
  district: 'Dhaka', thana: 'Dhanmondi', postalCode: '1209',
  isDefault: true, createdAt: new Date(), updatedAt: new Date(),
};

const mockProductA = {
  id: PROD_A, name: 'Mango', sku: 'MNG-1',
  priceInPaisa: 10_000, stockQuantity: 50, status: 'ACTIVE',
};
const mockProductB = {
  id: PROD_B, name: 'Rice', sku: 'RCE-1',
  priceInPaisa: 25_000, stockQuantity: 20, status: 'ACTIVE',
};

function createdOrderShape(overrides: any = {}) {
  return {
    id: ORDER_ID, orderNumber: 'ORD-20260512-ABCXYZ',
    userId: USER_ID, addressId: ADDR_ID,
    status: 'PENDING', paymentStatus: 'UNPAID',
    paymentMethod: 'COD',
    subtotalInPaisa: 20_000, discountInPaisa: 0,
    shippingInPaisa: 8_000, totalInPaisa: 28_000,
    couponCode: null, notes: null,
    snapFullName: 'Test Customer', snapPhone: '01711111111',
    snapAddressLine1: 'House 1, Road 1', snapAddressLine2: null,
    snapDistrict: 'Dhaka', snapThana: 'Dhanmondi', snapPostalCode: '1209',
    createdAt: new Date(), updatedAt: new Date(),
    items: [
      { id: 'i1', orderId: ORDER_ID, productId: PROD_A, productName: 'Mango',
        productSku: 'MNG-1', quantity: 2, unitPriceInPaisa: 10_000, totalPriceInPaisa: 20_000 },
    ],
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
  vi.mocked(prisma.address.findUnique).mockResolvedValue(mockAddress as any);
  vi.mocked(prisma.product.findMany).mockResolvedValue([mockProductA, mockProductB] as any);
  vi.mocked(prisma.order.create).mockResolvedValue(createdOrderShape() as any);
  vi.mocked(prisma.product.update).mockResolvedValue(mockProductA as any);
  vi.mocked(prisma.coupon.findUnique).mockResolvedValue(null as any);
  vi.mocked(prisma.couponUsage.count).mockResolvedValue(0);
  vi.mocked(prisma.payment.update).mockResolvedValue({} as any);
});

// ─── 1. Stock validation (409) ────────────────────────────────────────────────

describe('POST /api/v1/orders — stock validation', () => {
  it('returns 409 INSUFFICIENT_STOCK when requested qty exceeds stock', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { ...mockProductA, stockQuantity: 1 },
    ] as any);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 5 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
    expect(res.body.error.details).toMatchObject({
      productId: PROD_A, available: 1, requested: 5,
    });
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('returns 404 PRODUCT_NOT_FOUND when product missing from DB', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([] as any);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 1 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('rejects INACTIVE products', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { ...mockProductA, status: 'INACTIVE' },
    ] as any);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 1 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PRODUCT_INACTIVE');
  });
});

// ─── 2. Server-side price recalculation ───────────────────────────────────────

describe('POST /api/v1/orders — server-side pricing', () => {
  it('uses DB price not client-provided price', async () => {
    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        // Note: NO price field — server must use DB price
        items: [{ productId: PROD_A, quantity: 2 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
      });

    expect(prisma.order.create).toHaveBeenCalled();
    const arg = vi.mocked(prisma.order.create).mock.calls[0]?.[0] as any;
    expect(arg.data.subtotalInPaisa).toBe(20_000);
    expect(arg.data.items.create[0]).toMatchObject({
      unitPriceInPaisa:  10_000,
      totalPriceInPaisa: 20_000,
    });
  });

  it('grants free shipping above ৳999 threshold', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { ...mockProductA, priceInPaisa: 100_000, stockQuantity: 10 },
    ] as any);
    vi.mocked(prisma.order.create).mockResolvedValue(
      createdOrderShape({ subtotalInPaisa: 100_000, shippingInPaisa: 2_000, totalInPaisa: 102_000 }) as any,
    );

    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 1 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
      });

    const arg = vi.mocked(prisma.order.create).mock.calls[0]?.[0] as any;
    // shipping is 0 + COD surcharge 2000
    expect(arg.data.shippingInPaisa).toBe(2_000);
  });
});

// ─── 3. Coupon validation ─────────────────────────────────────────────────────

describe('POST /api/v1/orders — coupon validation', () => {
  it('rejects invalid coupon code (COUPON_INVALID)', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 1 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
        couponCode: 'NOPE',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_INVALID');
  });

  it('rejects expired coupon (COUPON_EXPIRED)', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'c1', code: 'OLD', isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: new Date('2020-12-31'),
      discountType: 'PERCENTAGE', discountValue: 10,
      usageLimit: null, usageCount: 0, perUserLimit: null,
      minOrderAmountInPaisa: null, maxDiscountInPaisa: null,
    } as any);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 1 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
        couponCode: 'OLD',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_EXPIRED');
  });

  it('rejects when per-user limit hit (COUPON_USAGE_EXCEEDED)', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'c1', code: 'ONCE', isActive: true,
      startsAt: new Date('2020-01-01'), expiresAt: null,
      discountType: 'PERCENTAGE', discountValue: 10,
      usageLimit: null, usageCount: 0, perUserLimit: 1,
      minOrderAmountInPaisa: null, maxDiscountInPaisa: null,
    } as any);
    vi.mocked(prisma.couponUsage.count).mockResolvedValue(1);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 1 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
        couponCode: 'ONCE',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_USAGE_EXCEEDED');
  });

  it('rejects when subtotal below min order amount (COUPON_MIN_NOT_MET)', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'c1', code: 'BIG', isActive: true,
      startsAt: new Date('2020-01-01'), expiresAt: null,
      discountType: 'PERCENTAGE', discountValue: 10,
      usageLimit: null, usageCount: 0, perUserLimit: null,
      minOrderAmountInPaisa: 100_000, maxDiscountInPaisa: null,
    } as any);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 1 }], // 10_000 subtotal
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
        couponCode: 'BIG',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_MIN_NOT_MET');
  });

  it('applies percentage discount correctly', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'c1', code: 'PCT10', isActive: true,
      startsAt: new Date('2020-01-01'), expiresAt: null,
      discountType: 'PERCENTAGE', discountValue: 10,
      usageLimit: null, usageCount: 0, perUserLimit: null,
      minOrderAmountInPaisa: null, maxDiscountInPaisa: null,
    } as any);

    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 2 }], // 20_000 subtotal
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
        couponCode: 'PCT10',
      });

    const arg = vi.mocked(prisma.order.create).mock.calls[0]?.[0] as any;
    expect(arg.data.discountInPaisa).toBe(2_000); // 10% of 20_000
  });

  it('caps fixed-amount discount at maxDiscountInPaisa', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'c1', code: 'FLAT500', isActive: true,
      startsAt: new Date('2020-01-01'), expiresAt: null,
      discountType: 'FIXED_AMOUNT', discountValue: 50_000,
      usageLimit: null, usageCount: 0, perUserLimit: null,
      minOrderAmountInPaisa: null, maxDiscountInPaisa: 3_000,
    } as any);

    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 2 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
        couponCode: 'FLAT500',
      });

    const arg = vi.mocked(prisma.order.create).mock.calls[0]?.[0] as any;
    expect(arg.data.discountInPaisa).toBe(3_000);
  });
});

// ─── 4. COD success ───────────────────────────────────────────────────────────

describe('POST /api/v1/orders — COD', () => {
  it('returns 201 with order + sends confirmation email', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 2 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'COD',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.orderNumber).toMatch(/^ORD-/);

    const arg = vi.mocked(prisma.order.create).mock.calls[0]?.[0] as any;
    expect(arg.data.paymentStatus).toBe('UNPAID');
    expect(arg.data.shippingInPaisa).toBe(8_000); // 6000 std + 2000 COD surcharge

    // Allow microtask queue to flush the fire-and-forget email
    await new Promise((r) => setImmediate(r));
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });
});

// ─── 5. SSLCOMMERZ ────────────────────────────────────────────────────────────

describe('POST /api/v1/orders — SSLCOMMERZ', () => {
  it('returns 201 with gatewayUrl and persists session key', async () => {
    vi.mocked(prisma.order.create).mockResolvedValue(
      createdOrderShape({ paymentMethod: 'SSLCOMMERZ', paymentStatus: 'PENDING' }) as any,
    );

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        items: [{ productId: PROD_A, quantity: 2 }],
        shippingAddressId: ADDR_ID,
        paymentMethod: 'SSLCOMMERZ',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.gatewayUrl).toContain('/payment/mock');
    expect(initiatePayment).toHaveBeenCalledTimes(1);
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { orderId: ORDER_ID },
      data:  { gatewayRef: 'mock-abc' },
    });

    const arg = vi.mocked(prisma.order.create).mock.calls[0]?.[0] as any;
    expect(arg.data.paymentStatus).toBe('PENDING');
  });
});

// ─── 6. Ownership ─────────────────────────────────────────────────────────────

describe('GET /api/v1/orders/me/:id — ownership', () => {
  it('returns 404 (not 403) for an order owned by another user', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: ORDER_ID, userId: OTHER_ID, status: 'PENDING',
    } as any);

    const res = await request(app)
      .get(`/api/v1/orders/me/${ORDER_ID}`)
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns the order when the requester is the owner', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...createdOrderShape(), statusHistory: [], payment: null,
    } as any);

    const res = await request(app)
      .get(`/api/v1/orders/me/${ORDER_ID}`)
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ORDER_ID);
  });
});

// ─── 7. Cancel restores stock ─────────────────────────────────────────────────

describe('PATCH /api/v1/orders/me/:id/cancel', () => {
  it('restores stock and marks order CANCELLED for PENDING orders', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...createdOrderShape(), couponUsage: null,
    } as any);
    vi.mocked(prisma.order.update).mockResolvedValue({
      ...createdOrderShape({ status: 'CANCELLED' }),
      statusHistory: [], payment: null,
    } as any);

    const res = await request(app)
      .patch(`/api/v1/orders/me/${ORDER_ID}/cancel`)
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ reason: 'Changed my mind' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(prisma.product.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { stockQuantity: { increment: 2 } },
    }));
    await new Promise((r) => setImmediate(r));
    expect(sendOrderStatusChange).toHaveBeenCalled();
  });

  it('rejects cancellation of SHIPPED orders with ORDER_NOT_CANCELLABLE', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...createdOrderShape({ status: 'SHIPPED' }), couponUsage: null,
    } as any);

    const res = await request(app)
      .patch(`/api/v1/orders/me/${ORDER_ID}/cancel`)
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ORDER_NOT_CANCELLABLE');
  });
});

// ─── 8. Admin status update ───────────────────────────────────────────────────

describe('PATCH /api/v1/admin/orders/:id/status', () => {
  it('appends status history and emails customer', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...createdOrderShape({ status: 'PENDING' }),
      user: mockUser,
    } as any);
    vi.mocked(prisma.order.update).mockResolvedValue({
      ...createdOrderShape({ status: 'CONFIRMED' }),
      user: mockUser, statusHistory: [], payment: null, items: [],
    } as any);

    const res = await request(app)
      .patch(`/api/v1/admin/orders/${ORDER_ID}/status`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ status: 'CONFIRMED', note: 'Verified by admin' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
    await new Promise((r) => setImmediate(r));
    expect(sendOrderStatusChange).toHaveBeenCalled();
  });
});
