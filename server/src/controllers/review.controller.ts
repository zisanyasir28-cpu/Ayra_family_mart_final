import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated, sendNoContent, buildPagination } from '../utils/ApiResponse';
import { createNotification } from './notification.controller';
import type { CreateReviewInput, ReviewQueryInput } from '@superstore/shared';

// ─── Public: Get Product Reviews ──────────────────────────────────────────────

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as ReviewQueryInput;

  const where = { productId: q.productId, isVerified: true };

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip:    (q.page - 1) * q.limit,
      take:    q.limit,
    }),
  ]);

  // Rating breakdown (1–5)
  const allRatings = await prisma.review.groupBy({
    by:    ['rating'],
    where: { productId: q.productId, isVerified: true },
    _count: { rating: true },
  });

  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of allRatings) {
    ratingBreakdown[row.rating] = row._count.rating;
  }

  const totalRatings   = Object.values(ratingBreakdown).reduce((a, b) => a + b, 0);
  const weightedSum    = Object.entries(ratingBreakdown).reduce(
    (sum, [star, count]) => sum + Number(star) * count, 0,
  );
  const averageRating  = totalRatings > 0 ? Math.round((weightedSum / totalRatings) * 10) / 10 : 0;

  return sendSuccess(
    res,
    { reviews, ratingBreakdown, averageRating, totalReviews: total },
    200,
    buildPagination(q.page, q.limit, total),
  );
});

// ─── Customer: Create / Update Review ────────────────────────────────────────

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { productId, rating, comment } = req.body as CreateReviewInput;

  // Verify user has a DELIVERED order containing this product
  const deliveredItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: 'DELIVERED' },
    },
  });
  if (!deliveredItem) {
    throw ApiError.forbidden('You can only review products from delivered orders');
  }

  // Upsert: allow updating own review
  const review = await prisma.review.upsert({
    where:  { productId_userId: { productId, userId } },
    create: { productId, userId, rating, comment: comment ?? null, isVerified: false },
    update: { rating, comment: comment ?? null },
    include: { user: { select: { name: true, avatarUrl: true } } },
  });

  return sendCreated(res, review);
});

// ─── Admin: Approve Review ────────────────────────────────────────────────────

export const adminApproveReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Review');

  const updated = await prisma.review.update({
    where: { id },
    data:  { isVerified: true },
    include: { user: { select: { name: true, avatarUrl: true } } },
  });

  // Notify the reviewer
  await createNotification(
    existing.userId,
    'REVIEW_APPROVED',
    'Your review was approved',
    'Your product review has been approved and is now visible.',
  );

  return sendSuccess(res, updated);
});

// ─── Admin: Reject / Delete Review ───────────────────────────────────────────

export const adminRejectReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Review');

  await prisma.review.delete({ where: { id } });

  return sendNoContent(res);
});
