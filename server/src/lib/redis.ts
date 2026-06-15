import { Redis } from '@upstash/redis';

const redisUrl = process.env['UPSTASH_REDIS_REST_URL'];
const redisToken = process.env['UPSTASH_REDIS_REST_TOKEN'];

const isRedisConfigured = Boolean(redisUrl && redisToken);

export const redis = isRedisConfigured
  ? new Redis({ url: redisUrl!, token: redisToken! })
  : ({
      get: async () => null,
      set: async () => 'OK',
      del: async () => 0,
      incr: async () => 1,
      // Add any other methods if needed by controllers, but get/set/del/incr cover our cache usage.
    } as unknown as Redis);

export const REDIS_KEYS = {
  refreshTokenFamily: (family: string) => `refresh:family:${family}`,
  emailVerifyToken: (userId: string) => `email:verify:${userId}`,
  passwordResetToken: (token: string) => `pwd:reset:${token}`,
  productCache: (id: string) => `product:${id}`,
  cartKey: (userId: string) => `cart:${userId}`,
  rateLimitAuth: (ip: string) => `ratelimit:auth:${ip}`,
  dashboardStats: () => 'admin:dashboard:stats',
} as const;
