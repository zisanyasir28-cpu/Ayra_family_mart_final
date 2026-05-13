import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { productListInclude, calcEffectivePrice } from './product.controller';

// ─── Get Wishlist ─────────────────────────────────────────────────────────────

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const items = await prisma.wishlistItem.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: productListInclude,
      },
    },
  });

  // Compute effectivePriceInPaisa for each product (same as product listing)
  const mapped = items.map((item) => {
    const activeCampaign = item.product.campaignProducts[0]?.campaign ?? null;
    const effectivePriceInPaisa = calcEffectivePrice(
      item.product.priceInPaisa,
      activeCampaign,
    );
    return {
      id:        item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        ...item.product,
        effectivePriceInPaisa,
        activeCampaign,
      },
    };
  });

  return sendSuccess(res, mapped);
});

// ─── Toggle Wishlist ──────────────────────────────────────────────────────────

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId    = req.user!.sub;
  const { productId } = req.body as { productId: string };

  if (!productId) {
    throw ApiError.badRequest('productId is required');
  }

  // Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Product', 'PRODUCT_NOT_FOUND');

  try {
    // Try to create — if it succeeds, item was added
    await prisma.wishlistItem.create({ data: { userId, productId } });
    return sendSuccess(res, { added: true });
  } catch (err: unknown) {
    // Prisma unique constraint violation (P2002) → item already exists → remove it
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      await prisma.wishlistItem.delete({
        where: { userId_productId: { userId, productId } },
      });
      return sendSuccess(res, { added: false });
    }
    throw err;
  }
});
