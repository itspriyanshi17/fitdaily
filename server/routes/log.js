import express from 'express';
import { 
  getTodayLog, 
  addWater, 
  addSteps, 
  markWorkoutComplete, 
  addWeight, 
  addProtein, 
  addCalories, 
  addWalk,
  getWalks,
  getHistory 
} from '../controllers/log.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/today', protect, getTodayLog);
router.post('/water', protect, addWater);
router.post('/steps', protect, addSteps);
router.post('/workout', protect, markWorkoutComplete);
router.post('/weight', protect, addWeight);
router.post('/protein', protect, addProtein);
router.post('/calories', protect, addCalories);
router.post('/walk', protect, addWalk);
router.get('/walks', protect, getWalks);
router.get('/history', protect, getHistory);

export default router;
