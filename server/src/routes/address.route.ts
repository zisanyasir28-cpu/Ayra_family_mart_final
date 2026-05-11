import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAuth } from '../middleware/requireAuth';
import {
  listMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller';
import {
  addressInputSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from '@superstore/shared';

const router = Router();

router.use(requireAuth);

router.get('/', listMyAddresses);
router.post('/', validate(addressInputSchema), createAddress);

router.patch(
  '/:id',
  validate(addressIdParamSchema, 'params'),
  validate(updateAddressSchema),
  updateAddress,
);

router.delete(
  '/:id',
  validate(addressIdParamSchema, 'params'),
  deleteAddress,
);

router.patch(
  '/:id/default',
  validate(addressIdParamSchema, 'params'),
  setDefaultAddress,
);

export default router;
