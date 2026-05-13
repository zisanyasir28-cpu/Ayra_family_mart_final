import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAuth';
import { getDashboardStats } from '../controllers/admin.stats.controller';

const router = Router();

router.get('/dashboard', requireAdmin, getDashboardStats);

export default router;
