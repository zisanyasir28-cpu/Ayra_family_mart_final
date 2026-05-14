import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAdmin } from '../middleware/requireAuth';
import { setCache } from '../middleware/cache';
import { searchLimiter } from '../middleware/rateLimiters';
import { uploadMultiple } from '../lib/multer';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  autocomplete,
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

// ─── Public ───────────────────────────────────────────────────────────────────

// IMPORTANT: static paths BEFORE /:slug to avoid Express treating them as slug params
router.get('/featured',      setCache(60),  getFeaturedProducts);
router.get('/autocomplete',  searchLimiter, autocomplete);

router.get('/', setCache(60), searchLimiter, validate(productQuerySchema, 'query'), getProducts);

router.get('/:slug',       setCache(300), getProductBySlug);
router.get('/:id/related', setCache(300), getRelatedProducts);

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
