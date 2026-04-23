import express from 'express';
import { getTodayWorkout, getWorkoutByDay } from '../controllers/workout.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/today', protect, getTodayWorkout);
router.get('/:day', protect, getWorkoutByDay);

export default router;
