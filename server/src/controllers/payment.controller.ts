import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { validateIpn } from '../lib/sslcommerz';
import { logger } from '../lib/logger';
import { sendOrderConfirmation } from '../lib/email';

// ─── IPN handler — called server-to-server by SSLCommerz ─────────────────────

/**
 * POST /api/v1/payment/ipn
 *
 * SSLCommerz posts payment results here after a transaction completes.
 * Must always respond 200 quickly — SSLCommerz retries on non-200.
 * Uses `tran_id` (our orderId) to locate the order, then validates with
 * the SSLCommerz validation API before marking the order as paid.
 */
export const handleIpn = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, string>;

  const status  = body['status']  ?? '';
  const valId   = body['val_id']  ?? '';
  const tranId  = body['tran_id'] ?? ''; // our orderId

  logger.info({ status, valId, tranId }, 'payment.ipn_received');

  // Find order + payment by orderId
  const order = await prisma.order.findUnique({
    where: { id: tranId },
    include: {
      payment: true,
      user:    { select: { email: true, name: true } },
      items:   { select: { productName: true, quantity: true, totalPriceInPaisa: true } },
    },
  });

  if (!order) {
    logger.warn({ tranId }, 'payment.ipn_order_not_found');
    return res.status(200).send('OK');
  }

  // Already finalised — idempotent guard
  if (order.paymentStatus === 'PAID' || order.paymentStatus === 'FAILED') {
    return res.status(200).send('OK');
  }

  // ── Failed / cancelled payment ────────────────────────────────────────────
  if (status === 'FAILED' || status === 'CANCELLED') {
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data:  { status: 'FAILED', gatewayResponse: body },
      }),
      prisma.order.update({
        where: { id: order.id },
        data:  { paymentStatus: 'FAILED' },
      }),
    ]);

    logger.info({ orderId: order.id, status }, 'payment.failed_or_cancelled');
    return res.status(200).send('OK');
  }

  // ── Validate with SSLCommerz before marking paid ──────────────────────────
  let validation;
  try {
    validation = await validateIpn(valId);
  } catch (err) {
    logger.error({ err, valId, tranId }, 'payment.ipn_validation_error');
    return res.status(200).send('OK');
  }

  if (!validation.valid) {
    logger.warn({ valId, validationStatus: validation.status }, 'payment.ipn_invalid');
    return res.status(200).send('OK');
  }

  // ── Mark order as paid ────────────────────────────────────────────────────
  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId: order.id },
      data: {
        status:          'PAID',
        transactionId:   validation.transactionId,
        gatewayResponse: body,
        paidAt:          new Date(),
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status:        'CONFIRMED',
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status:  'CONFIRMED',
        note:    'Payment confirmed via SSLCommerz',
      },
    }),
  ]);

  logger.info(
    { orderId: order.id, transactionId: validation.transactionId },
    'payment.confirmed',
  );

  // Fire-and-forget confirmation email
  void sendOrderConfirmation(
    {
      orderNumber:     order.orderNumber,
      totalInPaisa:    order.totalInPaisa,
      subtotalInPaisa: order.subtotalInPaisa,
      shippingInPaisa: order.shippingInPaisa,
      discountInPaisa: order.discountInPaisa,
      paymentMethod:   order.paymentMethod,
      items:           order.items,
    },
    { email: order.user.email, name: order.user.name },
  ).catch((err) => logger.warn({ err }, 'email.order_confirmation_failed'));

  return res.status(200).send('OK');
});

// ─── Browser redirect handlers (user's browser is sent here by SSLCommerz) ───

const clientUrl = () => process.env['CLIENT_URL'] ?? 'http://localhost:5173';

/**
 * POST /api/v1/payment/success
 * SSLCommerz redirects the user's browser here on successful payment.
 * We redirect to the frontend order confirmation page.
 */
export const handleSuccess = asyncHandler(async (req: Request, res: Response) => {
  const body   = req.body as Record<string, string>;
  const tranId = body['tran_id'] ?? '';

  logger.info({ tranId }, 'payment.browser_success');
  return res.redirect(`${clientUrl()}/orders/${tranId}?payment=success`);
});

/**
 * POST /api/v1/payment/fail
 * SSLCommerz redirects here on payment failure.
 */
export const handleFail = asyncHandler(async (req: Request, res: Response) => {
  const body   = req.body as Record<string, string>;
  const tranId = body['tran_id'] ?? '';

  logger.info({ tranId }, 'payment.browser_fail');
  return res.redirect(`${clientUrl()}/orders/${tranId}?payment=failed`);
});

/**
 * POST /api/v1/payment/cancel
 * SSLCommerz redirects here when the user cancels on the gateway page.
 */
export const handleCancel = asyncHandler(async (req: Request, res: Response) => {
  const body   = req.body as Record<string, string>;
  const tranId = body['tran_id'] ?? '';

  logger.info({ tranId }, 'payment.browser_cancel');
  return res.redirect(`${clientUrl()}/orders/${tranId}?payment=cancelled`);
});
