import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { validate } from '../utils/validate';
import { requireAdmin } from '../middleware/requireAuth';
import { uploadMultiple } from '../lib/multer';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdatePrice,
  bulkPricePreview,
  getLowStockProducts,
} from '../controllers/product.controller';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  bulkPriceUpdateSchema,
} from '@superstore/shared';

const router = Router();

// Search rate limiter (as per CLAUDE.md)
const searchLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Search rate limit exceeded' },
  },
});

// ─── Public ───────────────────────────────────────────────────────────────────

// IMPORTANT: static paths BEFORE /:slug to avoid Express treating them as slug params
router.get('/featured', getFeaturedProducts);

router.get('/', searchLimiter, validate(productQuerySchema, 'query'), getProducts);

router.get('/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

// ─── Admin ────────────────────────────────────────────────────────────────────

router.get('/admin/low-stock', requireAdmin, getLowStockProducts);

router.post(
  '/',
  requireAdmin,
  uploadMultiple,
  validate(createProductSchema),
  createProduct,
);

router.patch(
  '/:id',
  requireAdmin,
  uploadMultiple,
  validate(updateProductSchema),
  updateProduct,
);

router.delete('/:id', requireAdmin, deleteProduct);

router.post(
  '/bulk-price/preview',
  requireAdmin,
  validate(bulkPriceUpdateSchema),
  bulkPricePreview,
);

router.post(
  '/bulk-price',
  requireAdmin,
  validate(bulkPriceUpdateSchema),
  bulkUpdatePrice,
);

export default router;
