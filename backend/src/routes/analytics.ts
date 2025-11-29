import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as analyticsController from '../controllers/analyticsController';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Analytics endpoints
router.get('/spending-trends', analyticsController.getSpendingTrends);
router.get('/category-breakdown', analyticsController.getCategoryBreakdown);
router.get('/year-over-year', analyticsController.getYearOverYear);
router.get('/upcoming-costs', analyticsController.getUpcomingCosts);
router.get('/insights', analyticsController.getInsights);

export default router;
