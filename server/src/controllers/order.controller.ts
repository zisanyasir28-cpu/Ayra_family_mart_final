/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated, buildPagination } from '../utils/ApiResponse';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { validateCouponForUser } from '../services/coupon.service';
import { sendOrderConfirmation, sendOrderStatusChange } from '../lib/email';
import { createNotification } from './notification.controller';
import { initiatePayment } from '../lib/sslcommerz';
import type {
  CreateOrderInput,
  OrderQueryInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
  AddressInput,
} from '@superstore/shared';

// ─── Pricing constants ────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD_PAISA = 99_900; // ৳999
const STANDARD_SHIPPING_PAISA       = 6_000;  // ৳60
const COD_SURCHARGE_PAISA           = 2_000;  // ৳20
const MAX_ORDER_NUMBER_RETRIES      = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function snapshotAddress(addr: {
  fullName: string; phone: string; addressLine1: string;
  addressLine2?: string | null; district: string; thana: string;
  postalCode?: string | null;
}) {
  return {
    snapFullName:     addr.fullName,
    snapPhone:        addr.phone,
    snapAddressLine1: addr.addressLine1,
    snapAddressLine2: addr.addressLine2 ?? null,
    snapDistrict:     addr.district,
    snapThana:        addr.thana,
    snapPostalCode:   addr.postalCode ?? null,
  };
}

function computeShipping(subtotalMinusDiscount: number, paymentMethod: string): number {
  const base = subtotalMinusDiscount >= FREE_SHIPPING_THRESHOLD_PAISA ? 0 : STANDARD_SHIPPING_PAISA;
  return paymentMethod === 'COD' ? base + COD_SURCHARGE_PAISA : base;
}

// ─── createOrder ──────────────────────────────────────────────────────────────

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const body   = req.body as CreateOrderInput;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.unauthorized('User not found');

  // 1. Resolve shipping address
  let snapAddr: ReturnType<typeof snapshotAddress>;
  let addressId: string | null = null;

  if (body.shippingAddressId) {
    const addr = await prisma.address.findUnique({ where: { id: body.shippingAddressId } });
    if (!addr || addr.userId !== userId) {
      throw ApiError.notFound('Address', 'ADDRESS_NOT_FOUND');
    }
    addressId = addr.id;
    snapAddr  = snapshotAddress(addr);
  } else if (body.shippingAddress) {
    const a = body.shippingAddress as AddressInput;
    snapAddr = snapshotAddress(a);
  } else {
    throw ApiError.badRequest('Shipping address is required');
  }

  // 2. Transactional core
  type CreatedOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
  let order!: CreatedOrder;

  for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_RETRIES; attempt++) {
    try {
      order = await prisma.$transaction(async (tx: any) => {
        const productIds = body.items.map((i) => i.productId);
        const products   = await tx.product.findMany({
          where:  { id: { in: productIds } },
          select: { id: true, name: true, sku: true, priceInPaisa: true, stockQuantity: true, status: true },
        });
        const productMap = new Map(products.map((p: any) => [p.id, p]));

        // Validate every cart line against authoritative DB data
        const itemRows: Array<{
          productId: string; productName: string; productSku: string;
          quantity: number; unitPriceInPaisa: number; totalPriceInPaisa: number;
        }> = [];
        let subtotalInPaisa = 0;

        for (const item of body.items) {
          const product = productMap.get(item.productId) as any;
          if (!product) {
            throw ApiError.notFound('Product', 'PRODUCT_NOT_FOUND');
          }
          if (product.status !== 'ACTIVE') {
            throw ApiError.badRequest(
              `Product "${product.name}" is no longer available`,
              { productId: product.id },
              'PRODUCT_INACTIVE',
            );
          }
          if (product.stockQuantity < item.quantity) {
            throw ApiError.conflict(
              `Insufficient stock for "${product.name}"`,
              { productId: product.id, available: product.stockQuantity, requested: item.quantity },
              'INSUFFICIENT_STOCK',
            );
          }

          const unitPrice  = product.priceInPaisa;
          const lineTotal  = unitPrice * item.quantity;
          subtotalInPaisa += lineTotal;
          itemRows.push({
            productId:         product.id,
            productName:       product.name,
            productSku:        product.sku,
            quantity:          item.quantity,
            unitPriceInPaisa:  unitPrice,
            totalPriceInPaisa: lineTotal,
          });
        }

        // Coupon
        let discountInPaisa = 0;
        let appliedCouponId: string | null = null;
        let appliedCouponCode: string | null = null;
        if (body.couponCode && body.couponCode.trim()) {
          const result = await validateCouponForUser(tx, body.couponCode, userId, subtotalInPaisa);
          discountInPaisa   = result.discountInPaisa;
          appliedCouponId   = result.couponId;
          appliedCouponCode = result.code;
        }

        const shippingInPaisa = computeShipping(subtotalInPaisa - discountInPaisa, body.paymentMethod);
        const totalInPaisa    = subtotalInPaisa - discountInPaisa + shippingInPaisa;

        const orderNumber = generateOrderNumber();
        const created = await tx.order.create({
          data: {
            orderNumber,
            userId,
            addressId,
            status:          'PENDING',
            paymentStatus:   body.paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
            paymentMethod:   body.paymentMethod,
            subtotalInPaisa,
            discountInPaisa,
            shippingInPaisa,
            totalInPaisa,
            couponCode:      appliedCouponCode,
            notes:           body.notes ?? null,
            ...snapAddr,
            items:           { create: itemRows },
            statusHistory:   { create: { status: 'PENDING', note: 'Order placed' } },
            payment:         {
              create: {
                method:        body.paymentMethod,
                status:        body.paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
                amountInPaisa: totalInPaisa,
              },
            },
          },
          include: { items: true },
        });

        // Decrement stock atomically per item
        for (const item of body.items) {
          await tx.product.update({
            where: { id: item.productId },
            data:  { stockQuantity: { decrement: item.quantity } },
          });
        }

        // Coupon usage
        if (appliedCouponId) {
          await tx.coupon.update({
            where: { id: appliedCouponId },
            data:  { usageCount: { increment: 1 } },
          });
          await tx.couponUsage.create({
            data: { couponId: appliedCouponId, userId, orderId: created.id },
          });
        }

        return created;
      });
      break; // success
    } catch (err: any) {
      // Unique constraint on orderNumber → retry
      if (err?.code === 'P2002' && attempt < MAX_ORDER_NUMBER_RETRIES) continue;
      throw err;
    }
  }

  // 3. Post-transaction side effects
  void createNotification(
    userId,
    'ORDER_CREATED',
    'Order Placed!',
    `Your order ${order.orderNumber} has been confirmed.`,
    order.id,
  ).catch(() => {});

  if (body.paymentMethod === 'COD') {
    void sendOrderConfirmation(
      {
        orderNumber:     order.orderNumber,
        totalInPaisa:    order.totalInPaisa,
        subtotalInPaisa: order.subtotalInPaisa,
        shippingInPaisa: order.shippingInPaisa,
        discountInPaisa: order.discountInPaisa,
        paymentMethod:   order.paymentMethod,
        items:           order.items.map((i) => ({
          productName:       i.productName,
          quantity:          i.quantity,
          totalPriceInPaisa: i.totalPriceInPaisa,
        })),
      },
      { email: user.email, name: user.name },
    ).catch((e) => console.error('[email] order confirmation failed', e));

    return sendCreated(res, { order });
  }

  // SSLCommerz
  const { gatewayUrl, sessionKey } = await initiatePayment({
    orderId:       order.id,
    orderNumber:   order.orderNumber,
    amountInPaisa: order.totalInPaisa,
    customer:      { name: user.name, email: user.email, phone: user.phone ?? '' },
  });

  await prisma.payment.update({
    where: { orderId: order.id },
    data:  { gatewayRef: sessionKey },
  });

  return sendCreated(res, { order, gatewayUrl });
});

// ─── getMyOrders ──────────────────────────────────────────────────────────────

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const q = req.query as unknown as OrderQueryInput;

  const where: Prisma.OrderWhereInput = {
    userId,
    ...(q.status        && { status:        q.status }),
    ...(q.paymentMethod && { paymentMethod: q.paymentMethod }),
    ...((q.dateFrom || q.dateTo) && {
      createdAt: {
        ...(q.dateFrom && { gte: q.dateFrom }),
        ...(q.dateTo   && { lte: q.dateTo }),
      },
    }),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { [q.sortBy]: q.sortOrder },
      skip:    (q.page - 1) * q.limit,
      take:    q.limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                slug:   true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  return sendSuccess(res, orders, 200, buildPagination(q.page, q.limit, total));
});

// ─── getMyOrderById ───────────────────────────────────────────────────────────

export const getMyOrderById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { id } = req.params as { id: string };

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug:   true,
              images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
            },
          },
        },
      },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payment:       true,
    },
  });

  if (!order || order.userId !== userId) {
    throw ApiError.notFound('Order');
  }

  return sendSuccess(res, order);
});

// ─── cancelOrder ──────────────────────────────────────────────────────────────

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { id } = req.params as { id: string };
  const { reason } = req.body as CancelOrderInput;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.unauthorized();

  const order = await prisma.$transaction(async (tx: any) => {
    const existing = await tx.order.findUnique({
      where:   { id },
      include: { items: true, couponUsage: true },
    });
    if (!existing || existing.userId !== userId) {
      throw ApiError.notFound('Order');
    }
    if (existing.status !== 'PENDING' && existing.status !== 'CONFIRMED') {
      throw ApiError.badRequest(
        `Order in status ${existing.status} cannot be cancelled`,
        { status: existing.status },
        'ORDER_NOT_CANCELLABLE',
      );
    }

    // Restore stock
    for (const item of existing.items) {
      await tx.product.update({
        where: { id: item.productId },
        data:  { stockQuantity: { increment: item.quantity } },
      });
    }

    // Reverse coupon usage
    if (existing.couponUsage) {
      await tx.couponUsage.delete({ where: { id: existing.couponUsage.id } });
      await tx.coupon.update({
        where: { id: existing.couponUsage.couponId },
        data:  { usageCount: { decrement: 1 } },
      });
    }

    const newStatus        = existing.paymentStatus === 'PAID' ? 'REFUND_REQUESTED' : 'CANCELLED';
    const newPaymentStatus = existing.paymentStatus === 'PAID' ? 'REFUNDED'         : existing.paymentStatus;

    const updated = await tx.order.update({
      where: { id },
      data: {
        status:        newStatus,
        paymentStatus: newPaymentStatus,
        statusHistory: {
          create: { status: newStatus, note: reason ?? 'Cancelled by customer' },
        },
      },
      include: { items: true, statusHistory: true, payment: true },
    });

    return updated;
  });

  void sendOrderStatusChange(
    { orderNumber: order.orderNumber },
    { email: user.email, name: user.name },
    order.status,
    reason,
  ).catch((e) => console.error('[email] cancel notice failed', e));

  return sendSuccess(res, order);
});

// ─── Admin: list orders ───────────────────────────────────────────────────────

export const adminGetAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as OrderQueryInput;

  const where: Prisma.OrderWhereInput = {
    ...(q.status        && { status:        q.status }),
    ...(q.paymentMethod && { paymentMethod: q.paymentMethod }),
    ...(q.userId        && { userId:        q.userId }),
    ...((q.dateFrom || q.dateTo) && {
      createdAt: {
        ...(q.dateFrom && { gte: q.dateFrom }),
        ...(q.dateTo   && { lte: q.dateTo }),
      },
    }),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { [q.sortBy]: q.sortOrder },
      skip:    (q.page - 1) * q.limit,
      take:    q.limit,
      include: {
        items: true,
        user:  { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return sendSuccess(res, orders, 200, buildPagination(q.page, q.limit, total));
});

// ─── Admin: update status ─────────────────────────────────────────────────────

export const adminUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status, note } = req.body as UpdateOrderStatusInput;

  const order = await prisma.$transaction(async (tx: any) => {
    const existing = await tx.order.findUnique({ where: { id }, include: { user: true } });
    if (!existing) throw ApiError.notFound('Order');

    return tx.order.update({
      where: { id },
      data: {
        status,
        statusHistory: { create: { status, note: note ?? null } },
        ...(status === 'DELIVERED' && existing.paymentMethod === 'COD' && {
          paymentStatus: 'PAID',
          payment:       { update: { status: 'PAID', paidAt: new Date() } },
        }),
      },
      include: { items: true, statusHistory: true, payment: true, user: true },
    });
  });

  void sendOrderStatusChange(
    { orderNumber: order.orderNumber },
    { email: order.user.email, name: order.user.name },
    status,
    note,
  ).catch((e) => console.error('[email] status change failed', e));

  void createNotification(
    order.userId,
    'ORDER_STATUS',
    `Order ${order.orderNumber} Update`,
    `Your order status has changed to ${status.replace(/_/g, ' ')}.`,
    order.id,
  ).catch(() => {});

  return sendSuccess(res, order);
});
