import { Router } from 'express';
import { db } from '../../database/db';
import { config } from '../../config';
import { createPlaceholderRouter } from './placeholder';
import authRouter from './auth';
import dashboardRouter from '../../dashboard/routes/dashboard.routes';
import leadRouter from '../../leads/routes/lead.routes';
import taskRouter from '../../tasks/routes/task.routes';
import contactRouter from '../../contacts/routes/contact.routes';
import companyRouter from '../../companies/routes/company.routes';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  const dbConnected = await db.checkConnection();
  res.json({
    success: true,
    statusCode: 200,
    message: 'Health status retrieved successfully',
    data: {
      api: 'healthy',
      database: dbConnected ? 'connected' : 'disconnected',
      version: config.appName + ' v' + config.appVersion,
      environment: config.env,
      serverTime: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(2)}s`
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId || 'unknown'
  });
});

// Custom routes
router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/leads', leadRouter);
router.use('/tasks', taskRouter);
router.use('/contacts', contactRouter);
router.use('/companies', companyRouter);

// Generate placeholder routers for all 20 remaining CRM infrastructure modules
const placeholderModules = [
  'users',
  'roles',
  'permissions',
  'customers',
  'deals',
  'activities',
  'calendar',
  'meetings',
  'products',
  'quotes',
  'invoices',
  'payments',
  'notifications',
  'reports',
  'analytics',
  'settings'
];

placeholderModules.forEach((moduleName) => {
  router.use(`/${moduleName}`, createPlaceholderRouter(moduleName));
});

export default router;
