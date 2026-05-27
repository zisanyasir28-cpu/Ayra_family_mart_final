import { api } from '@/lib/api';
import type { ApiUserProfile } from '@/types/api';
import type { ApiSuccessResponse } from '@superstore/shared';
import { useAuthStore } from '@/store/authStore';

// ─── Get Profile ──────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<ApiUserProfile> {
  try {
    const r = await api.get<ApiSuccessResponse<ApiUserProfile>>('/users/profile');
    return r.data.data;
  } catch {
    // Fall back to whatever is in the auth store
    const u = useAuthStore.getState().user;
    if (!u) throw new Error('Not authenticated');
    return {
      id:              u.id,
      email:           u.email,
      name:            u.name,
      phone:           u.phone ?? null,
      role:            u.role,
      avatarUrl:       u.avatarUrl ?? null,
      isEmailVerified: u.isEmailVerified,
      createdAt:       u.createdAt,
      updatedAt:       u.createdAt,
    };
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateMyProfile(data: {
  name?: string;
  phone?: string;
}): Promise<ApiUserProfile> {
  const r = await api.patch<ApiSuccessResponse<ApiUserProfile>>('/users/profile', data);
  return r.data.data;
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changeMyPassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<void> {
  await api.post('/users/change-password', data);
}

// ─── Delete Account ───────────────────────────────────────────────────────────

export async function deleteMyAccount(): Promise<void> {
  await api.delete('/users/account');
}
