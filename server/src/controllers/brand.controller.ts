import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

const CACHE_KEY_LIST = 'brands:list';
const CACHE_TTL_LIST = 60 * 15; // 15 minutes

export async function invalidateBrandCache(): Promise<void> {
  await redis.del(CACHE_KEY_LIST).catch(() => {});
}

/**
 * GET /api/v1/brands
 * Returns active brands that have at least one active product, each with its
 * active-product count, ordered by product count (desc) then name (asc).
 * Brands with zero active products are omitted — a brand page that leads to an
 * empty product list is dead UX.
 */
export const getBrands = asyncHandler(async (_req: Request, res: Response) => {
  const cached = await redis.get<unknown>(CACHE_KEY_LIST).catch(() => null);
  if (cached) return sendSuccess(res, cached);

  const brands = await prisma.brand.findMany({
    where: {
      isActive: true,
      products: { some: { status: 'ACTIVE' } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
    },
  });

  // Sort by active-product count desc, then name asc. (Prisma's relation
  // `_count` orderBy ignores the status filter, so we sort here instead.)
  const payload = brands
    .map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      productCount: b._count.products,
    }))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));

  await redis.set(CACHE_KEY_LIST, payload, { ex: CACHE_TTL_LIST }).catch(() => {});
  return sendSuccess(res, payload);
});
