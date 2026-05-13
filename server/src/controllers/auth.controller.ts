import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { redis, REDIS_KEYS } from '../lib/redis';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated } from '../utils/ApiResponse';
import type { RegisterInput, LoginInput, RefreshTokenPayload, UserPublic } from '@superstore/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCESS_SECRET  = () => process.env['JWT_ACCESS_SECRET']  ?? (() => { throw new Error('JWT_ACCESS_SECRET not set'); })();
const REFRESH_SECRET = () => process.env['JWT_REFRESH_SECRET'] ?? (() => { throw new Error('JWT_REFRESH_SECRET not set'); })();
const ACCESS_EXPIRES  = process.env['JWT_ACCESS_EXPIRES_IN']  ?? '15m';
const REFRESH_EXPIRES = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d';
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60; // 7 days in seconds

const REDIS_ENABLED = Boolean(
  process.env['UPSTASH_REDIS_REST_URL'] && process.env['UPSTASH_REDIS_REST_TOKEN'],
);

async function redisSet(key: string, value: string, ttl: number): Promise<void> {
  if (!REDIS_ENABLED) return;
  try { await redis.set(key, value, { ex: ttl }); } catch { /* no-op — Redis optional */ }
}

async function redisDel(key: string): Promise<void> {
  if (!REDIS_ENABLED) return;
  try { await redis.del(key); } catch { /* no-op */ }
}

async function redisGet(key: string): Promise<string | null> {
  if (!REDIS_ENABLED) return 'skip'; // skip revocation check when Redis unavailable
  try { return await redis.get<string>(key); } catch { return 'skip'; }
}

function toUserPublic(u: {
  id: string; email: string; name: string; phone: string | null;
  role: string; avatarUrl?: string | null; isEmailVerified: boolean; createdAt: Date;
}): UserPublic {
  return {
    id:               u.id,
    email:            u.email,
    name:             u.name,
    phone:            u.phone,
    role:             u.role as UserPublic['role'],
    avatarUrl:        u.avatarUrl ?? null,
    isEmailVerified:  u.isEmailVerified,
    createdAt:        u.createdAt.toISOString(),
  };
}

function signAccess(sub: string, email: string, role: string): string {
  return jwt.sign({ sub, email, role }, ACCESS_SECRET(), {
    expiresIn: ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

function signRefresh(sub: string, tokenFamily: string): string {
  return jwt.sign({ sub, tokenFamily }, REFRESH_SECRET(), {
    expiresIn: REFRESH_EXPIRES,
  } as jwt.SignOptions);
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TTL_SEC * 1000,
    path: '/api/v1/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', { httpOnly: true, path: '/api/v1/auth' });
}

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body as RegisterInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with that email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone: phone ?? null },
  });

  const tokenFamily  = uuidv4();
  const accessToken  = signAccess(user.id, user.email, user.role);
  const refreshToken = signRefresh(user.id, tokenFamily);

  await redisSet(REDIS_KEYS.refreshTokenFamily(tokenFamily), user.id, REFRESH_TTL_SEC);
  setRefreshCookie(res, refreshToken);

  return sendCreated(res, { user: toUserPublic(user), accessToken });
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const tokenFamily  = uuidv4();
  const accessToken  = signAccess(user.id, user.email, user.role);
  const refreshToken = signRefresh(user.id, tokenFamily);

  await redisSet(REDIS_KEYS.refreshTokenFamily(tokenFamily), user.id, REFRESH_TTL_SEC);
  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, { user: toUserPublic(user), accessToken });
});

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies['refreshToken'] as string | undefined;
  if (!token) throw ApiError.unauthorized('Refresh token missing');

  let payload: RefreshTokenPayload;
  try {
    payload = jwt.verify(token, REFRESH_SECRET()) as RefreshTokenPayload;
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const familyKey = REDIS_KEYS.refreshTokenFamily(payload.tokenFamily);
  const storedId  = await redisGet(familyKey);

  // 'skip' means Redis unavailable — trust the JWT signature alone
  if (storedId !== 'skip' && (!storedId || storedId !== payload.sub)) {
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Refresh token reuse detected');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    await redisDel(familyKey);
    clearRefreshCookie(res);
    throw ApiError.unauthorized('User not found or inactive');
  }

  // Rotate: delete old family, issue new family
  await redisDel(familyKey);
  const newFamily       = uuidv4();
  const newAccessToken  = signAccess(user.id, user.email, user.role);
  const newRefreshToken = signRefresh(user.id, newFamily);

  await redisSet(REDIS_KEYS.refreshTokenFamily(newFamily), user.id, REFRESH_TTL_SEC);
  setRefreshCookie(res, newRefreshToken);

  return sendSuccess(res, { accessToken: newAccessToken });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies['refreshToken'] as string | undefined;

  if (token) {
    try {
      const payload = jwt.verify(token, REFRESH_SECRET()) as RefreshTokenPayload;
      await redisDel(REDIS_KEYS.refreshTokenFamily(payload.tokenFamily));
    } catch {
      // Expired or invalid — just clear the cookie
    }
  }

  clearRefreshCookie(res);
  return sendSuccess(res, { message: 'Logged out successfully' });
});

// ─── Get current user ─────────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw ApiError.notFound('User');
  return sendSuccess(res, { user: toUserPublic(user) });
});
