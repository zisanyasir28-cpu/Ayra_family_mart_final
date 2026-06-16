import { Router } from 'express';
import { setCache } from '../middleware/cache';
import { getBrands } from '../controllers/brand.controller';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', setCache(600), getBrands);

export default router;
