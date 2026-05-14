import type { Request, Response, NextFunction } from 'express';

/**
 * Sets a Cache-Control header for public CDN/proxy + browser caching.
 *
 * Use sparingly — only on public, idempotent GET routes that don't depend on
 * the authenticated user. Skip for admin routes, user-scoped data, mutations.
 *
 * Example:
 *   router.get('/products',   setCache(60),  getProducts);
 *   router.get('/categories', setCache(600), getCategories);
 */
export function setCache(seconds: number) {
  const swr = Math.floor(seconds / 2);
  const value = `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${swr}`;
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Cache-Control', value);
    next();
  };
}

/** No-cache directive for authenticated/mutable endpoints. */
export function noCache(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
}
