import { Router } from 'express';
import healthRouter from './health.route';

const router = Router();

router.use('/health', healthRouter);

// Feature routers will be mounted here as they are built:
// router.use('/auth', authRouter);
// router.use('/products', productRouter);
// router.use('/categories', categoryRouter);
// router.use('/cart', cartRouter);
// router.use('/orders', orderRouter);
// router.use('/users', userRouter);
// router.use('/admin', adminRouter);
// router.use('/payments', paymentRouter);
// router.use('/search', searchRouter);

export default router;
