import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  adminGetAllOrders,
  adminUpdateOrderStatus,
} from '../controllers/order.controller';
import {
  createOrderSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  orderIdParamSchema,
} from '@superstore/shared';

// ─── Customer router (/api/v1/orders) ─────────────────────────────────────────

export const customerOrderRouter = Router();
customerOrderRouter.use(requireAuth);

customerOrderRouter.post('/',    validate(createOrderSchema),               createOrder);
customerOrderRouter.get('/me',   validate(orderQuerySchema, 'query'),       getMyOrders);
customerOrderRouter.get('/me/:id',
  validate(orderIdParamSchema, 'params'),
  getMyOrderById,
);
customerOrderRouter.patch('/me/:id/cancel',
  validate(orderIdParamSchema, 'params'),
  validate(cancelOrderSchema),
  cancelOrder,
);

// ─── Admin router (/api/v1/admin/orders) ──────────────────────────────────────

export const adminOrderRouter = Router();
adminOrderRouter.use(requireAdmin);

adminOrderRouter.get('/',    validate(orderQuerySchema, 'query'), adminGetAllOrders);
adminOrderRouter.patch('/:id/status',
  validate(orderIdParamSchema, 'params'),
  validate(updateOrderStatusSchema),
  adminUpdateOrderStatus,
);
