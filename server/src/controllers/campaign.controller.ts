import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  buildPagination,
} from '../utils/ApiResponse';
import { generateSlug } from '../utils/slug';
import { invalidateProductCaches } from './product.controller';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignQueryInput,
  CampaignStatusFilter,
} from '@superstore/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type CampaignRecord = {
  id:            string;
  name:          string;
  slug:          string;
  description:   string | null;
  bannerUrl:     string | null;
  bannerPublicId: string | null;
  status:        string;
  discountType:  string;
  discountValue: number;
  startsAt:      Date;
  endsAt:        Date | null;
  createdAt:     Date;
  updatedAt:     Date;
  _count?:       { products: number };
};

type CampaignTimeStatus = 'upcoming' | 'active' | 'ended';

function computeTimeStatus(c: { startsAt: Date; endsAt: Date | null }, now = new Date()): CampaignTimeStatus {
  if (c.startsAt > now) return 'upcoming';
  if (c.endsAt && c.endsAt < now) return 'ended';
  return 'active';
}

function shape(c: CampaignRecord) {
  return {
    id:            c.id,
    name:          c.name,
    slug:          c.slug,
    description:   c.description,
    bannerUrl:     c.bannerUrl,
    status:        c.status,
    discountType:  c.discountType,
    discountValue: c.discountValue,
    startsAt:      c.startsAt.toISOString(),
    endsAt:        c.endsAt?.toISOString() ?? null,
    createdAt:     c.createdAt.toISOString(),
    updatedAt:     c.updatedAt.toISOString(),
    productCount:  c._count?.products ?? 0,
    timeStatus:    computeTimeStatus(c),
    totalDiscountGivenInPaisa: 0, // placeholder until order analytics aggregation ships
  };
}

async function uniqueCampaignSlug(name: string, excludeId?: string): Promise<string> {
  const base = generateSlug(name);
  let slug = base || `campaign-${Date.now()}`;
  let i = 1;
  while (true) {
    const existing = await prisma.campaign.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${i++}`;
  }
  return slug;
}

async function resolveProductIds(scope: CreateCampaignInput['scope']): Promise<string[]> {
  if (scope.kind === 'products') return scope.productIds;
  const products = await prisma.product.findMany({
    where: { categoryId: scope.categoryId },
    select: { id: true },
  });
  return products.map((p) => p.id);
}

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/campaigns  (requireAdmin)
 */
export const getCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query as unknown as CampaignQueryInput;
  const skip = (page - 1) * limit;
  const now  = new Date();

  const where: Prisma.CampaignWhereInput = {};
  if (status && status !== 'all') {
    const map: Record<Exclude<CampaignStatusFilter, 'all'>, Prisma.CampaignWhereInput> = {
      active:   { startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      upcoming: { startsAt: { gt: now } },
      ended:    { endsAt: { lt: now } },
    };
    Object.assign(where, map[status]);
  }

  const [rows, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
    prisma.campaign.count({ where }),
  ]);

  return sendSuccess(res, rows.map(shape), 200, buildPagination(page, limit, total));
});

// ─── Get one ──────────────────────────────────────────────────────────────────

export const getCampaignById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Campaign id required');
  const c = await prisma.campaign.findUnique({
    where:   { id },
    include: { _count: { select: { products: true } } },
  });
  if (!c) throw ApiError.notFound('Campaign');
  return sendSuccess(res, shape(c));
});

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/campaigns  (requireAdmin)
 */
export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateCampaignInput;
  const now   = new Date();

  const slug = input.slug ? await uniqueCampaignSlug(input.slug) : await uniqueCampaignSlug(input.name);
  const productIds = await resolveProductIds(input.scope);

  if (productIds.length === 0) {
    throw ApiError.badRequest('Campaign must include at least one product');
  }

  const initialStatus = input.startsAt <= now ? 'ACTIVE' : 'DRAFT';

  const created = await prisma.$transaction(async (tx) => {
    const c = await tx.campaign.create({
      data: {
        name:          input.name,
        slug,
        description:   input.description ?? null,
        bannerUrl:     input.bannerUrl ?? null,
        status:        initialStatus,
        discountType:  input.discountType,
        discountValue: input.discountValue,
        startsAt:      input.startsAt,
        endsAt:        input.endsAt ?? null,
      },
    });
    await tx.campaignProduct.createMany({
      data: productIds.map((productId) => ({ campaignId: c.id, productId })),
      skipDuplicates: true,
    });
    return c;
  });

  await invalidateProductCaches();

  const withCount = await prisma.campaign.findUnique({
    where:   { id: created.id },
    include: { _count: { select: { products: true } } },
  });
  return sendCreated(res, shape(withCount!));
});

// ─── Update (only if not yet started) ─────────────────────────────────────────

/**
 * PATCH /api/v1/campaigns/:id  (requireAdmin)
 */
export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Campaign id required');
  const input = req.body as UpdateCampaignInput;

  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Campaign');

  const now = new Date();
  if (existing.startsAt <= now) {
    throw ApiError.conflict('Cannot edit a campaign that has already started. Use "End Now" to stop it.');
  }

  const data: Prisma.CampaignUpdateInput = {};
  if (input.name          !== undefined) data.name          = input.name;
  if (input.description   !== undefined) data.description   = input.description;
  if (input.bannerUrl     !== undefined) data.bannerUrl     = input.bannerUrl;
  if (input.discountType  !== undefined) data.discountType  = input.discountType;
  if (input.discountValue !== undefined) data.discountValue = input.discountValue;
  if (input.startsAt      !== undefined) data.startsAt      = input.startsAt;
  if (input.endsAt        !== undefined) data.endsAt        = input.endsAt;
  if (input.name          !== undefined) data.slug          = await uniqueCampaignSlug(input.name, id);

  const updated = await prisma.$transaction(async (tx) => {
    const c = await tx.campaign.update({ where: { id }, data });
    if (input.scope) {
      const productIds = await resolveProductIds(input.scope);
      await tx.campaignProduct.deleteMany({ where: { campaignId: id } });
      await tx.campaignProduct.createMany({
        data: productIds.map((productId) => ({ campaignId: id, productId })),
        skipDuplicates: true,
      });
    }
    return c;
  });

  await invalidateProductCaches();

  const withCount = await prisma.campaign.findUnique({
    where:   { id: updated.id },
    include: { _count: { select: { products: true } } },
  });
  return sendSuccess(res, shape(withCount!));
});

// ─── End now ──────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/campaigns/:id/end  (requireAdmin)
 */
export const endCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Campaign id required');

  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Campaign');

  const now = new Date();
  const updated = await prisma.campaign.update({
    where: { id },
    data:  { endsAt: now, status: 'ENDED' },
    include: { _count: { select: { products: true } } },
  });

  await invalidateProductCaches();
  return sendSuccess(res, shape(updated));
});

// ─── Delete (only if upcoming) ────────────────────────────────────────────────

/**
 * DELETE /api/v1/campaigns/:id  (requireAdmin)
 */
export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) throw ApiError.badRequest('Campaign id required');

  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Campaign');

  const now = new Date();
  if (existing.startsAt <= now) {
    throw ApiError.conflict('Cannot delete a campaign that has already started. End it instead.');
  }

  await prisma.campaign.delete({ where: { id } });
  await invalidateProductCaches();
  return sendNoContent(res);
});
