import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { prisma } from '../lib/prisma';
import * as emailLib from '../lib/email';
import * as sslLib from '../lib/sslcommerz';

// ─── Auth ─────────────────────────────────────────────────────────────────────

const TEST_SECRET = 'test-access-secret-minimum-32-characters!!';
const USER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_USER_ID = '22222222-2222-2222-2222-222222222222';
const ADDRESS_ID = '33333333-3333-3333-3333-333333333333';
const PROD_A_ID = '44444444-4444-4444-4444-44444444aaaa';
const PROD_B_ID = '55555555-5555-5555-5555-55555555bbbb';
const COUPON_ID = '66666666-6666-6666-6666-666666666666';
const ORDER_ID = '77777777-7777-7777-7777-777777777777';

const userToken = jwt.sign(
  { sub: USER_ID, email: 'me@test.com', role: 'CUSTOMER' },
  TEST_SECRET,
  { expiresIn: '1h' },
);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: USER_ID,
  email: 'me@test.com',
  name: 'Test Customer',
  phone: '+8801712345678',
};

const mockAddress = {
  id: ADDRESS_ID,
  userId: USER_ID,
  label: 'Home',
  type: 'HOME',
  fullName: 'Test Customer',
  phone: '+8801712345678',
  addressLine1: '123 Test Road',
  addressLine2: null,
  district: 'Dhaka',
  thana: 'Gulshan',
  postalCode: '1212',
  isDefault: true,
};

const mockProductA = {
  id: PROD_A_ID,
  name: 'Mango',
  sku: 'MNG-1',
  priceInPaisa: 10_000, // ৳100.00
  stockQuantity: 50,
  status: 'ACTIVE',
};

const mockProductB = {
  id: PROD_B_ID,
  name: 'Banana',
  sku: 'BNA-1',
  priceInPaisa: 5_000,
  stockQuantity: 1, // intentionally low — used for stock-validation test
  status: 'ACTIVE',
};

function buildOrderBody(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ productId: PROD_A_ID, quantity: 2 }],
    shippingAddressId: ADDRESS_ID,
    paymentMethod: 'COD',
    ...overrides,
  };
}

function mockTxBaseline(): void {
  // Address ownership lookup (resolveShippingAddress runs before the tx)
  vi.mocked(prisma.address.findUnique).mockResolvedValue(mockAddress as never);
  // User load (also pre-tx)
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
  // Stock fetch inside tx
  vi.mocked(prisma.product.findMany).mockResolvedValue([mockProductA] as never);
  // Order create
  vi.mocked(prisma.order.create).mockResolvedValue({
    id: ORDER_ID,
    orderNumber: 'ORD-20260507-ABC123',
    userId: USER_ID,
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    status: 'PENDING',
    subtotalInPaisa: 20_000,
    discountInPaisa: 0,
    shippingInPaisa: 8_000, // 6000 standard + 2000 COD surcharge
    totalInPaisa: 28_000,
    couponCode: null,
    items: [
      {
        id: 'item-1',
        productId: PROD_A_ID,
        productName: 'Mango',
        productSku: 'MNG-1',
        quantity: 2,
        unitPriceInPaisa: 10_000,
        totalPriceInPaisa: 20_000,
      },
    ],
    statusHistory: [],
    payment: {
      id: 'pay-1',
      orderId: ORDER_ID,
      method: 'COD',
      amountInPaisa: 28_000,
      status: 'PENDING',
    },
  } as never);
  vi.mocked(prisma.product.update).mockResolvedValue({} as never);
}

// ─── POST /api/v1/orders — stock validation ──────────────────────────────────

describe('POST /api/v1/orders — stock validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTxBaseline();
  });

  it('returns 409 INSUFFICIENT_STOCK when requested qty exceeds stock', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValueOnce([
      mockProductB, // stock = 1
    ] as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ items: [{ productId: PROD_B_ID, quantity: 5 }] }));

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'INSUFFICIENT_STOCK',
        details: {
          productId: PROD_B_ID,
          available: 1,
          requested: 5,
        },
      },
    });
    // Order must NOT have been created — the throw aborts the transaction.
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('returns 404 PRODUCT_NOT_FOUND when product does not exist', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValueOnce([] as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('returns 400 PRODUCT_INACTIVE when product is not ACTIVE', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValueOnce([
      { ...mockProductA, status: 'OUT_OF_STOCK' },
    ] as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody());

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PRODUCT_INACTIVE');
  });
});

// ─── POST /api/v1/orders — server-side price recalculation ───────────────────

describe('POST /api/v1/orders — server-side price recalculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTxBaseline();
  });

  it('uses DB price, not body price; computes subtotal as price * qty', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      // The body has NO prices — only product references + qty.
      .send(buildOrderBody({ items: [{ productId: PROD_A_ID, quantity: 2 }] }));

    expect(res.status).toBe(201);
    // 10000 * 2 = 20000 subtotal; +6000 shipping + 2000 COD surcharge = 28000.
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotalInPaisa: 20_000,
          shippingInPaisa: 8_000,
          totalInPaisa: 28_000,
          discountInPaisa: 0,
        }),
      }),
    );
  });

  it('grants free shipping when subtotal >= ৳999.00', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValueOnce([
      { ...mockProductA, priceInPaisa: 60_000, stockQuantity: 100 },
    ] as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(
        buildOrderBody({
          items: [{ productId: PROD_A_ID, quantity: 2 }], // 120000 paisa
          paymentMethod: 'SSLCOMMERZ', // no COD surcharge
        }),
      );

    expect(res.status).toBe(201);
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotalInPaisa: 120_000,
          shippingInPaisa: 0, // free over threshold, no COD surcharge
          totalInPaisa: 120_000,
        }),
      }),
    );
  });
});

// ─── POST /api/v1/orders — coupon validation ─────────────────────────────────

describe('POST /api/v1/orders — coupon validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTxBaseline();
  });

  it('rejects unknown coupon code with COUPON_INVALID', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ couponCode: 'NOPE' }));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('COUPON_INVALID');
  });

  it('rejects expired coupon with COUPON_EXPIRED', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValueOnce({
      id: COUPON_ID,
      code: 'OLD10',
      isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: new Date('2020-12-31'),
      discountType: 'PERCENTAGE',
      discountValue: 10,
      usageLimit: null,
      usageCount: 0,
      perUserLimit: null,
      minOrderAmountInPaisa: null,
      maxDiscountInPaisa: null,
    } as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ couponCode: 'OLD10' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_EXPIRED');
  });

  it('rejects coupon when global usage limit reached', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValueOnce({
      id: COUPON_ID,
      code: 'CAPPED',
      isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: null,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      usageLimit: 5,
      usageCount: 5, // already at limit
      perUserLimit: null,
      minOrderAmountInPaisa: null,
      maxDiscountInPaisa: null,
    } as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ couponCode: 'CAPPED' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_USAGE_EXCEEDED');
  });

  it('rejects coupon when per-user limit reached', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValueOnce({
      id: COUPON_ID,
      code: 'ONCE',
      isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: null,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      usageLimit: null,
      usageCount: 0,
      perUserLimit: 1,
      minOrderAmountInPaisa: null,
      maxDiscountInPaisa: null,
    } as never);
    vi.mocked(prisma.couponUsage.count).mockResolvedValueOnce(1); // user already used it

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ couponCode: 'ONCE' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_USAGE_EXCEEDED');
  });

  it('rejects coupon when subtotal below minOrderAmountInPaisa', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValueOnce({
      id: COUPON_ID,
      code: 'BIGSPEND',
      isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: null,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      usageLimit: null,
      usageCount: 0,
      perUserLimit: null,
      minOrderAmountInPaisa: 50_000, // ৳500
      maxDiscountInPaisa: null,
    } as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ couponCode: 'BIGSPEND' })); // subtotal = 20000

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_MIN_NOT_MET');
  });

  it('applies a percentage discount and persists CouponUsage', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValueOnce({
      id: COUPON_ID,
      code: 'SAVE10',
      isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: null,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      usageLimit: null,
      usageCount: 0,
      perUserLimit: null,
      minOrderAmountInPaisa: null,
      maxDiscountInPaisa: null,
    } as never);
    vi.mocked(prisma.couponUsage.count).mockResolvedValueOnce(0);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ couponCode: 'SAVE10' }));

    expect(res.status).toBe(201);
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discountInPaisa: 2_000, // 10% of 20000
          couponCode: 'SAVE10',
        }),
      }),
    );
    expect(prisma.couponUsage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          couponId: COUPON_ID,
          userId: USER_ID,
        }),
      }),
    );
    expect(prisma.coupon.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: COUPON_ID },
        data: { usageCount: { increment: 1 } },
      }),
    );
  });

  it('caps a fixed-amount discount at maxDiscountInPaisa', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValueOnce({
      id: COUPON_ID,
      code: 'FLAT500',
      isActive: true,
      startsAt: new Date('2020-01-01'),
      expiresAt: null,
      discountType: 'FIXED_AMOUNT',
      discountValue: 50_000,
      usageLimit: null,
      usageCount: 0,
      perUserLimit: null,
      minOrderAmountInPaisa: null,
      maxDiscountInPaisa: 5_000, // cap at ৳50
    } as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ couponCode: 'FLAT500' }));

    expect(res.status).toBe(201);
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ discountInPaisa: 5_000 }),
      }),
    );
  });
});

// ─── POST /api/v1/orders — payment branches ──────────────────────────────────

describe('POST /api/v1/orders — payment branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTxBaseline();
  });

  it('COD: creates UNPAID order and triggers confirmation email', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ paymentMethod: 'COD' }));

    expect(res.status).toBe(201);
    expect(res.body.data.order.paymentStatus).toBe('UNPAID');
    expect(res.body.data.gatewayUrl).toBeUndefined();
    // Email is fire-and-forget; we await a microtask to let the .catch settle.
    await new Promise((r) => setImmediate(r));
    expect(emailLib.sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  it('SSLCOMMERZ: creates PENDING order and returns gatewayUrl', async () => {
    vi.mocked(prisma.order.create).mockResolvedValueOnce({
      id: ORDER_ID,
      orderNumber: 'ORD-20260507-XYZ999',
      userId: USER_ID,
      paymentMethod: 'SSLCOMMERZ',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      subtotalInPaisa: 20_000,
      discountInPaisa: 0,
      shippingInPaisa: 6_000,
      totalInPaisa: 26_000,
      couponCode: null,
      items: [],
      statusHistory: [],
      payment: { id: 'pay-2', method: 'SSLCOMMERZ', status: 'PENDING' },
    } as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody({ paymentMethod: 'SSLCOMMERZ' }));

    expect(res.status).toBe(201);
    expect(res.body.data.order.paymentStatus).toBe('PENDING');
    expect(res.body.data.gatewayUrl).toMatch(/\/payment\/mock\?orderId=/);
    expect(sslLib.initiatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: ORDER_ID,
        amountInPaisa: 26_000,
      }),
    );
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orderId: ORDER_ID } }),
    );
  });
});

// ─── POST /api/v1/orders — address resolution ────────────────────────────────

describe('POST /api/v1/orders — address ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTxBaseline();
  });

  it("returns 404 when shippingAddressId belongs to another user", async () => {
    vi.mocked(prisma.address.findUnique).mockResolvedValueOnce({
      ...mockAddress,
      userId: OTHER_USER_ID,
    } as never);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(buildOrderBody());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ADDRESS_NOT_FOUND');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });
});

// ─── GET /api/v1/orders/me/:id — ownership check ─────────────────────────────

describe('GET /api/v1/orders/me/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 (not 403) when order belongs to another user', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: ORDER_ID,
      userId: OTHER_USER_ID, // different owner
      items: [],
      statusHistory: [],
      payment: null,
    } as never);

    const res = await request(app)
      .get(`/api/v1/orders/me/${ORDER_ID}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });

  it('returns the order when ownership matches', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: ORDER_ID,
      userId: USER_ID,
      orderNumber: 'ORD-20260507-OK0000',
      items: [],
      statusHistory: [],
      payment: null,
    } as never);

    const res = await request(app)
      .get(`/api/v1/orders/me/${ORDER_ID}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ORDER_ID);
  });
});

// ─── PATCH /api/v1/orders/me/:id/cancel ──────────────────────────────────────

describe('PATCH /api/v1/orders/me/:id/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
  });

  it('restores stock + decrements coupon usage + sets CANCELLED for unpaid order', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: ORDER_ID,
      userId: USER_ID,
      orderNumber: 'ORD-20260507-CCC111',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: 'COD',
      totalInPaisa: 28_000,
      items: [
        { productId: PROD_A_ID, quantity: 2 },
        { productId: PROD_B_ID, quantity: 1 },
      ],
      couponUsage: {
        id: 'cu-1',
        couponId: COUPON_ID,
        userId: USER_ID,
        orderId: ORDER_ID,
      },
    } as never);
    vi.mocked(prisma.order.update).mockResolvedValue({
      id: ORDER_ID,
      orderNumber: 'ORD-20260507-CCC111',
      status: 'CANCELLED',
      paymentMethod: 'COD',
      totalInPaisa: 28_000,
      items: [],
      statusHistory: [],
    } as never);

    const res = await request(app)
      .patch(`/api/v1/orders/me/${ORDER_ID}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'Changed my mind' });

    expect(res.status).toBe(200);
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PROD_A_ID },
        data: { stockQuantity: { increment: 2 } },
      }),
    );
    expect(prisma.couponUsage.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cu-1' } }),
    );
    expect(prisma.coupon.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: COUPON_ID },
        data: { usageCount: { decrement: 1 } },
      }),
    );
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
  });

  it('rejects cancel of a SHIPPED order with ORDER_NOT_CANCELLABLE', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: ORDER_ID,
      userId: USER_ID,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      items: [],
      couponUsage: null,
    } as never);

    const res = await request(app)
      .patch(`/api/v1/orders/me/${ORDER_ID}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ORDER_NOT_CANCELLABLE');
  });
});
