import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAuth';
import {
  getCustomers,
  getCustomerById,
  banCustomer,
  unbanCustomer,
} from '../controllers/admin.stats.controller';

const router = Router();

router.get('/',            requireAdmin, getCustomers);
router.get('/:id',         requireAdmin, getCustomerById);
router.patch('/:id/ban',   requireAdmin, banCustomer);
router.patch('/:id/unban', requireAdmin, unbanCustomer);

export default router;
