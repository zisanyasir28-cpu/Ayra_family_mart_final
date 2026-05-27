import { api } from '@/lib/api';
import type { ApiNotification, PaginatedData } from '@/types/api';
import type { ApiSuccessResponse } from '@superstore/shared';

export interface NotificationsParams {
  page?:       number;
  limit?:      number;
  unreadOnly?: boolean;
}

type NotifListResponse   = { success: true } & PaginatedData<ApiNotification>;
type UnreadCountResponse = ApiSuccessResponse<{ count: number }>;

// ─── Fetch Notifications ──────────────────────────────────────────────────────

export async function fetchNotifications(
  params: NotificationsParams = {},
): Promise<NotifListResponse> {
  const r = await api.get<NotifListResponse>('/notifications', { params });
  return r.data;
}

// ─── Unread Count ─────────────────────────────────────────────────────────────

export async function fetchUnreadCount(): Promise<number> {
  const r = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return r.data.data.count;
}

// ─── Mark Single as Read ──────────────────────────────────────────────────────

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await api.patch(`/notifications/${id}/read`);
  } catch {
    // Fire-and-forget — UI handles optimistic update in store
  }
}

// ─── Mark All as Read ─────────────────────────────────────────────────────────

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await api.patch('/notifications/read-all');
  } catch {
    // Fire-and-forget — UI handles optimistic update in store
  }
}
