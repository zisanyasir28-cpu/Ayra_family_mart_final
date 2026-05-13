import { Router } from 'express';
import { validate } from '../utils/validate';
import { requireAdmin } from '../middleware/requireAuth';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  endCampaign,
  deleteCampaign,
} from '../controllers/campaign.controller';
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignQuerySchema,
} from '@superstore/shared';

const router = Router();

router.get('/',         requireAdmin, validate(campaignQuerySchema, 'query'), getCampaigns);
router.get('/:id',      requireAdmin, getCampaignById);
router.post('/',        requireAdmin, validate(createCampaignSchema), createCampaign);
router.patch('/:id',    requireAdmin, validate(updateCampaignSchema), updateCampaign);
router.patch('/:id/end', requireAdmin, endCampaign);
router.delete('/:id',   requireAdmin, deleteCampaign);

export default router;
