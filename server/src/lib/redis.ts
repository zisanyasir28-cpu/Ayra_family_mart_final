import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env['UPSTASH_REDIS_REST_URL'] ?? '',
  token: process.env['UPSTASH_REDIS_REST_TOKEN'] ?? '',
});

export const REDIS_KEYS = {
  refreshTokenFamily: (family: string) => `refresh:family:${family}`,
  emailVerifyToken: (userId: string) => `email:verify:${userId}`,
  passwordResetToken: (token: string) => `pwd:reset:${token}`,
  productCache: (id: string) => `product:${id}`,
  cartKey: (userId: string) => `cart:${userId}`,
  rateLimitAuth: (ip: string) => `ratelimit:auth:${ip}`,
} as const;
