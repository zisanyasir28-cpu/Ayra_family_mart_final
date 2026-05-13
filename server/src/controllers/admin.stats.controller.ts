import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { UserRole } from '@superstore/shared';
import { prisma } from '../lib/prisma';
import { redis, REDIS_KEYS } from '../lib/redis';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, buildPagination } from '../utils/ApiResponse';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PeriodMetrics {
  orders:          number;
  revenueInPaisa:  number;
  newCustomers:    number;
  avgOrderInPaisa: number;
}

interface RevenueDay {
  date:           string; // YYYY-MM-DD
  revenueInPaisa: number;
  orders:         number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getPeriodMetrics(gte: Date | null): Promise<PeriodMetrics> {
  const where: Prisma.OrderWhereInput = gte ? { createdAt: { gte } } : {};
  const [orderAgg, newCustomers] = await Promise.all([
    prisma.order.aggregate({
      where,
      _count: { id: true },
      _sum:   { totalInPaisa: true },
    }),
    prisma.user.count({
      where: {
        role: UserRole.CUSTOMER,
        ...(gte && { createdAt: { gte } }),
      },
    }),
  ]);

  const orders          = orderAgg._count.id ?? 0;
  const revenueInPaisa  = orderAgg._sum.totalInPaisa ?? 0;
  const avgOrderInPaisa = orders > 0 ? Math.round(revenueInPaisa / orders) : 0;

  return { orders, revenueInPaisa, newCustomers, avgOrderInPaisa };
}

// ─── getDashboardStats ────────────────────────────────────────────────────────

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = REDIS_KEYS.dashboardStats();

  // 1. Try cache
  const cached = await redis.get<string>(cacheKey);
  if (cached) {
    const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
    return sendSuccess(res, parsed);
  }

  // 2. Build date anchors
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // 3. Fire all queries in parallel
  const [
    todayMetrics,
    weekMetrics,
    monthMetrics,
    allTimeMetrics,
    statusBreakdownRaw,
    recentOrders,
    lowStockProducts,
    topSellingRaw,
    revenueRaw,
  ] = await Promise.all([
    getPeriodMetrics(startOfDay),
    getPeriodMetrics(startOfWeek),
    getPeriodMetrics(startOfMonth),
    getPeriodMetrics(null),

    prisma.order.groupBy({
      by:     ['status'],
      _count: { id: true },
    }),

    prisma.order.findMany({
      take:    10,
      orderBy: { createdAt: 'desc' },
      include: {
        user:  { select: { id: true, name: true, email: true } },
        items: {
          take:    1,
          include: { product: { select: { images: { take: 1 } } } },
        },
      },
    }),

    prisma.product.findMany({
      where:   { stockQuantity: { lt: 10 }, status: 'ACTIVE' },
      orderBy: { stockQuantity: 'asc' },
      take:    10,
      select:  { id: true, name: true, sku: true, stockQuantity: true },
    }),

    prisma.orderItem.groupBy({
      by:    ['productId', 'productName'],
      where: { order: { createdAt: { gte: startOfMonth } } },
      _sum:  { quantity: true, totalPriceInPaisa: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take:  5,
    }),

    prisma.order.findMany({
      where:  { createdAt: { gte: thirtyDaysAgo } },
      select: { totalInPaisa: true, createdAt: true },
    }),
  ]);

  // 4. Aggregate revenueByDay (JS-side grouping)
  const dayMap = new Map<string, { revenueInPaisa: number; orders: number }>();

  // Pre-fill all 30 days with zeros
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dayMap.set(toYMD(d), { revenueInPaisa: 0, orders: 0 });
  }

  for (const o of revenueRaw) {
    const key = toYMD(new Date(o.createdAt));
    if (dayMap.has(key)) {
      const entry = dayMap.get(key)!;
      entry.revenueInPaisa += o.totalInPaisa;
      entry.orders         += 1;
    }
  }

  const revenueByDay: RevenueDay[] = Array.from(dayMap.entries()).map(
    ([date, v]) => ({ date, ...v }),
  );

  // 5. Shape response
  const result = {
    metrics: {
      today:     todayMetrics,
      thisWeek:  weekMetrics,
      thisMonth: monthMetrics,
      allTime:   allTimeMetrics,
    },
    orderStatusBreakdown: statusBreakdownRaw.map((r) => ({
      status: r.status,
      count:  r._count.id,
    })),
    recentOrders,
    lowStockProducts,
    topSellingProducts: topSellingRaw.map((r) => ({
      productId:      r.productId,
      productName:    r.productName,
      qtySold:        r._sum.quantity ?? 0,
      revenueInPaisa: r._sum.totalPriceInPaisa ?? 0,
    })),
    revenueByDay,
  };

  // 6. Cache for 2 minutes
  await redis.set(cacheKey, JSON.stringify(result), { ex: 120 });

  return sendSuccess(res, result);
});

// ─── getCustomers ─────────────────────────────────────────────────────────────

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const page     = Math.max(1, parseInt(String(req.query['page']  ?? '1'), 10));
  const limit    = Math.min(100, Math.max(1, parseInt(String(req.query['limit'] ?? '20'), 10)));
  const search   = String(req.query['search'] ?? '').trim();
  const isActiveQ = req.query['isActive'];

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    role: UserRole.CUSTOMER,
    ...(search && {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(isActiveQ !== undefined && {
      isActive: isActiveQ === 'true',
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        name:      true,
        email:     true,
        phone:     true,
        isActive:  true,
        role:      true,
        createdAt: true,
        _count:    { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Fetch total spent per user for this page
  const userIds = users.map((u) => u.id);
  const spends = userIds.length > 0
    ? await prisma.order.groupBy({
        by:    ['userId'],
        where: { userId: { in: userIds } },
        _sum:  { totalInPaisa: true },
      })
    : [];

  const spendMap = Object.fromEntries(
    spends.map((s) => [s.userId, s._sum.totalInPaisa ?? 0]),
  );

  const data = users.map((u) => ({
    ...u,
    totalSpentInPaisa: spendMap[u.id] ?? 0,
  }));

  return sendSuccess(res, data, 200, buildPagination(page, limit, total));
});

// ─── getCustomerById ──────────────────────────────────────────────────────────

export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id:        true,
      name:      true,
      email:     true,
      phone:     true,
      isActive:  true,
      role:      true,
      createdAt: true,
      _count:    { select: { orders: true } },
      orders: {
        take:    20,
        orderBy: { createdAt: 'desc' },
        select: {
          id:             true,
          orderNumber:    true,
          status:         true,
          totalInPaisa:   true,
          paymentMethod:  true,
          paymentStatus:  true,
          createdAt:      true,
          items: {
            select: {
              id:                true,
              productName:       true,
              quantity:          true,
              unitPriceInPaisa:  true,
              totalPriceInPaisa: true,
            },
          },
        },
      },
    },
  });

  if (!customer) throw ApiError.notFound('Customer');

  const totalSpentInPaisa = customer.orders.reduce(
    (sum, o) => sum + o.totalInPaisa,
    0,
  );

  return sendSuccess(res, { ...customer, totalSpentInPaisa });
});

// ─── banCustomer ──────────────────────────────────────────────────────────────

export const banCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw ApiError.notFound('Customer');

  const updated = await prisma.user.update({
    where:  { id },
    data:   { isActive: false },
    select: { id: true, isActive: true },
  });

  return sendSuccess(res, updated);
});

// ─── unbanCustomer ────────────────────────────────────────────────────────────

export const unbanCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw ApiError.notFound('Customer');

  const updated = await prisma.user.update({
    where:  { id },
    data:   { isActive: true },
    select: { id: true, isActive: true },
  });

  return sendSuccess(res, updated);
});
