import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAuth';
import { adminMetrics } from '../controllers/admin.metrics.controller';

const router = Router();

router.use(requireAdmin);

router.get('/', adminMetrics);

export default router;
