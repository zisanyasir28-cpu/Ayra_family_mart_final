import { z } from 'zod';
import { AddressType } from '../constants/enums';
import { BD_PHONE_REGEX } from '../constants';

export const addressInputSchema = z.object({
  label:        z.string().min(1).max(100),
  type:         z.nativeEnum(AddressType).default(AddressType.HOME),
  fullName:     z.string().min(2).max(100),
  phone:        z.string().regex(BD_PHONE_REGEX, 'Invalid Bangladeshi phone number'),
  addressLine1: z.string().min(5).max(255),
  addressLine2: z.string().max(255).optional(),
  district:     z.string().min(1).max(100),
  thana:        z.string().min(1).max(100),
  postalCode:   z.string().max(10).optional(),
  isDefault:    z.boolean().optional(),
});

export const updateAddressSchema = addressInputSchema.partial();

export const addressIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type AddressInput       = z.infer<typeof addressInputSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
