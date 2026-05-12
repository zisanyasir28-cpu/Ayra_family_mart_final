import { Router } from 'express';
import healthRouter    from './health.route';
import categoryRouter  from './category.route';
import productRouter   from './product.route';
import inventoryRouter from './inventory.route';
import addressRouter   from './address.route';
import couponRouter    from './coupon.route';
import { customerOrderRouter, adminOrderRouter } from './order.route';

const router = Router();

router.use('/health',       healthRouter);
router.use('/categories',   categoryRouter);
router.use('/products',     productRouter);
router.use('/inventory',    inventoryRouter);
router.use('/addresses',    addressRouter);
router.use('/coupons',      couponRouter);
router.use('/orders',       customerOrderRouter);
router.use('/admin/orders', adminOrderRouter);

export default router;
