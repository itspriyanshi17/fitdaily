import express from 'express';
import { registerPlan, getMyPlan, regeneratePlan, resetPlan } from '../controllers/plan.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All plan routes require authentication
router.use(protect);

router.post('/register', registerPlan);
router.get('/my-plan', getMyPlan);
router.put('/regenerate', regeneratePlan);
router.delete('/reset', resetPlan);

export default router;
