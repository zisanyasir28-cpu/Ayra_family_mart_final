import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/ApiResponse';
import type { AddressInput, UpdateAddressInput } from '@superstore/shared';

// ─── List ─────────────────────────────────────────────────────────────────────

export const listMyAddresses = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const addresses = await prisma.address.findMany({
    where:   { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return sendSuccess(res, addresses);
});

// ─── Create ───────────────────────────────────────────────────────────────────

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const data = req.body as AddressInput;

  const created = await prisma.$transaction(async (tx) => {
    // If this is the user's first address, force-default it.
    const existingCount = await tx.address.count({ where: { userId } });
    const shouldBeDefault = data.isDefault === true || existingCount === 0;

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data:  { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        label:        data.label,
        type:         data.type,
        fullName:     data.fullName,
        phone:        data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        district:     data.district,
        thana:        data.thana,
        postalCode:   data.postalCode ?? null,
        isDefault:    shouldBeDefault,
      },
    });
  });

  return sendCreated(res, created);
});

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { id } = req.params as { id: string };
  const data = req.body as UpdateAddressInput;

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw ApiError.notFound('Address', 'ADDRESS_NOT_FOUND');
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data:  { isDefault: false },
      });
    }
    return tx.address.update({
      where: { id },
      data: {
        ...(data.label        !== undefined && { label:        data.label }),
        ...(data.type         !== undefined && { type:         data.type }),
        ...(data.fullName     !== undefined && { fullName:     data.fullName }),
        ...(data.phone        !== undefined && { phone:        data.phone }),
        ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
        ...(data.district     !== undefined && { district:     data.district }),
        ...(data.thana        !== undefined && { thana:        data.thana }),
        ...(data.postalCode   !== undefined && { postalCode:   data.postalCode }),
        ...(data.isDefault    !== undefined && { isDefault:    data.isDefault }),
      },
    });
  });

  return sendSuccess(res, updated);
});

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { id } = req.params as { id: string };

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw ApiError.notFound('Address', 'ADDRESS_NOT_FOUND');
  }

  await prisma.address.delete({ where: { id } });
  return sendNoContent(res);
});

// ─── Set default ──────────────────────────────────────────────────────────────

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { id } = req.params as { id: string };

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw ApiError.notFound('Address', 'ADDRESS_NOT_FOUND');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data:  { isDefault: false },
    });
    return tx.address.update({ where: { id }, data: { isDefault: true } });
  });

  return sendSuccess(res, updated);
});
