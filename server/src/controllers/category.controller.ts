import type { Request, Response, NextFunction } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { uploadCategoryImage, deleteImage } from '../lib/cloudinary';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated, sendNoContent, buildPagination } from '../utils/ApiResponse';
import { uniqueCategorySlug } from '../utils/slug';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
  ProductQueryInput,
} from '@superstore/shared';

const CACHE_KEY_TREE = 'categories:tree';
const CACHE_TTL_TREE = 60 * 10; // 10 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function invalidateCategoryCache(): Promise<void> {
  await redis.del(CACHE_KEY_TREE);
}

// ─── Public Controllers ───────────────────────────────────────────────────────

/**
 * GET /api/v1/categories
 * Returns nested tree: root categories → children → productCount each.
 */
export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const cached = await redis.get<unknown>(CACHE_KEY_TREE);
    if (cached) return sendSuccess(res, cached);

    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { status: 'ACTIVE' } } },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { products: { where: { status: 'ACTIVE' } } },
            },
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                _count: {
                  select: { products: { where: { status: 'ACTIVE' } } },
                },
              },
            },
          },
        },
      },
    });

    await redis.set(CACHE_KEY_TREE, categories, { ex: CACHE_TTL_TREE });
    return sendSuccess(res, categories);
  },
);

/**
 * GET /api/v1/categories/:slug
 * Single category with subcategories + paginated products.
 */
export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const { page = 1, limit = 12 } = req.query as Partial<ProductQueryInput>;

    const category = await prisma.category.findFirst({
      where: { slug, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { products: { where: { status: 'ACTIVE' } } },
            },
          },
        },
      },
    });

    if (!category) throw ApiError.notFound('Category');

    // All category ids to include (parent + all descendants)
    const descendantIds = await getAllDescendantIds(category.id);
    const categoryIds = [category.id, ...descendantIds];

    const [total, products] = await Promise.all([
      prisma.product.count({
        where: { categoryId: { in: categoryIds }, status: 'ACTIVE' },
      }),
      prisma.product.findMany({
        where: { categoryId: { in: categoryIds }, status: 'ACTIVE' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
      }),
    ]);

    return sendSuccess(
      res,
      { category, products },
      200,
      buildPagination(Number(page), Number(limit), total),
    );
  },
);

// ─── Admin Controllers ────────────────────────────────────────────────────────

/**
 * POST /api/v1/categories
 */
export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as CreateCategoryInput;
    const file = req.file as Express.Multer.File | undefined;

    const slug = await uniqueCategorySlug(body.name);

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (file) {
      const result = await uploadCategoryImage(file.buffer);
      imageUrl = result.url;
      imagePublicId = result.publicId;
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        parentId: body.parentId,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
        ...(imageUrl && { imageUrl, imagePublicId }),
      },
    });

    await invalidateCategoryCache();
    return sendCreated(res, category);
  },
);

/**
 * PATCH /api/v1/categories/:id
 */
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateCategoryInput;
    const file = req.file as Express.Multer.File | undefined;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Category');

    let imageUrl = existing.imageUrl ?? undefined;
    let imagePublicId = existing.imagePublicId ?? undefined;

    if (file) {
      // Delete old image from Cloudinary if present
      if (existing.imagePublicId) {
        await deleteImage(existing.imagePublicId).catch(() => null);
      }
      const result = await uploadCategoryImage(file.buffer);
      imageUrl = result.url;
      imagePublicId = result.publicId;
    }

    let slug = existing.slug;
    if (body.name && body.name !== existing.name) {
      slug = await uniqueCategorySlug(body.name, id);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        slug,
        ...(body.description !== undefined && { description: body.description }),
        ...(body.parentId !== undefined && { parentId: body.parentId }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        imageUrl: imageUrl ?? null,
        imagePublicId: imagePublicId ?? null,
      },
    });

    await invalidateCategoryCache();
    return sendSuccess(res, updated);
  },
);

/**
 * DELETE /api/v1/categories/:id
 * Soft delete — blocks if active products exist.
 */
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw ApiError.notFound('Category');

    const activeProducts = await prisma.product.count({
      where: { categoryId: id, status: { not: 'INACTIVE' } },
    });

    if (activeProducts > 0) {
      throw ApiError.badRequest(
        `Cannot delete category — it has ${activeProducts} active product(s). Reassign or deactivate them first.`,
      );
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    await invalidateCategoryCache();
    return sendNoContent(res);
  },
);

/**
 * POST /api/v1/categories/reorder
 * Accepts [{ id, sortOrder }] and bulk-updates sort positions.
 */
export const reorderCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { items } = req.body as ReorderCategoriesInput;

    await prisma.$transaction(
      items.map(({ id, sortOrder }) =>
        prisma.category.update({ where: { id }, data: { sortOrder } }),
      ),
    );

    await invalidateCategoryCache();
    return sendSuccess(res, { updated: items.length });
  },
);

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function getAllDescendantIds(parentId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId, isActive: true },
    select: { id: true },
  });
  if (children.length === 0) return [];

  const ids = children.map((c) => c.id);
  const grandchildIds = await Promise.all(ids.map(getAllDescendantIds));
  return [...ids, ...grandchildIds.flat()];
}
