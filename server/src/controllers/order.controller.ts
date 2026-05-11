import type { Request, Response } from 'express';
import {
  Prisma,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated, buildPagination } from '../utils/ApiResponse';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { validateCouponForUser } from '../services/coupon.service';
import { sendOrderConfirmation, sendOrderStatusChange } from '../lib/email';
import { initiatePayment } from '../lib/sslcommerz';
import type {
  CreateOrderInput,
  OrderQueryInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
  AddressInput,
} from '@superstore/shared';

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD_PAISA = 99_900; // BDT 999.00
const STANDARD_SHIPPING_PAISA = 6_000;        // BDT 60.00
const COD_SURCHARGE_PAISA = 2_000;            // BDT 20.00 — matches CheckoutPage UX

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userId(req: Request): string {
  if (!req.user?.sub) throw ApiError.unauthorized();
  return req.user.sub;
}

function isAdmin(req: Request): boolean {
  return req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
}

interface AddressSnapshot {
  addressId: string | null;
  snapFullName: string;
  snapPhone: string;
  snapAddressLine1: string;
  snapAddressLine2: string | null;
  snapDistrict: string;
  snapThana: string;
  snapPostalCode: string | null;
}

async function resolveShippingAddress(
  input: CreateOrderInput,
  ownerId: string,
): Promise<AddressSnapshot> {
  if (input.shippingAddressId) {
    const addr = await prisma.address.findUnique({
      where: { id: input.shippingAddressId },
    });
    if (!addr || addr.userId !== ownerId) {
      throw new ApiError(404, 'ADDRESS_NOT_FOUND', 'Shipping address not found');
    }
    return {
      addressId: addr.id,
      snapFullName: addr.fullName,
      snapPhone: addr.phone,
      snapAddressLine1: addr.addressLine1,
      snapAddressLine2: addr.addressLine2,
      snapDistrict: addr.district,
      snapThana: addr.thana,
      snapPostalCode: addr.postalCode,
    };
  }

  const inline = input.shippingAddress as AddressInput;
  return {
    addressId: null,
    snapFullName: inline.fullName,
    snapPhone: inline.phone,
    snapAddressLine1: inline.addressLine1,
    snapAddressLine2: inline.addressLine2 ?? null,
    snapDistrict: inline.district,
    snapThana: inline.thana,
    snapPostalCode: inline.postalCode ?? null,
  };
}

function calcShipping(subtotalAfterDiscount: number, paymentMethod: PaymentMethod): number {
  let fee = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD_PAISA ? 0 : STANDARD_SHIPPING_PAISA;
  if (paymentMethod === PaymentMethod.COD) fee += COD_SURCHARGE_PAISA;
  return fee;
}

// ─── createOrder ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/orders
 *
 * Authoritative order placement. Stock + price + coupon math all happen
 * server-side inside a single $transaction so we can't oversell, double-spend
 * a coupon, or accept a tampered total.
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = userId(req);
  const input = req.body as CreateOrderInput;

  // Resolve shipping snapshot (outside the tx — read-only).
  const ship = await resolveShippingAddress(input, ownerId);

  // Load the user (we need email/name for confirmation email + payment init).
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { id: true, email: true, name: true, phone: true },
  });
  if (!user) throw ApiError.unauthorized('User not found');

  // Single transactional write for stock, coupon, order, items, payment.
  // We also retry up to 3x on order-number collision (extremely unlikely).
  const MAX_RETRIES = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Re-fetch products from DB — NEVER trust frontend prices/stock.
        const productIds = input.items.map((i) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            sku: true,
            priceInPaisa: true,
            stockQuantity: true,
            status: true,
          },
        });

        // 2. Validate every item: existence, status, stock.
        const productMap = new Map(products.map((p) => [p.id, p]));
        const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];
        let subtotalInPaisa = 0;

        for (const item of input.items) {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new ApiError(
              404,
              'PRODUCT_NOT_FOUND',
              `Product ${item.productId} no longer exists.`,
              { productId: item.productId },
            );
          }
          if (product.status !== ProductStatus.ACTIVE) {
            throw new ApiError(
              400,
              'PRODUCT_INACTIVE',
              `${product.name} is no longer available.`,
              { productId: product.id },
            );
          }
          if (product.stockQuantity < item.quantity) {
            throw new ApiError(
              409,
              'INSUFFICIENT_STOCK',
              `Only ${product.stockQuantity} of "${product.name}" left in stock.`,
              {
                productId: product.id,
                productName: product.name,
                available: product.stockQuantity,
                requested: item.quantity,
              },
            );
          }

          const unitPriceInPaisa = product.priceInPaisa;
          const totalPriceInPaisa = unitPriceInPaisa * item.quantity;
          subtotalInPaisa += totalPriceInPaisa;

          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity: item.quantity,
            unitPriceInPaisa,
            totalPriceInPaisa,
          });
        }

        // 3. Coupon validation (single source of truth in coupon.service).
        let couponInfo: { id: string; code: string; discountInPaisa: number } | null = null;
        if (input.couponCode) {
          const { coupon, discountInPaisa } = await validateCouponForUser(
            tx,
            input.couponCode,
            ownerId,
            subtotalInPaisa,
          );
          couponInfo = {
            id: coupon.id,
            code: coupon.code,
            discountInPaisa,
          };
        }

        const discountInPaisa = couponInfo?.discountInPaisa ?? 0;
        const shippingInPaisa = calcShipping(
          subtotalInPaisa - discountInPaisa,
          input.paymentMethod,
        );
        const totalInPaisa = subtotalInPaisa - discountInPaisa + shippingInPaisa;

        // 4. Generate order number (caller's loop retries on @unique collision).
        const orderNumber = generateOrderNumber();

        // 5. Create order + nested items + status history + payment.
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: ownerId,
            ...(ship.addressId && { addressId: ship.addressId }),
            status: OrderStatus.PENDING,
            paymentStatus:
              input.paymentMethod === PaymentMethod.COD
                ? PaymentStatus.UNPAID
                : PaymentStatus.PENDING,
            paymentMethod: input.paymentMethod,
            subtotalInPaisa,
            discountInPaisa,
            shippingInPaisa,
            totalInPaisa,
            ...(couponInfo && { couponCode: couponInfo.code }),
            ...(input.notes && { notes: input.notes }),
            snapFullName: ship.snapFullName,
            snapPhone: ship.snapPhone,
            snapAddressLine1: ship.snapAddressLine1,
            ...(ship.snapAddressLine2 !== null && { snapAddressLine2: ship.snapAddressLine2 }),
            snapDistrict: ship.snapDistrict,
            snapThana: ship.snapThana,
            ...(ship.snapPostalCode !== null && { snapPostalCode: ship.snapPostalCode }),
            items: { createMany: { data: orderItemsData } },
            statusHistory: {
              create: { status: OrderStatus.PENDING, note: 'Order placed' },
            },
            payment: {
              create: {
                method: input.paymentMethod,
                status: PaymentStatus.PENDING,
                amountInPaisa: totalInPaisa,
              },
            },
          },
          include: {
            items: true,
            statusHistory: true,
            payment: true,
          },
        });

        // 6. Decrement stock atomically (one update per item, all in this tx).
        for (const item of input.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }

        // 7. Coupon bookkeeping.
        if (couponInfo) {
          await tx.coupon.update({
            where: { id: couponInfo.id },
            data: { usageCount: { increment: 1 } },
          });
          await tx.couponUsage.create({
            data: {
              couponId: couponInfo.id,
              userId: ownerId,
              orderId: order.id,
            },
          });
        }

        return order;
      });

      // Branch on payment method AFTER the tx commits.
      if (input.paymentMethod === PaymentMethod.COD) {
        // Fire-and-forget — don't fail the order if SMTP is unreachable.
        sendOrderConfirmation(
          {
            orderNumber: result.orderNumber,
            totalInPaisa: result.totalInPaisa,
            paymentMethod: result.paymentMethod,
            status: result.status,
            items: result.items.map((i) => ({
              productName: i.productName,
              quantity: i.quantity,
              totalPriceInPaisa: i.totalPriceInPaisa,
            })),
          },
          { email: user.email, name: user.name },
        ).catch((err) => {
          console.error('[email] failed to send order confirmation:', err);
        });

        return sendCreated(res, { order: result });
      }

      // SSLCOMMERZ
      const { gatewayUrl, sessionKey } = await initiatePayment({
        orderId: result.id,
        orderNumber: result.orderNumber,
        amountInPaisa: result.totalInPaisa,
        customer: { name: user.name, email: user.email, phone: user.phone },
      });

      // Persist the gateway session reference.
      await prisma.payment.update({
        where: { orderId: result.id },
        data: { gatewayRef: sessionKey },
      });

      return sendCreated(res, { order: result, gatewayUrl });
    } catch (err) {
      // Order-number collision → retry. Anything else bubbles.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        Array.isArray((err.meta as { target?: string[] } | undefined)?.target) &&
        (err.meta as { target: string[] }).target.includes('orderNumber')
      ) {
        lastError = err;
        if (attempt === MAX_RETRIES) {
          console.error(
            '[orders] order number collision after 3 retries:',
            lastError,
          );
          throw ApiError.internal(
            'Could not generate a unique order number. Please retry.',
          );
        }
        continue;
      }
      throw err;
    }
  }

  // Unreachable — every iteration either returns or throws — but the
  // type system needs an explicit terminator.
  throw ApiError.internal('Order creation reached an unexpected state.');
});

// ─── getMyOrders ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orders/me
 * Paginated list of the authenticated user's orders.
 */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = userId(req);
  const query = req.query as unknown as OrderQueryInput;

  const where: Prisma.OrderWhereInput = { userId: ownerId };
  if (query.status) where.status = query.status;
  if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        items: {
          include: {
            product: {
              select: {
                slug: true,
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    }),
  ]);

  return sendSuccess(
    res,
    orders,
    200,
    buildPagination(query.page, query.limit, total),
  );
});

// ─── getMyOrderById ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/orders/me/:id
 * Single order detail. Returns 404 (not 403) if it belongs to someone else,
 * to avoid leaking ownership information.
 */
export const getMyOrderById = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = userId(req);
  const { id } = req.params as { id: string };

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payment: true,
    },
  });

  if (!order || order.userId !== ownerId) {
    throw ApiError.notFound('Order');
  }

  return sendSuccess(res, order);
});

// ─── cancelOrder ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/orders/me/:id/cancel
 * Customer-initiated cancellation. Only PENDING / CONFIRMED orders can be
 * cancelled. Restores stock + decrements coupon usage atomically.
 */
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = userId(req);
  const { id } = req.params as { id: string };
  const { reason } = req.body as CancelOrderInput;

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true, couponUsage: true },
    });
    if (!order || order.userId !== ownerId) {
      throw ApiError.notFound('Order');
    }
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new ApiError(
        400,
        'ORDER_NOT_CANCELLABLE',
        `Orders in status ${order.status} cannot be cancelled.`,
      );
    }

    // Restore stock.
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }

    // Refund coupon usage.
    if (order.couponUsage) {
      await tx.couponUsage.delete({ where: { id: order.couponUsage.id } });
      await tx.coupon.update({
        where: { id: order.couponUsage.couponId },
        data: { usageCount: { decrement: 1 } },
      });
    }

    const wasPaid = order.paymentStatus === PaymentStatus.PAID;
    const newStatus = wasPaid
      ? OrderStatus.REFUND_REQUESTED
      : OrderStatus.CANCELLED;
    const note = reason ?? (wasPaid ? 'Cancelled — refund pending' : 'Customer cancelled');

    const updated = await tx.order.update({
      where: { id },
      data: {
        status: newStatus,
        ...(wasPaid && { paymentStatus: PaymentStatus.REFUNDED }),
        statusHistory: {
          create: { status: newStatus, note },
        },
      },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    });

    return updated;
  });

  // Notify outside the transaction.
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { email: true, name: true },
  });
  if (user) {
    sendOrderStatusChange(
      {
        orderNumber: updated.orderNumber,
        totalInPaisa: updated.totalInPaisa,
        paymentMethod: updated.paymentMethod,
        status: updated.status,
        items: updated.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          totalPriceInPaisa: i.totalPriceInPaisa,
        })),
      },
      user,
      updated.status,
      reason,
    ).catch((err) => console.error('[email] failed:', err));
  }

  return sendSuccess(res, updated);
});

// ─── adminGetAllOrders ────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/orders  (admin)
 */
export const adminGetAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    if (!isAdmin(req)) throw ApiError.forbidden();
    const query = req.query as unknown as OrderQueryInput;

    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
    if (query.userId) where.userId = query.userId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = query.dateFrom;
      if (query.dateTo) where.createdAt.lte = query.dateTo;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
        },
      }),
    ]);

    return sendSuccess(
      res,
      orders,
      200,
      buildPagination(query.page, query.limit, total),
    );
  },
);

// ─── adminUpdateOrderStatus ───────────────────────────────────────────────────

/**
 * PATCH /api/v1/admin/orders/:id/status  (admin)
 * Updates order status + appends to history. Sends a status-change email.
 */
export const adminUpdateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!isAdmin(req)) throw ApiError.forbidden();
    const { id } = req.params as { id: string };
    const { status, note } = req.body as UpdateOrderStatusInput;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id } });
      if (!existing) throw ApiError.notFound('Order');

      return tx.order.update({
        where: { id },
        data: {
          status,
          ...(status === OrderStatus.DELIVERED && {
            paymentStatus:
              existing.paymentMethod === PaymentMethod.COD
                ? PaymentStatus.PAID
                : existing.paymentStatus,
          }),
          statusHistory: {
            create: { status, ...(note && { note }) },
          },
        },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          user: { select: { email: true, name: true } },
        },
      });
    });

    // Notification email — fire-and-forget.
    sendOrderStatusChange(
      {
        orderNumber: updated.orderNumber,
        totalInPaisa: updated.totalInPaisa,
        paymentMethod: updated.paymentMethod,
        status: updated.status,
        items: updated.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          totalPriceInPaisa: i.totalPriceInPaisa,
        })),
      },
      { email: updated.user.email, name: updated.user.name },
      status,
      note,
    ).catch((err) => console.error('[email] failed:', err));

    return sendSuccess(res, updated);
  },
);
