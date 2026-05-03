import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import type { AccessTokenPayload } from '@superstore/shared';
import { UserRole } from '@superstore/shared';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token required'));
  }

  const token = authHeader.slice(7);
  const secret = process.env['JWT_ACCESS_SECRET'];
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured');

  try {
    const payload = jwt.verify(token, secret) as AccessTokenPayload;
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  requireAuth(req, _res, (err?: unknown) => {
    if (err) return next(err);
    if (
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.SUPER_ADMIN
    ) {
      return next(ApiError.forbidden('Admin access required'));
    }
    next();
  });
}

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  requireAuth(req, _res, (err?: unknown) => {
    if (err) return next(err);
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return next(ApiError.forbidden('Super admin access required'));
    }
    next();
  });
}
