import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAdmin } from '../middleware/requireAuth';
import { adjustStock, getStockHistory } from '../controllers/inventory.controller';
import { adjustStockSchema, stockHistoryQuerySchema } from '@superstore/shared';

const router = Router();

router.post(
  '/adjust',
  requireAdmin,
  validate(adjustStockSchema),
  adjustStock,
);

router.get(
  '/history',
  requireAdmin,
  validate(stockHistoryQuerySchema, 'query'),
  getStockHistory,
);

export default router;
