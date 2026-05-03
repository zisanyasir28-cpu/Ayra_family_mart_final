import { Router } from 'express';
import healthRouter    from './health.route';
import categoryRouter  from './category.route';
import productRouter   from './product.route';
import inventoryRouter from './inventory.route';

const router = Router();

router.use('/health',    healthRouter);
router.use('/categories', categoryRouter);
router.use('/products',  productRouter);
router.use('/inventory', inventoryRouter);

// Remaining routers will be mounted here as they are built:
// router.use('/auth',     authRouter);
// router.use('/cart',     cartRouter);
// router.use('/orders',   orderRouter);
// router.use('/users',    userRouter);
// router.use('/payments', paymentRouter);
// router.use('/search',   searchRouter);

export default router;
