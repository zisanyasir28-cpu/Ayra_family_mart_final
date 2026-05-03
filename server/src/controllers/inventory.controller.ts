import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, buildPagination } from '../utils/ApiResponse';
import type { AdjustStockInput, StockHistoryQueryInput } from '@superstore/shared';

/**
 * POST /api/v1/inventory/adjust  (admin)
 * Adjusts stock for a product and records an audit log entry.
 */
export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { productId, changeAmount, reason, note } =
    req.body as AdjustStockInput;
  const userId = req.user!.sub;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stockQuantity: true },
  });
  if (!product) throw ApiError.notFound('Product');

  const newQuantity = product.stockQuantity + changeAmount;
  if (newQuantity < 0) {
    throw ApiError.badRequest(
      `Stock adjustment would result in negative quantity (current: ${product.stockQuantity}, change: ${changeAmount}).`,
    );
  }

  const [updatedProduct, log] = await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newQuantity,
        // Auto-update status based on stock
        ...(newQuantity === 0 && { status: 'OUT_OF_STOCK' }),
        ...(newQuantity > 0 && product.stockQuantity === 0 && {
          status: 'ACTIVE',
        }),
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        status: true,
        lowStockThreshold: true,
      },
    }),
    prisma.stockLog.create({
      data: {
        productId,
        changeAmount,
        reason,
        performedBy: userId,
        note,
      },
    }),
  ]);

  return sendSuccess(res, {
    product: updatedProduct,
    log,
    isLowStock: updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold,
  });
});

/**
 * GET /api/v1/inventory/history  (admin)
 * Paginated audit log. Optional ?productId filter.
 */
export const getStockHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, page = 1, limit = 20 } =
      req.query as unknown as StockHistoryQueryInput;

    const p = Number(page);
    const l = Number(limit);

    const where = productId ? { productId } : {};

    const [total, logs] = await Promise.all([
      prisma.stockLog.count({ where }),
      prisma.stockLog.findMany({
        where,
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          performer: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return sendSuccess(res, logs, 200, buildPagination(p, l, total));
  },
);
