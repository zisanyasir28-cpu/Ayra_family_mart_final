import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import {
  uploadProductImage,
  deleteImage,
  generateThumbnailUrl,
} from '../lib/cloudinary';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  buildPagination,
} from '../utils/ApiResponse';
import { uniqueProductSlug } from '../utils/slug';
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  BulkPriceUpdateInput,
} from '@superstore/shared';

// ─── Cache Helpers ────────────────────────────────────────────────────────────

const PRODUCT_TTL = 60 * 10;   // 10 minutes (single product)
const LIST_TTL    = 60 * 5;    // 5 minutes  (list)
const FEATURED_TTL = 60 * 15;  // 15 minutes (featured)

function listCacheKey(params: Record<string, unknown>): string {
  const sorted = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return `products:list:${JSON.stringify(sorted)}`;
}

export async function invalidateProductCaches(productId?: string): Promise<void> {
  const patterns = ['products:list:*', 'products:featured', 'products:low-stock'];
  if (productId) patterns.push(`products:${productId}`);

  // Upstash Redis doesn't support KEYS in serverless — delete known keys
  await Promise.allSettled(
    patterns.map((p) => {
      if (p.includes('*')) return Promise.resolve(); // skip wildcard — handled below
      return redis.del(p);
    }),
  );

  // For list keys we tag them with a version counter and bump it
  await redis.incr('products:list:version');
}

// ─── Effective Price Calculation ─────────────────────────────────────────────

type CampaignSnippet = {
  discountType: string;
  discountValue: number;
};

export function calcEffectivePrice(
  priceInPaisa: number,
  campaign: CampaignSnippet | null,
): number {
  if (!campaign) return priceInPaisa;
  if (campaign.discountType === 'PERCENTAGE') {
    return Math.round(priceInPaisa * (1 - campaign.discountValue / 100));
  }
  return Math.max(0, priceInPaisa - campaign.discountValue);
}

// ─── Prisma include snippets ──────────────────────────────────────────────────

const NOW = () => new Date();

const activeCampaignFilter: Prisma.CampaignProductWhereInput = {
  campaign: {
    status: 'ACTIVE',
    startsAt: { lte: NOW() },
    OR: [{ endsAt: null }, { endsAt: { gte: NOW() } }],
  },
};

export const productListInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  category: { select: { id: true, name: true, slug: true } },
  campaignProducts: {
    where: activeCampaignFilter,
    include: {
      campaign: {
        select: {
          id: true,
          discountType: true,
          discountValue: true,
          endsAt: true,
        },
      },
    },
    take: 1,
  },
} satisfies Prisma.ProductInclude;

const productDetailInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: true,
  brand: true,
  campaignProducts: {
    where: activeCampaignFilter,
    include: { campaign: true },
    take: 1,
  },
  reviews: { select: { rating: true } },
  _count: { select: { reviews: true } },
} satisfies Prisma.ProductInclude;

// ─── sortBy → Prisma orderBy ──────────────────────────────────────────────────

function toOrderBy(
  sortBy: ProductQueryInput['sortBy'],
): Prisma.ProductOrderByWithRelationInput {
  switch (sortBy) {
    case 'price_asc':  return { priceInPaisa: 'asc' };
    case 'price_desc': return { priceInPaisa: 'desc' };
    case 'newest':     return { createdAt: 'desc' };
    case 'oldest':     return { createdAt: 'asc' };
    case 'name_asc':   return { name: 'asc' };
    case 'name_desc':  return { name: 'desc' };
    default:           return { createdAt: 'desc' };
  }
}

// ─── Trigram search helper ────────────────────────────────────────────────────

/**
 * Runs a similarity() query against the products table. Returns product IDs
 * ordered by relevance (best match first). Falls back to an empty array if
 * the pg_trgm extension isn't installed — caller should then use ILIKE.
 */
async function searchWithTrgm(term: string): Promise<string[]> {
  try {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM products
      WHERE status = 'ACTIVE'
        AND (similarity(name, ${term}) > 0.2
             OR name ILIKE ${'%' + term + '%'}
             OR description ILIKE ${'%' + term + '%'})
      ORDER BY similarity(name, ${term}) DESC, name ASC
      LIMIT 200
    `;
    return rows.map((r) => r.id);
  } catch {
    return [];
  }
}

// ─── Public Controllers ───────────────────────────────────────────────────────

/**
 * GET /api/v1/products
 * Full-featured paginated product listing with filters + campaign pricing.
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as ProductQueryInput;
  const page   = Number(q.page   ?? 1);
  const limit  = Number(q.limit  ?? 12);
  const sortBy = q.sortBy ?? 'newest';

  // Price filter: convert BDT (taka) → paisa
  const minPricePaisa = q.minPrice != null ? Math.round(Number(q.minPrice) * 100) : undefined;
  const maxPricePaisa = q.maxPrice != null ? Math.round(Number(q.maxPrice) * 100) : undefined;

  // Cache lookup — version-tagged
  const version = (await redis.get<number>('products:list:version')) ?? 0;
  const cacheKey = listCacheKey({ ...q, _v: version });
  const cached = await redis.get<unknown>(cacheKey);
  if (cached) return sendSuccess(res, cached);

  const where: Prisma.ProductWhereInput = {
    status: q.status ?? 'ACTIVE',
    ...(q.categoryId && { categoryId: q.categoryId }),
    ...(q.brandId    && { brandId: q.brandId }),
    ...(q.isFeatured !== undefined && { isFeatured: Boolean(q.isFeatured) }),
    ...(q.inStock    && { stockQuantity: { gt: 0 } }),
    ...((minPricePaisa != null || maxPricePaisa != null) && {
      priceInPaisa: {
        ...(minPricePaisa != null && { gte: minPricePaisa }),
        ...(maxPricePaisa != null && { lte: maxPricePaisa }),
      },
    }),
  };

  // ── Search: pg_trgm for >2 chars (fuzzy + relevance), ILIKE for 1-2 chars ──
  if (q.search) {
    const term = q.search.trim();
    if (term.length > 2) {
      // Try trigram first (requires pg_trgm extension + GIN index).
      const trgmIds = await searchWithTrgm(term).catch(() => [] as string[]);
      if (trgmIds.length > 0) {
        where.id = { in: trgmIds };
      } else {
        // Fallback: substring ILIKE (works without pg_trgm)
        where.OR = [
          { name:        { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { sku:         { contains: term, mode: 'insensitive' } },
        ];
      }
    } else {
      // Too short for similarity to be useful — plain prefix-style match
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku:  { contains: term, mode: 'insensitive' } },
      ];
    }
  }

  const [total, rawProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: toOrderBy(sortBy),
      skip:    (page - 1) * limit,
      take:    limit,
      include: productListInclude,
    }),
  ]);

  const products = rawProducts.map((p) => {
    const campaign = p.campaignProducts[0]?.campaign ?? null;
    const effectivePriceInPaisa = calcEffectivePrice(p.priceInPaisa, campaign);
    return {
      ...p,
      effectivePriceInPaisa,
      activeCampaign: campaign
        ? {
            id:            campaign.id,
            discountType:  campaign.discountType,
            discountValue: campaign.discountValue,
            endsAt:        campaign.endsAt,
          }
        : null,
      campaignProducts: undefined, // omit raw join data from response
    };
  });

  const pagination = buildPagination(page, limit, total);
  const payload = { products, meta: { pagination } };

  await redis.set(cacheKey, payload, { ex: LIST_TTL });
  return sendSuccess(res, products, 200, pagination);
});

/**
 * GET /api/v1/products/featured
 */
export const getFeaturedProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const cacheKey = 'products:featured';
    const cached = await redis.get<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached);

    const products = await prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE' },
      orderBy: [{ stockQuantity: 'desc' }, { createdAt: 'desc' }],
      take: 8,
      include: productListInclude,
    });

    const enriched = products.map((p) => {
      const campaign = p.campaignProducts[0]?.campaign ?? null;
      return {
        ...p,
        effectivePriceInPaisa: calcEffectivePrice(p.priceInPaisa, campaign),
        activeCampaign: campaign ?? null,
        campaignProducts: undefined,
      };
    });

    await redis.set(cacheKey, enriched, { ex: FEATURED_TTL });
    return sendSuccess(res, enriched);
  },
);

/**
 * GET /api/v1/products/autocomplete?q=
 * Lightweight search suggestion endpoint. Returns up to 8 results sorted by
 * trigram similarity. Cached in Redis for 60 seconds per query.
 */
export const autocomplete = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query['q'] ?? '').trim();
  if (q.length < 2) {
    return sendSuccess(res, []);
  }

  const cacheKey = `products:autocomplete:${q.toLowerCase()}`;
  const cached = await redis.get<unknown>(cacheKey).catch(() => null);
  if (cached) return sendSuccess(res, cached);

  let rows: Array<{
    id: string; name: string; slug: string; priceInPaisa: number; imageUrl: string | null;
  }> = [];

  try {
    rows = await prisma.$queryRaw`
      SELECT p.id, p.name, p.slug, p."priceInPaisa",
             (SELECT url FROM product_images WHERE "productId" = p.id ORDER BY "sortOrder" ASC LIMIT 1) AS "imageUrl"
      FROM products p
      WHERE p.status = 'ACTIVE'
        AND (similarity(p.name, ${q}) > 0.15 OR p.name ILIKE ${'%' + q + '%'})
      ORDER BY similarity(p.name, ${q}) DESC, p.name ASC
      LIMIT 8
    `;
  } catch {
    // pg_trgm missing → fallback to plain ILIKE via Prisma
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        name:   { contains: q, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
      take: 8,
      select: {
        id: true, name: true, slug: true, priceInPaisa: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true } },
      },
    });
    rows = products.map((p) => ({
      id:           p.id,
      name:         p.name,
      slug:         p.slug,
      priceInPaisa: p.priceInPaisa,
      imageUrl:     p.images[0]?.url ?? null,
    }));
  }

  await redis.set(cacheKey, rows, { ex: 60 }).catch(() => {});
  return sendSuccess(res, rows);
});

/**
 * GET /api/v1/products/:slug
 */
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const cacheKey = `products:${slug}`;

    const cached = await redis.get<unknown>(cacheKey);
    if (cached) return sendSuccess(res, cached);

    const raw = await prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: productDetailInclude,
    });
    if (!raw) throw ApiError.notFound('Product');

    const campaign = raw.campaignProducts[0]?.campaign ?? null;
    const averageRating =
      raw.reviews.length > 0
        ? raw.reviews.reduce((s, r) => s + r.rating, 0) / raw.reviews.length
        : null;

    const product = {
      ...raw,
      effectivePriceInPaisa: calcEffectivePrice(raw.priceInPaisa, campaign),
      activeCampaign: campaign ?? null,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
      reviewCount: raw._count.reviews,
      reviews: undefined,
      _count: undefined,
      campaignProducts: undefined,
    };

    await redis.set(cacheKey, product, { ex: PRODUCT_TTL });
    return sendSuccess(res, product);
  },
);

/**
 * GET /api/v1/products/:id/related
 */
export const getRelatedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    if (!product) throw ApiError.notFound('Product');

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
        status: 'ACTIVE',
      },
      take: 4,
      orderBy: { isFeatured: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    });

    return sendSuccess(res, related);
  },
);

// ─── Admin Controllers ────────────────────────────────────────────────────────

/**
 * POST /api/v1/products  (admin)
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as CreateProductInput;
    const files = (req.files ?? []) as Express.Multer.File[];

    const slug = await uniqueProductSlug(body.name);

    // Upload all images in parallel
    const uploadedImages = await Promise.all(
      files.map((f, i) =>
        uploadProductImage(f.buffer).then((r) => ({ ...r, sortOrder: i })),
      ),
    );

    const product = await prisma.product.create({
      data: {
        name:                body.name,
        slug,
        description:         body.description,
        sku:                 body.sku,
        barcode:             body.barcode,
        priceInPaisa:        body.priceInPaisa,
        comparePriceInPaisa: body.comparePriceInPaisa,
        costPriceInPaisa:    body.costPriceInPaisa,
        stockQuantity:       body.stockQuantity,
        lowStockThreshold:   body.lowStockThreshold,
        unit:                body.unit,
        weight:              body.weight,
        categoryId:          body.categoryId,
        brandId:             body.brandId,
        tags:                body.tags,
        isFeatured:          body.isFeatured,
        status:              body.status,
        images: {
          create: uploadedImages.map((img) => ({
            url:       img.url,
            publicId:  img.publicId,
            sortOrder: img.sortOrder,
          })),
        },
      },
      include: {
        images:   { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, slug: true } },
      },
    });

    await invalidateProductCaches();
    return sendCreated(res, product);
  },
);

/**
 * PATCH /api/v1/products/:id  (admin)
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateProductInput & {
      removeImageIds?: string[];
    };
    const newFiles = (req.files ?? []) as Express.Multer.File[];

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) throw ApiError.notFound('Product');

    // Handle removed images
    if (body.removeImageIds?.length) {
      const toDelete = existing.images.filter((img) =>
        body.removeImageIds!.includes(img.id),
      );
      await Promise.all([
        ...toDelete.map((img) => deleteImage(img.publicId).catch(() => null)),
        prisma.productImage.deleteMany({
          where: { id: { in: toDelete.map((i) => i.id) } },
        }),
      ]);
    }

    // Upload new images
    const nextSortOrder = existing.images.length;
    const newUploads = await Promise.all(
      newFiles.map((f, i) =>
        uploadProductImage(f.buffer).then((r) => ({
          ...r,
          sortOrder: nextSortOrder + i,
        })),
      ),
    );

    // Regenerate slug only if name changed
    let slug = existing.slug;
    if (body.name && body.name !== existing.name) {
      slug = await uniqueProductSlug(body.name, id);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name                !== undefined && { name: body.name }),
        slug,
        ...(body.description         !== undefined && { description: body.description }),
        ...(body.sku                 !== undefined && { sku: body.sku }),
        ...(body.barcode             !== undefined && { barcode: body.barcode }),
        ...(body.priceInPaisa        !== undefined && { priceInPaisa: body.priceInPaisa }),
        ...(body.comparePriceInPaisa !== undefined && { comparePriceInPaisa: body.comparePriceInPaisa }),
        ...(body.costPriceInPaisa    !== undefined && { costPriceInPaisa: body.costPriceInPaisa }),
        ...(body.stockQuantity       !== undefined && { stockQuantity: body.stockQuantity }),
        ...(body.lowStockThreshold   !== undefined && { lowStockThreshold: body.lowStockThreshold }),
        ...(body.unit                !== undefined && { unit: body.unit }),
        ...(body.weight              !== undefined && { weight: body.weight }),
        ...(body.categoryId          !== undefined && { categoryId: body.categoryId }),
        ...(body.brandId             !== undefined && { brandId: body.brandId }),
        ...(body.tags                !== undefined && { tags: body.tags }),
        ...(body.isFeatured          !== undefined && { isFeatured: body.isFeatured }),
        ...(body.status              !== undefined && { status: body.status }),
        ...(newUploads.length > 0 && {
          images: {
            create: newUploads.map((img) => ({
              url:       img.url,
              publicId:  img.publicId,
              sortOrder: img.sortOrder,
            })),
          },
        }),
      },
      include: {
        images:   { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, slug: true } },
      },
    });

    await invalidateProductCaches(id);
    return sendSuccess(res, updated);
  },
);

/**
 * DELETE /api/v1/products/:id  (admin)
 * Soft delete — blocks if product has active orders.
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product');

    const activeOrders = await prisma.orderItem.count({
      where: {
        productId: id,
        order: {
          status: {
            notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
          },
        },
      },
    });

    if (activeOrders > 0) {
      throw ApiError.badRequest(
        `Cannot delete product — it has ${activeOrders} active order(s).`,
      );
    }

    await prisma.product.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    await invalidateProductCaches(id);
    return sendNoContent(res);
  },
);

function buildBulkWhere(body: BulkPriceUpdateInput): Prisma.ProductWhereInput {
  switch (body.type) {
    case 'by_ids':
      return { id: { in: body.ids! } };
    case 'by_category':
      return { categoryId: body.categoryId!, status: 'ACTIVE' };
    case 'all_active':
      return { status: 'ACTIVE' };
  }
}

function computeNewPrice(oldPrice: number, body: BulkPriceUpdateInput): number {
  return body.changeType === 'percentage'
    ? Math.max(1, Math.round(oldPrice * (1 + body.changeValue / 100)))
    : Math.max(1, oldPrice + Math.round(body.changeValue * 100));
}

/**
 * POST /api/v1/products/bulk-price/preview  (admin)
 * Read-only — returns affected count and a sample of before/after prices.
 */
export const bulkPricePreview = asyncHandler(
  async (req: Request, res: Response) => {
    const body  = req.body as BulkPriceUpdateInput;
    const where = buildBulkWhere(body);

    const [affectedCount, sample] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: { id: true, name: true, priceInPaisa: true },
        take: 5,
        orderBy: { name: 'asc' },
      }),
    ]);

    const sampleProducts = sample.map((p) => ({
      id:           p.id,
      name:         p.name,
      oldPriceInPaisa: p.priceInPaisa,
      newPriceInPaisa: computeNewPrice(p.priceInPaisa, body),
    }));

    return sendSuccess(res, { affectedCount, sampleProducts });
  },
);

/**
 * POST /api/v1/products/bulk-price  (admin)
 * Accepts percentage or fixed-amount adjustment across a set of products.
 */
export const bulkUpdatePrice = asyncHandler(
  async (req: Request, res: Response) => {
    const body  = req.body as BulkPriceUpdateInput;
    const where = buildBulkWhere(body);

    // Fetch products to calculate new prices
    const products = await prisma.product.findMany({
      where,
      select: { id: true, priceInPaisa: true },
    });

    if (products.length === 0) {
      throw ApiError.notFound('No matching products found for bulk update');
    }

    // Run all price updates in a single transaction
    await prisma.$transaction(
      products.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data:  { priceInPaisa: computeNewPrice(p.priceInPaisa, body) },
        }),
      ),
    );

    await invalidateProductCaches();
    return sendSuccess(res, { affectedCount: products.length });
  },
);

/**
 * GET /api/v1/products/low-stock  (admin)
 */
export const getLowStockProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    // Prisma doesn't support column-to-column comparisons — use raw SQL (exception per CLAUDE.md)
    const lowStock = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        sku: string;
        stock_quantity: number;
        low_stock_threshold: number;
        status: string;
      }>
    >`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.low_stock_threshold,
        p.status,
        pi.url AS first_image_url
      FROM products p
      LEFT JOIN LATERAL (
        SELECT url FROM product_images
        WHERE product_id = p.id
        ORDER BY sort_order ASC
        LIMIT 1
      ) pi ON true
      WHERE p.status = 'ACTIVE'
        AND p.stock_quantity <= p.low_stock_threshold
      ORDER BY p.stock_quantity ASC
    `;

    return sendSuccess(res, lowStock);
  },
);
