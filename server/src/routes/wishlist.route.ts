import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller';

const router = Router();

router.use(requireAuth);

router.get('/',       getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
