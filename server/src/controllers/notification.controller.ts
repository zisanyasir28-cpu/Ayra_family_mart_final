import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendNoContent, buildPagination } from '../utils/ApiResponse';
import type { NotificationQueryInput } from '@superstore/shared';

// ─── Shared helper (called from order.controller) ─────────────────────────────

export async function createNotification(
  userId:   string,
  type:     string,
  title:    string,
  message:  string,
  orderId?: string,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, orderId: orderId ?? null },
    });
  } catch {
    // Non-fatal — never crash a controller because a notification failed
  }
}

// ─── List ─────────────────────────────────────────────────────────────────────

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const q      = req.query as unknown as NotificationQueryInput;

  const where = {
    userId,
    ...(q.unreadOnly && { isRead: false }),
  };

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      skip:    (q.page - 1) * q.limit,
      take:    q.limit,
    }),
  ]);

  return sendSuccess(res, notifications, 200, buildPagination(q.page, q.limit, total));
});

// ─── Unread Count ─────────────────────────────────────────────────────────────

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const count  = await prisma.notification.count({ where: { userId, isRead: false } });
  return sendSuccess(res, { count });
});

// ─── Mark Single as Read ──────────────────────────────────────────────────────

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { id } = req.params as { id: string };

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw ApiError.notFound('Notification');
  }

  const updated = await prisma.notification.update({
    where: { id },
    data:  { isRead: true },
  });

  return sendSuccess(res, updated);
});

// ─── Mark All as Read ─────────────────────────────────────────────────────────

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });

  return sendNoContent(res);
});
