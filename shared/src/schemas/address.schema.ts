import { z } from 'zod';
import { AddressType } from '../constants/enums';
import { BD_PHONE_REGEX } from '../constants';

// ─── Base shape (also used inline by order.schema.ts) ────────────────────────

export const addressInputSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100),
  type: z.nativeEnum(AddressType),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().regex(BD_PHONE_REGEX, 'Invalid Bangladeshi phone number'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters').max(255),
  addressLine2: z.string().max(255).optional(),
  district: z.string().min(1, 'District is required').max(100),
  thana: z.string().min(1, 'Thana is required').max(100),
  postalCode: z.string().max(10).optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressInputSchema.partial();

export const addressIdParamSchema = z.object({
  id: z.string().uuid('Invalid address id'),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
