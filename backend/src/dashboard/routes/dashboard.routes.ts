import { Router } from 'express';
import { dashboardController } from '../controller/dashboard.controller';
import { requireAuth } from '../../middlewares/auth';
import { validateTimeframe } from '../validators/dashboard.validator';

const router = Router();

// Apply requireAuth validation to all routes
router.get('/overview', requireAuth, dashboardController.getOverview);
router.get('/charts', requireAuth, dashboardController.getCharts);
router.get('/activities', requireAuth, dashboardController.getActivities);
router.get('/tasks', requireAuth, dashboardController.getTasks);
router.get('/deals', requireAuth, dashboardController.getDeals);

// Advanced BI endpoints
router.get('/business-overview', requireAuth, validateTimeframe, dashboardController.getBusinessOverview);
router.get('/pipeline', requireAuth, validateTimeframe, dashboardController.getPipeline);
router.get('/revenue', requireAuth, dashboardController.getRevenue);
router.get('/team', requireAuth, dashboardController.getTeam);
router.get('/goals', requireAuth, dashboardController.getGoals);
router.get('/health', requireAuth, dashboardController.getHealth);
router.get('/calendar-preview', requireAuth, dashboardController.getCalendarPreview);

export default router;
