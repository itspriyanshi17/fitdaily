import express from 'express';
import { updateGoals, getGoals } from '../controllers/user.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/goals', protect, updateGoals);
router.get('/goals', protect, getGoals);

export default router;
