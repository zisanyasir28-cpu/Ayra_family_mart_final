import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';
import { validate } from '../utils/validate';
import { reviewLimiter } from '../middleware/rateLimiters';
import { createReviewSchema, reviewQuerySchema } from '@superstore/shared';
import {
  getProductReviews,
  createReview,
  adminApproveReview,
  adminRejectReview,
} from '../controllers/review.controller';

const router = Router();

// Public: get reviews for a product
router.get('/', validate(reviewQuerySchema, 'query'), getProductReviews);

// Customer: submit a review (must have purchased product)
router.post('/', requireAuth, reviewLimiter, validate(createReviewSchema), createReview);

// Admin: moderate reviews
router.patch('/:id/approve', requireAdmin, adminApproveReview);
router.delete('/:id',        requireAdmin, adminRejectReview);

export default router;
