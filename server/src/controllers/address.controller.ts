import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/ApiResponse';
import type { AddressInput, UpdateAddressInput } from '@superstore/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userId(req: Request): string {
  if (!req.user?.sub) throw ApiError.unauthorized();
  return req.user.sub;
}

async function loadOwnedAddress(id: string, ownerId: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== ownerId) {
    // Don't leak existence to a different user.
    throw new ApiError(404, 'ADDRESS_NOT_FOUND', 'Address not found');
  }
  return address;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/addresses
 * Lists the authenticated user's addresses, default first.
 */
export const listMyAddresses = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = userId(req);
    const addresses = await prisma.address.findMany({
      where: { userId: ownerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return sendSuccess(res, addresses);
  },
);

/**
 * POST /api/v1/addresses
 * Creates a new address. If `isDefault` is true, demotes the previous default.
 */
export const createAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = userId(req);
    const input = req.body as AddressInput;

    const address = await prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { userId: ownerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      // First address is always the default.
      const existingCount = await tx.address.count({ where: { userId: ownerId } });
      const isDefault = input.isDefault === true || existingCount === 0;

      return tx.address.create({
        data: {
          userId: ownerId,
          label: input.label,
          type: input.type,
          fullName: input.fullName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          ...(input.addressLine2 !== undefined && { addressLine2: input.addressLine2 }),
          district: input.district,
          thana: input.thana,
          ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
          isDefault,
        },
      });
    });

    return sendCreated(res, address);
  },
);

/**
 * PATCH /api/v1/addresses/:id
 * Partial update. Sending `isDefault: true` demotes the previous default.
 */
export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = userId(req);
    const { id } = req.params as { id: string };
    const patch = req.body as UpdateAddressInput;

    await loadOwnedAddress(id, ownerId);

    const updated = await prisma.$transaction(async (tx) => {
      if (patch.isDefault === true) {
        await tx.address.updateMany({
          where: { userId: ownerId, isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id },
        data: patch,
      });
    });

    return sendSuccess(res, updated);
  },
);

/**
 * DELETE /api/v1/addresses/:id
 * Hard delete. If this was the default, the next-most-recent address is
 * promoted to default automatically (best-effort UX).
 */
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = userId(req);
    const { id } = req.params as { id: string };

    const target = await loadOwnedAddress(id, ownerId);

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });
      if (target.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId: ownerId },
          orderBy: { createdAt: 'desc' },
        });
        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return sendNoContent(res);
  },
);

/**
 * PATCH /api/v1/addresses/:id/default
 * Convenience endpoint to flip the default to a specific address.
 */
export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = userId(req);
    const { id } = req.params as { id: string };

    await loadOwnedAddress(id, ownerId);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: ownerId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.address.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    return sendSuccess(res, updated);
  },
);
