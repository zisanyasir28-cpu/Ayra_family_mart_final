import { vi } from 'vitest';

// ─── Test environment ─────────────────────────────────────────────────────────
process.env['JWT_ACCESS_SECRET']  = 'test-access-secret-minimum-32-characters!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-minimum-32-characters!';
process.env['NODE_ENV']           = 'test';

// ─── Prisma mock ──────────────────────────────────────────────────────────────
vi.mock('../lib/prisma', () => ({
  prisma: {
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
    $transaction: vi.fn(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops);
      if (typeof ops === 'function') return ops({ product: { update: vi.fn() }, stockLog: { create: vi.fn() } });
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

// Note: JWT is NOT mocked — tests generate real signed tokens using TEST_JWT_SECRET.
// See products.test.ts for the token generation pattern.
