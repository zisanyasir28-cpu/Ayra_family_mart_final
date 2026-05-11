import { vi } from 'vitest';

// ─── Test environment ─────────────────────────────────────────────────────────
process.env['JWT_ACCESS_SECRET']  = 'test-access-secret-minimum-32-characters!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-minimum-32-characters!';
process.env['NODE_ENV']           = 'test';

// ─── Prisma mock ──────────────────────────────────────────────────────────────
//
// `tx` (the inner transaction client) shares method spies with the top-level
// `prisma` mock so individual tests can stub `tx.product.update` etc. via
// `vi.mocked(prisma.product.update).mockResolvedValueOnce(...)`. This keeps
// per-test setup simple and avoids reassigning the shared mock object.
type MethodSet = Record<string, ReturnType<typeof vi.fn>>;
const make = (...methods: string[]): MethodSet =>
  Object.fromEntries(methods.map((m) => [m, vi.fn()]));

const prismaMock = {
  product:           make('findMany', 'findUnique', 'findFirst', 'create', 'update', 'delete', 'count', 'updateMany'),
  category:          make('findMany', 'findUnique', 'findFirst', 'create', 'update', 'count'),
  productImage:      make('deleteMany'),
  stockLog:          make('findMany', 'create', 'count'),
  user:              make('findMany', 'findUnique', 'findFirst', 'create', 'update', 'count'),
  address:           make('findMany', 'findUnique', 'findFirst', 'create', 'update', 'delete', 'updateMany', 'count'),
  order:             make('findMany', 'findUnique', 'findFirst', 'create', 'update', 'delete', 'count', 'updateMany'),
  orderItem:         make('findMany', 'create', 'count'),
  orderStatusHistory: make('create'),
  payment:           make('findUnique', 'create', 'update'),
  coupon:            make('findUnique', 'findFirst', 'update'),
  couponUsage:       make('count', 'create', 'delete', 'findUnique'),
  $transaction:      vi.fn(),
  $queryRaw:         vi.fn().mockResolvedValue([]),
};

// Default $transaction implementation:
//   - If passed an array of operations, resolve them all (Prisma "batch" form).
//   - If passed a callback, invoke it with the same prismaMock as `tx`,
//     so any mock setup on prisma.<model>.<method> is visible inside the
//     transaction. Tests can override per-test.
prismaMock.$transaction.mockImplementation(async (ops: unknown) => {
  if (Array.isArray(ops)) return Promise.all(ops as Promise<unknown>[]);
  if (typeof ops === 'function') return (ops as (tx: typeof prismaMock) => unknown)(prismaMock);
  return ops;
});

vi.mock('../lib/prisma', () => ({ prisma: prismaMock }));

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

// ─── Email + payment mocks (so order tests don't try to hit SMTP / gateway) ───
vi.mock('../lib/email', () => ({
  sendEmail:               vi.fn().mockResolvedValue(undefined),
  sendOrderConfirmation:   vi.fn().mockResolvedValue(undefined),
  sendOrderStatusChange:   vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../lib/sslcommerz', () => ({
  initiatePayment: vi.fn().mockResolvedValue({
    gatewayUrl: 'http://localhost:5173/payment/mock?orderId=test&session=mock-abc',
    sessionKey: 'mock-abc',
  }),
}));

// Note: JWT is NOT mocked — tests generate real signed tokens using TEST_JWT_SECRET.
// See products.test.ts for the token generation pattern.
