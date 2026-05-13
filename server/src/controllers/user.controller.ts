import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendNoContent } from '../utils/ApiResponse';
import type { UpdateProfileInput, ChangePasswordInput } from '@superstore/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeUser(user: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id:              user.id,
    email:           user.email,
    name:            user.name,
    phone:           user.phone,
    role:            user.role,
    avatarUrl:       user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    createdAt:       user.createdAt,
    updatedAt:       user.updatedAt,
  };
}

// ─── Get Profile ──────────────────────────────────────────────────────────────

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, phone: true, role: true,
      avatarUrl: true, isEmailVerified: true, createdAt: true, updatedAt: true,
    },
  });

  if (!user) throw ApiError.notFound('User');

  return sendSuccess(res, user);
});

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { name, phone } = req.body as UpdateProfileInput;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name  !== undefined && { name }),
      ...(phone !== undefined && { phone }),
    },
    select: {
      id: true, email: true, name: true, phone: true, role: true,
      avatarUrl: true, isEmailVerified: true, createdAt: true, updatedAt: true,
    },
  });

  return sendSuccess(res, updated);
});

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data:  { passwordHash: newHash },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  // Clear refresh cookie so the client re-authenticates
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
  });

  return sendSuccess(res, { message: 'Password changed. Please log in again.' });
});

// ─── Delete Account ───────────────────────────────────────────────────────────

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        isActive:  false,
        email:     `deleted-${userId}@deleted.invalid`,
        name:      'Deleted User',
        phone:     null,
        avatarUrl: null,
      },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
  });

  return sendNoContent(res);
});
