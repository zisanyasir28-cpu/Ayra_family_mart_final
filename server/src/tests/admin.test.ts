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

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  // Provide safe defaults so admin-token calls don't throw unhandled errors
  vi.mocked(prisma.order.findMany).mockResolvedValue([] as any);
  vi.mocked(prisma.order.count).mockResolvedValue(0);
  vi.mocked(prisma.coupon.findUnique).mockResolvedValue(null as any);
  vi.mocked(prisma.product.findMany).mockResolvedValue([] as any);
  vi.mocked(prisma.product.count).mockResolvedValue(0);
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null as any);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Assert that the endpoint enforces admin-only access:
 *   • CUSTOMER JWT  → 403 FORBIDDEN
 *   • ADMIN JWT     → anything except 403 (200, 4xx, or 500 due to missing
 *                     data are all acceptable — RBAC is what we test here)
 */
function rbacSuite(
  label: string,
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
  body?: Record<string, unknown>,
) {
  describe(`${label}`, () => {
    it('returns 403 FORBIDDEN for CUSTOMER role', async () => {
      const req = (request(app) as any)[method](path)
        .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`);
      if (body) req.send(body);
      const res = await req;

      expect(res.status).toBe(403);
      expect(res.body.error?.code).toBe('FORBIDDEN');
    });

    it('does NOT return 403 for ADMIN role (RBAC passes)', async () => {
      const req = (request(app) as any)[method](path)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
      if (body) req.send(body);
      const res = await req;

      expect(res.status).not.toBe(403);
    });
  });
}

// ─── RBAC enforcement per endpoint ──────────────────────────────────────────

rbacSuite(
  'GET /api/v1/admin/customers',
  'get',
  '/api/v1/admin/customers',
);

rbacSuite(
  'GET /api/v1/admin/stats/dashboard',
  'get',
  '/api/v1/admin/stats/dashboard',
);

rbacSuite(
  'GET /api/v1/admin/orders',
  'get',
  '/api/v1/admin/orders',
);

rbacSuite(
  'POST /api/v1/products (create product)',
  'post',
  '/api/v1/products',
  // Body intentionally incomplete — validation 400 is fine; RBAC is tested first
  { name: 'Dummy Product' },
);

rbacSuite(
  `PATCH /api/v1/coupons/:id (update coupon)`,
  'patch',
  `/api/v1/coupons/${COUPON_ID}`,
  { discountValue: 20 },
);

rbacSuite(
  'POST /api/v1/campaigns (create campaign)',
  'post',
  '/api/v1/campaigns',
  {
    name:          'Flash Sale',
    discountType:  'PERCENTAGE',
    discountValue: 10,
    startsAt:      '2030-01-01T00:00:00.000Z',
    scope:         { kind: 'category', categoryId: '00000000-0000-0000-0000-000000000001' },
  },
);

rbacSuite(
  'POST /api/v1/products/bulk-price',
  'post',
  '/api/v1/products/bulk-price',
  { type: 'all_active', changeType: 'percentage', changeValue: 10 },
);

rbacSuite(
  'GET /api/v1/admin/metrics',
  'get',
  '/api/v1/admin/metrics',
);

// ─── Explicit FORBIDDEN shape ────────────────────────────────────────────────

describe('403 response shape', () => {
  it('includes { success: false, error: { code: "FORBIDDEN" } }', async () => {
    const res = await request(app)
      .get('/api/v1/admin/customers')
      .set('Authorization', `Bearer ${CUSTOMER_TOKEN}`);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code:    'FORBIDDEN',
        message: expect.any(String),
      },
    });
  });

  it('returns 401 UNAUTHORIZED when no token is provided', async () => {
    const res = await request(app).get('/api/v1/admin/customers');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
