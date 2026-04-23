import express from 'express';
import {
  getPublicKey,
  getSettings,
  sendTestNotification,
  subscribe,
  unsubscribe,
  updateSettings,
} from '../controllers/notifications.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public-key', getPublicKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);
router.post('/test', protect, sendTestNotification);

export default router;
