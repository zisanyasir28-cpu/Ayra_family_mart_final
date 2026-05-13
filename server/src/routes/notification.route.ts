import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../utils/validate';
import { notificationQuerySchema } from '@superstore/shared';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';

const router = Router();

router.use(requireAuth);

router.get('/',              validate(notificationQuerySchema, 'query'), getNotifications);
router.get('/unread-count',  getUnreadCount);
router.patch('/read-all',    markAllAsRead);
router.patch('/:id/read',    markAsRead);

export default router;
