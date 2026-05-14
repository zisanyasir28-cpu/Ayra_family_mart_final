/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { prisma } from '../lib/prisma';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const TEST_SECRET    = 'test-access-secret-minimum-32-characters!!';
const USER_ID        = '11111111-1111-1111-1111-111111111111';
const ADMIN_ID       = '33333333-3333-3333-3333-333333333333';
const COUPON_ID      = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

const CUSTOMER_TOKEN = jwt.sign(
  { sub: USER_ID,  email: 'customer@test.com', role: 'CUSTOMER' },
  TEST_SECRET, { expiresIn: '1h' },
);
const ADMIN_TOKEN = jwt.sign(
  { sub: ADMIN_ID, email: 'admin@test.com', role: 'ADMIN' },
  TEST_SECRET, { expiresIn: '1h' },
);

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const activeCoupon = {
  id:                    COUPON_ID,
  code:                  'WELCOME10',
  description:           'Welcome discount',
  isActive:              true,
  discountType:          'PERCENTAGE',
  discountValue:         10,
  startsAt:              new Date('2020-01-01'),
  expiresAt:             null,
  usageLimit:            null,
  usageCount:            0,
  perUserLimit:          null,
  minOrderAmountInPaisa: null,
  maxDiscountInPaisa:    null,
  createdAt:             new Date(),
  updatedAt:             new Date(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.coupon.findUnique).mockResolvedValue(null as any);
  vi.mocked(prisma.coupon.update).mockResolvedValue(activeCoupon as any);
  vi.mocked(prisma.couponUsage.count).mockResolvedValue(0);

  // coupon.create and coupon.delete are not in the shared mockSurface —
  // add them once and rely on clearAllMocks to reset call state each run.
  const couponMock = prisma.coupon as any;
  if (!couponMock.create) couponMock.create = vi.fn();
  if (!couponMock.delete) couponMock.delete = vi.fn();
  couponMock.create.mockResolvedValue(activeCoupon);
  couponMock.delete.mockResolvedValue(activeCoupon);
});

// ─── 1. POST /api/v1/coupons/validate ────────────────────────────────────────

describe('POST /api/v1/coupons/validate', () => {
  it('returns 401 when called without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(401);
  });

  it('WELCOME10 (10%) computes correct discountInPaisa', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue(activeCoupon as any);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('WELCOME10');
    expect(res.body.data.discountInPaisa).toBe(5_000); // 10% of 50_000
  });

  it('returns 400 COUPON_INVALID for unknown code', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'NOTREAL', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_INVALID');
  });

  it('returns 400 COUPON_EXPIRED for a past-expiry coupon', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon,
      expiresAt: new Date('2020-12-31'), // in the past
    } as any);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_EXPIRED');
  });

  it('returns 400 COUPON_EXPIRED for a not-yet-started coupon', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon,
      startsAt: new Date(Date.now() + 86_400_000), // starts tomorrow
    } as any);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_EXPIRED');
  });

  it('returns 400 COUPON_USAGE_EXCEEDED when global usage limit is exhausted', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon,
      usageLimit: 100,
      usageCount: 100,
    } as any);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_USAGE_EXCEEDED');
  });

  it('returns 400 COUPON_MIN_NOT_MET when subtotal is below the minimum', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon,
      minOrderAmountInPaisa: 100_000,
    } as any);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_MIN_NOT_MET');
  });

  it('returns 400 COUPON_USAGE_EXCEEDED when per-user limit is reached', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon,
      perUserLimit: 1,
    } as any);
    vi.mocked(prisma.couponUsage.count).mockResolvedValue(1);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('COUPON_USAGE_EXCEEDED');
  });

  it('caps discount at maxDiscountInPaisa for PERCENTAGE type', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon,
      discountValue:      50,   // 50%
      maxDiscountInPaisa: 3_000, // capped at ৳30
    } as any);

    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ code: 'WELCOME10', subtotalInPaisa: 50_000 }); // 50% of 50_000 = 25_000 → capped at 3_000

    expect(res.status).toBe(200);
    expect(res.body.data.discountInPaisa).toBe(3_000);
  });
});

// ─── 2. Admin: create coupon ─────────────────────────────────────────────────

describe('POST /api/v1/coupons — admin create', () => {
  it('returns 403 FORBIDDEN for CUSTOMER role', async () => {
    const res = await request(app)
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({
        code: 'SAVE10', discountType: 'PERCENTAGE', discountValue: 10,
        startsAt: '2030-01-01T00:00:00.000Z', isActive: true,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('creates a coupon and returns 201 for ADMIN role', async () => {
    const res = await request(app)
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({
        code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10,
        startsAt: '2020-01-01T00:00:00.000Z', isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect((prisma.coupon as any).create).toHaveBeenCalledTimes(1);
  });
});

// ─── 3. Admin: update coupon ─────────────────────────────────────────────────

describe('PATCH /api/v1/coupons/:id — admin update', () => {
  it('returns 403 for CUSTOMER role', async () => {
    const res = await request(app)
      .patch(`/api/v1/coupons/${COUPON_ID}`)
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`)
      .send({ discountValue: 15 });

    expect(res.status).toBe(403);
  });

  it('updates coupon discountValue and returns 200 for ADMIN role', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue(activeCoupon as any);
    vi.mocked(prisma.coupon.update).mockResolvedValue({
      ...activeCoupon, discountValue: 15,
    } as any);

    const res = await request(app)
      .patch(`/api/v1/coupons/${COUPON_ID}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ discountValue: 15 });

    expect(res.status).toBe(200);
    expect(res.body.data.discountValue).toBe(15);
  });
});

// ─── 4. Admin: toggle isActive ───────────────────────────────────────────────

describe('PATCH /api/v1/coupons/:id/toggle — admin toggle', () => {
  it('returns 403 for CUSTOMER role', async () => {
    const res = await request(app)
      .patch(`/api/v1/coupons/${COUPON_ID}/toggle`)
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`);

    expect(res.status).toBe(403);
  });

  it('toggles isActive and returns 200 for ADMIN role', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue(activeCoupon as any);
    vi.mocked(prisma.coupon.update).mockResolvedValue({
      ...activeCoupon, isActive: false,
    } as any);

    const res = await request(app)
      .patch(`/api/v1/coupons/${COUPON_ID}/toggle`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
    expect(prisma.coupon.update).toHaveBeenCalledWith({
      where: { id: COUPON_ID },
      data:  { isActive: false }, // was true → flipped to false
    });
  });
});

// ─── 5. Admin: delete coupon ─────────────────────────────────────────────────

describe('DELETE /api/v1/coupons/:id — admin delete', () => {
  it('returns 403 for CUSTOMER role', async () => {
    const res = await request(app)
      .delete(`/api/v1/coupons/${COUPON_ID}`)
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`);

    expect(res.status).toBe(403);
  });

  it('returns 409 CONFLICT when coupon has been used (usageCount > 0)', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon, usageCount: 5,
    } as any);

    const res = await request(app)
      .delete(`/api/v1/coupons/${COUPON_ID}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.status).toBe(409);
    expect((prisma.coupon as any).delete).not.toHaveBeenCalled();
  });

  it('deletes unused coupon and returns 204', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      ...activeCoupon, usageCount: 0,
    } as any);

    const res = await request(app)
      .delete(`/api/v1/coupons/${COUPON_ID}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.status).toBe(204);
    expect((prisma.coupon as any).delete).toHaveBeenCalledWith({ where: { id: COUPON_ID } });
  });
});
