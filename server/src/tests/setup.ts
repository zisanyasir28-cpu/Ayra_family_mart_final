/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

// ─── Test environment ─────────────────────────────────────────────────────────
process.env['JWT_ACCESS_SECRET']  = 'test-access-secret-minimum-32-characters!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-minimum-32-characters!';
process.env['NODE_ENV']           = 'test';
process.env['CLIENT_URL']         = 'http://localhost:5173';

// ─── Shared mock surface (also used as $transaction tx) ───────────────────────

const mockSurface = {
  product: {
    findMany:   vi.fn(),
    findUnique: vi.fn(),
    findFirst:  vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    delete:     vi.fn(),
    count:      vi.fn(),
  },
  category: {
    findMany:   vi.fn(),
    findUnique: vi.fn(),
    findFirst:  vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    count:      vi.fn(),
  },
  productImage: {
    deleteMany: vi.fn(),
  },
  stockLog: {
    findMany: vi.fn(),
    create:   vi.fn(),
    count:    vi.fn(),
  },
  orderItem: { count: vi.fn() },
  user: {
    findUnique: vi.fn(),
    findFirst:  vi.fn(),
    update:     vi.fn(),
  },
  address: {
    findMany:   vi.fn(),
    findUnique: vi.fn(),
    findFirst:  vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    updateMany: vi.fn(),
    delete:     vi.fn(),
    count:      vi.fn(),
  },
  order: {
    findMany:   vi.fn(),
    findUnique: vi.fn(),
    findFirst:  vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    delete:     vi.fn(),
    count:      vi.fn(),
  },
  orderStatusHistory: {
    create:   vi.fn(),
    findMany: vi.fn(),
  },
  payment: {
    create:     vi.fn(),
    update:     vi.fn(),
    findUnique: vi.fn(),
  },
  coupon: {
    findUnique: vi.fn(),
    findMany:   vi.fn(),
    update:     vi.fn(),
    count:      vi.fn(),
  },
  couponUsage: {
    create:   vi.fn(),
    delete:   vi.fn(),
    count:    vi.fn(),
    findMany: vi.fn(),
  },
};

// ─── Prisma mock ──────────────────────────────────────────────────────────────
vi.mock('../lib/prisma', () => ({
  prisma: {
    ...mockSurface,
    $transaction: vi.fn(async (ops: unknown) => {
      if (Array.isArray(ops))   return Promise.all(ops);
      if (typeof ops === 'function') return (ops as (tx: any) => any)(mockSurface);
      return ops;
    }),
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
}));

// ─── Redis mock ───────────────────────────────────────────────────────────────
vi.mock('../lib/redis', () => ({
  redis: {
    get:   vi.fn().mockResolvedValue(null),
    set:   vi.fn().mockResolvedValue('OK'),
    del:   vi.fn().mockResolvedValue(1),
    incr:  vi.fn().mockResolvedValue(1),
    keys:  vi.fn().mockResolvedValue([]),
    ping:  vi.fn().mockResolvedValue('PONG'),
  },
  REDIS_KEYS: {
    productCache:  (id: string)     => `product:${id}`,
    cartKey:       (userId: string) => `cart:${userId}`,
    refreshTokenFamily: (f: string) => `refresh:family:${f}`,
    emailVerifyToken:   (u: string) => `email:verify:${u}`,
    passwordResetToken: (t: string) => `pwd:reset:${t}`,
    rateLimitAuth:      (ip: string) => `ratelimit:auth:${ip}`,
  },
}));

// ─── Cloudinary mock ──────────────────────────────────────────────────────────
vi.mock('../lib/cloudinary', () => ({
  uploadProductImage:  vi.fn().mockResolvedValue({ url: 'https://res.cloudinary.com/demo/image/upload/test.jpg', publicId: 'superstore/products/test' }),
  uploadCategoryImage: vi.fn().mockResolvedValue({ url: 'https://res.cloudinary.com/demo/image/upload/cat.jpg',  publicId: 'superstore/categories/cat' }),
  deleteImage:         vi.fn().mockResolvedValue(undefined),
  generateThumbnailUrl: vi.fn().mockReturnValue('https://res.cloudinary.com/demo/image/upload/w_200/test.jpg'),
}));

// ─── Email + SSLCommerz mocks ─────────────────────────────────────────────────
vi.mock('../lib/email', () => ({
  sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
  sendOrderStatusChange: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../lib/sslcommerz', () => ({
  initiatePayment: vi.fn().mockResolvedValue({
    gatewayUrl: 'http://localhost:5173/payment/mock?orderId=test&session=mock-abc',
    sessionKey: 'mock-abc',
  }),
}));

// Note: JWT is NOT mocked — tests generate real signed tokens using TEST_JWT_SECRET.
// See products.test.ts for the token generation pattern.
