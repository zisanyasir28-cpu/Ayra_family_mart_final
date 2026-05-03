import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAdmin } from '../middleware/requireAuth';
import { uploadSingle } from '../lib/multer';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/category.controller';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
} from '@superstore/shared';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.post(
  '/',
  requireAdmin,
  uploadSingle,
  validate(createCategorySchema),
  createCategory,
);

router.patch(
  '/:id',
  requireAdmin,
  uploadSingle,
  validate(updateCategorySchema),
  updateCategory,
);

router.delete('/:id', requireAdmin, deleteCategory);

router.post(
  '/reorder',
  requireAdmin,
  validate(reorderCategoriesSchema),
  reorderCategories,
);

export default router;
