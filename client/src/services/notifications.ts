import { api } from '@/lib/api';
import { demoNotifications } from '@/lib/demoData';
import type { ApiNotification, PaginatedData } from '@/types/api';
import type { ApiSuccessResponse } from '@superstore/shared';

export interface NotificationsParams {
  page?:       number;
  limit?:      number;
  unreadOnly?: boolean;
}

type NotifListResponse  = { success: true } & PaginatedData<ApiNotification>;
type UnreadCountResponse = ApiSuccessResponse<{ count: number }>;

// ─── Fetch Notifications ──────────────────────────────────────────────────────

export async function fetchNotifications(
  params: NotificationsParams = {},
): Promise<NotifListResponse> {
  try {
    const r = await api.get<NotifListResponse>('/notifications', { params });
    return r.data;
  } catch {
    const items  = params.unreadOnly
      ? demoNotifications.filter((n) => !n.isRead)
      : demoNotifications;
    const limit  = params.limit ?? 20;
    return {
      success: true,
      data: items,
      meta: {
        pagination: {
          page: 1, limit, total: items.length,
          totalPages: 1, hasNextPage: false, hasPrevPage: false,
        },
      },
    };
  }
}

// ─── Unread Count ─────────────────────────────────────────────────────────────

export async function fetchUnreadCount(): Promise<number> {
  try {
    const r = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return r.data.data.count;
  } catch {
    return demoNotifications.filter((n) => !n.isRead).length;
  }
}

// ─── Mark Single as Read ──────────────────────────────────────────────────────

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await api.patch(`/notifications/${id}/read`);
  } catch {
    // In demo mode: silently ignore — UI handles optimistic update in store
  }
}

// ─── Mark All as Read ─────────────────────────────────────────────────────────

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await api.patch('/notifications/read-all');
  } catch {
    // Demo mode: silently ignore
  }
}
