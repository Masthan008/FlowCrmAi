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
import companyIntelligenceRouter from '../../companies/routes/companyIntelligence.routes';
import dealRouter from '../../deals/routes/deal.routes';
import { dealAutomationController } from '../../deals/controller/dealAutomation.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import productRouter from '../../products/routes/product.routes';
import meetingRouter from '../../meetings/routes/meeting.routes';
import quoteRouter from '../../quotes/routes/quote.routes';
import invoiceRouter from '../../invoices/routes/invoice.routes';
import { searchController } from '../../controllers/search.controller';
import webFormRouter from '../../webforms/routes/webform.routes';
import webFormPublicRouter from '../../webforms/routes/webformPublic.routes';
import portalRouter from '../../portal/routes/portal.routes';
import portalAuthRouter from '../../portal/routes/portalAuth.routes';
import chatRouter from '../../chat/routes/chat.routes';
import expenseRouter from '../../expenses/routes/expense.routes';
import assetRouter from '../../assets/routes/asset.routes';
import gdprRouter from '../../gdpr/routes/gdpr.routes';
import surveyRouter from '../../surveys/routes/survey.routes';
import surveyPublicRouter from '../../surveys/routes/surveyPublic.routes';
import commissionRouter from '../../commissions/routes/commission.routes';
import campaignRouter from '../../campaigns/routes/campaign.routes';
import ticketRouter from '../../tickets/routes/ticket.routes';
import knowledgeRouter from '../../knowledge/routes/knowledge.routes';
import contractRouter from '../../contracts/routes/contract.routes';
import orderRouter from '../../orders/routes/order.routes';
import projectRouter from '../../projects/routes/project.routes';
import subscriptionRouter from '../../subscriptions/routes/subscription.routes';
import emailRouter from '../../email/routes/email.routes';
import customerRouter from '../../customers/routes/customer.routes';
import calendarRouter from '../../calendar/routes/calendar.routes';
import paymentRouter from '../../payments/routes/payment.routes';

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

import activitiesRouter from './activities.routes';
import reportsRouter from './reports.routes';
import userRouter from './user.routes';
import notificationsRouter from './notifications.routes';
import settingsRouter from './settings.routes';
import rolesRouter from './roles.routes';
import permissionsRouter from './permissions.routes';
import pipelinesRouter from './pipelines.routes';

// Custom routes
router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/leads', leadRouter);
router.use('/tasks', taskRouter);
router.use('/contacts', contactRouter);
router.use('/companies', companyIntelligenceRouter);
router.use('/companies', companyRouter);
router.use('/deals', dealRouter);
router.use('/activities', activitiesRouter);
router.use('/reports', reportsRouter);
router.use('/analytics', reportsRouter);
router.use('/users', userRouter);
router.use('/notifications', notificationsRouter);
router.use('/settings', settingsRouter);
router.use('/roles', rolesRouter);
router.use('/permissions', permissionsRouter);
router.use('/pipelines', pipelinesRouter);

router.use('/products', productRouter);
router.use('/meetings', meetingRouter);
router.use('/quotes', quoteRouter);
router.use('/invoices', invoiceRouter);
router.use('/webforms', webFormRouter);
router.use('/forms/public', webFormPublicRouter);
router.use('/portal', portalRouter);
router.use('/portal/auth', portalAuthRouter);
router.use('/chat', chatRouter);
router.use('/expenses', expenseRouter);
router.use('/assets', assetRouter);
router.use('/gdpr', gdprRouter);
router.use('/surveys', surveyRouter);
router.use('/surveys/public', surveyPublicRouter);
router.use('/campaigns', campaignRouter);
router.use('/tickets', ticketRouter);
router.use('/knowledge', knowledgeRouter);
router.use('/contracts', contractRouter);
router.use('/orders', orderRouter);
router.use('/projects', projectRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/email', emailRouter);
router.use('/commissions', commissionRouter);
router.use('/customers', customerRouter);
router.use('/calendar', calendarRouter);
router.use('/payments', paymentRouter);

router.get('/global-search', requireAuth, searchController.globalSearch);

router.get('/deal-workflows', requireAuth, requirePermission('deals:workflows:manage'), dealAutomationController.getWorkflows);
router.post('/deal-workflows', requireAuth, requirePermission('deals:workflows:manage'), dealAutomationController.createWorkflow);

export default router;
