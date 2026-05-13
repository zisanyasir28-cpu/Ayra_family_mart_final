import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated, sendNoContent, buildPagination } from '../utils/ApiResponse';
import { validateCouponForUser } from '../services/coupon.service';
import type {
  ValidateCouponInput,
  CreateCouponInput,
  UpdateCouponInput,
  CouponQueryInput,
  CouponStatusFilter,
} from '@superstore/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omits 0/1/O/I for legibility

function generateCouponCode(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

type CouponRecord = {
  id:                    string;
  code:                  string;
  description:           string | null;
  discountType:          string;
  discountValue:         number;
  minOrderAmountInPaisa: number | null;
  maxDiscountInPaisa:    number | null;
  usageLimit:            number | null;
  usageCount:            number;
  perUserLimit:          number | null;
  isActive:              boolean;
  startsAt:              Date;
  expiresAt:             Date | null;
  createdAt:             Date;
  updatedAt:             Date;
};

type CouponStatus = 'active' | 'inactive' | 'upcoming' | 'expired' | 'exhausted';

function computeStatus(c: CouponRecord, now: Date = new Date()): CouponStatus {
  if (!c.isActive) return 'inactive';
  if (c.startsAt > now) return 'upcoming';
  if (c.expiresAt && c.expiresAt < now) return 'expired';
  if (c.usageLimit != null && c.usageCount >= c.usageLimit) return 'exhausted';
  return 'active';
}

function shape(c: CouponRecord) {
  return {
    ...c,
    startsAt:  c.startsAt.toISOString(),
    expiresAt: c.expiresAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    status:    computeStatus(c),
    usagePercent:
      c.usageLimit != null && c.usageLimit > 0
        ? Math.min(100, Math.round((c.usageCount / c.usageLimit) * 100))
        : null,
  };
}

// ─── Public: validate coupon at checkout ──────────────────────────────────────

/**
 * POST /api/v1/coupons/validate  (requireAuth)
 */
export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, subtotalInPaisa } = req.body as ValidateCouponInput;
  const userId = req.user?.sub;
  if (!userId) throw ApiError.unauthorized();

  const result = await validateCouponForUser(prisma, code, userId, subtotalInPaisa);

  return sendSuccess(res, {
    code:            result.code,
    discountInPaisa: result.discountInPaisa,
  });
});

// ─── Admin: list ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/coupons  (requireAdmin)
 */
export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, status } = req.query as unknown as CouponQueryInput;
  const skip = (page - 1) * limit;
  const now  = new Date();

  const where: Prisma.CouponWhereInput = {};
  if (search) where.code = { contains: search.trim().toUpperCase() };

  // We compute status in code for the response, but the filter narrows the query
  // server-side so pagination is accurate.
  const statusFilters: Record<Exclude<CouponStatusFilter, 'all'>, Prisma.CouponWhereInput> = {
    active:    { isActive: true, startsAt: { lte: now }, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
    expired:   { expiresAt: { lt: now } },
    upcoming:  { startsAt: { gt: now } },
    exhausted: { usageLimit: { not: null } }, // refined further in JS below
  };
  if (status && status !== 'all') {
    Object.assign(where, statusFilters[status]);
  }

  const [rows, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  let data = rows.map(shape);
  if (status === 'exhausted') {
    data = data.filter((c) => c.status === 'exhausted');
  }

  return sendSuccess(res, data, 200, buildPagination(page, limit, total));
});

// ─── Admin: get one ───────────────────────────────────────────────────────────

export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Coupon id required');
  const c = await prisma.coupon.findUnique({ where: { id } });
  if (!c) throw ApiError.notFound('Coupon');
  return sendSuccess(res, shape(c));
});

// ─── Admin: create ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/coupons  (requireAdmin)
 */
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateCouponInput;

  // Retry up to 5 times on code collision when auto-generating
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = (input.code ?? generateCouponCode()).toUpperCase();
    try {
      const created = await prisma.coupon.create({
        data: {
          code,
          description:           input.description ?? null,
          discountType:          input.discountType,
          discountValue:         input.discountValue,
          minOrderAmountInPaisa: input.minOrderAmountInPaisa ?? null,
          maxDiscountInPaisa:    input.maxDiscountInPaisa ?? null,
          usageLimit:            input.usageLimit ?? null,
          perUserLimit:          input.perUserLimit ?? null,
          isActive:              input.isActive,
          startsAt:              input.startsAt,
          expiresAt:             input.expiresAt ?? null,
        },
      });
      return sendCreated(res, shape(created));
    } catch (err: unknown) {
      // Prisma P2002 → unique constraint on code. If user supplied a code, fail
      // immediately. Otherwise loop and try a fresh generated code.
      if (
        typeof err === 'object' && err !== null &&
        (err as { code?: string }).code === 'P2002'
      ) {
        if (input.code) {
          throw ApiError.conflict(`Coupon code "${code}" already exists`);
        }
        continue;
      }
      throw err;
    }
  }

  throw ApiError.internal('Could not generate a unique coupon code after 5 attempts');
});

// ─── Admin: update ────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/coupons/:id  (requireAdmin)
 */
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Coupon id required');
  const input = req.body as UpdateCouponInput;

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Coupon');

  const updated = await prisma.coupon.update({
    where: { id },
    data: {
      ...(input.description !== undefined           && { description:           input.description }),
      ...(input.discountType !== undefined          && { discountType:          input.discountType }),
      ...(input.discountValue !== undefined         && { discountValue:         input.discountValue }),
      ...(input.minOrderAmountInPaisa !== undefined && { minOrderAmountInPaisa: input.minOrderAmountInPaisa }),
      ...(input.maxDiscountInPaisa !== undefined    && { maxDiscountInPaisa:    input.maxDiscountInPaisa }),
      ...(input.usageLimit !== undefined            && { usageLimit:            input.usageLimit }),
      ...(input.perUserLimit !== undefined          && { perUserLimit:          input.perUserLimit }),
      ...(input.startsAt !== undefined              && { startsAt:              input.startsAt }),
      ...(input.expiresAt !== undefined             && { expiresAt:             input.expiresAt }),
      ...(input.isActive !== undefined              && { isActive:              input.isActive }),
    },
  });

  return sendSuccess(res, shape(updated));
});

// ─── Admin: toggle isActive ───────────────────────────────────────────────────

/**
 * PATCH /api/v1/coupons/:id/toggle  (requireAdmin)
 */
export const toggleCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Coupon id required');

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Coupon');

  const updated = await prisma.coupon.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  return sendSuccess(res, shape(updated));
});

// ─── Admin: delete (only if unused) ───────────────────────────────────────────

/**
 * DELETE /api/v1/coupons/:id  (requireAdmin)
 */
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Coupon id required');

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Coupon');

  if (existing.usageCount > 0) {
    throw ApiError.conflict(
      'Cannot delete a coupon that has been used. Deactivate it instead.',
    );
  }

  await prisma.coupon.delete({ where: { id } });
  return sendNoContent(res);
});
