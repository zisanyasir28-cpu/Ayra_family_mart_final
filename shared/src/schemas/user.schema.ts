import { z } from 'zod';
import { BD_PHONE_REGEX, PAGINATION_DEFAULTS } from '../constants';
import { UserRole, AddressType, SortOrder } from '../constants/enums';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(BD_PHONE_REGEX, 'Invalid Bangladeshi phone number')
    .optional(),
});

export const upsertAddressSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.nativeEnum(AddressType),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(BD_PHONE_REGEX, 'Invalid Bangladeshi phone number'),
  addressLine1: z.string().min(5).max(255),
  addressLine2: z.string().max(255).optional(),
  district: z.string().min(1).max(100),
  thana: z.string().min(1).max(100),
  postalCode: z.string().max(10).optional(),
  isDefault: z.boolean().default(false),
});

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
  search: z.string().max(255).optional(),
  role: z.nativeEnum(UserRole).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpsertAddressInput = z.infer<typeof upsertAddressSchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
