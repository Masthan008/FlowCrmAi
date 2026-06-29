import { Router } from 'express';
import { dealController } from '../controller/deal.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';

import {
  createDealSchema,
  updateDealSchema,
  bulkUpdateStatusSchema,
  updateStageSchema,
  bulkUpdateOwnerSchema,
  listDealsSchema,
  getDealByIdSchema,
} from '../validators/deal.validator';

const router = Router();

router.use(requireAuth);

// --- ENTERPRISE SALES PIPELINE INTELLIGENCE ---
import { dealPipelineController } from '../controller/dealPipeline.controller';

// Pipeline CRUD
router.get('/pipeline', requirePermission('deals:view'), dealPipelineController.listPipelines);
router.post('/pipeline', requirePermission('deals:create'), dealPipelineController.createPipeline);
router.get('/pipeline/:pipeId', requirePermission('deals:view'), dealPipelineController.getPipeline);
router.put('/pipeline/:pipeId', requirePermission('deals:edit'), dealPipelineController.updatePipeline);
router.delete('/pipeline/:pipeId', requirePermission('deals:delete'), dealPipelineController.deletePipeline);
router.post('/pipeline/:pipeId/duplicate', requirePermission('deals:create'), dealPipelineController.duplicatePipeline);

// Kanban Board
router.get('/kanban', requirePermission('deals:view'), dealPipelineController.getKanban);

// Revenue Forecasting
router.get('/forecast', requirePermission('deals:view'), dealPipelineController.getForecast);

// Sales Analytics
router.get('/analytics', requirePermission('deals:view'), dealPipelineController.getAnalytics);

// Sales KPIs
router.get('/kpis', requirePermission('deals:view'), dealPipelineController.getKpis);

// Funnel Analytics
router.get('/funnel', requirePermission('deals:view'), dealPipelineController.getFunnel);

// Deal Aging
router.get('/aging', requirePermission('deals:view'), dealPipelineController.getAging);

// Pipeline Health
router.get('/pipeline-health', requirePermission('deals:view'), dealPipelineController.getPipelineHealth);

// Quotas
router.get('/quotas', requirePermission('deals:view'), dealPipelineController.getQuotas);
router.post('/quotas', requirePermission('deals:create'), dealPipelineController.createQuota);
router.put('/quotas/:quotaId', requirePermission('deals:edit'), dealPipelineController.updateQuota);
router.delete('/quotas/:quotaId', requirePermission('deals:delete'), dealPipelineController.deleteQuota);

// Team Performance
router.get('/performance', requirePermission('deals:view'), dealPipelineController.getPerformance);

// Saved Pipeline Views
router.get('/pipeline-views', requirePermission('deals:view'), dealPipelineController.getViews);
router.post('/pipeline-views', requirePermission('deals:create'), dealPipelineController.createView);
router.delete('/pipeline-views/:viewId', requirePermission('deals:delete'), dealPipelineController.deleteView);

// Move Stage (drag & drop)
router.patch('/:id/move-stage', requirePermission('deals:edit'), dealPipelineController.moveStage);

// --- EXISTING DEAL CRUD ROUTES ---

router.get('/employees', requirePermission('deals:view'), dealController.getEmployees);

router.get(
  '/',
  requirePermission('deals:view'),
  validateRequest(listDealsSchema),
  dealController.list
);

router.get(
  '/:id',
  requirePermission('deals:view'),
  validateRequest(getDealByIdSchema),
  logActivity('deals', 'DEAL_VIEWED'),
  dealController.getById
);

router.post(
  '/',
  requirePermission('deals:create'),
  validateRequest(createDealSchema),
  logActivity('deals', 'DEAL_CREATED'),
  dealController.create
);

router.put(
  '/:id',
  requirePermission('deals:edit'),
  validateRequest(updateDealSchema),
  logActivity('deals', 'DEAL_UPDATED'),
  dealController.update
);

router.delete(
  '/:id',
  requirePermission('deals:delete'),
  validateRequest(getDealByIdSchema),
  logActivity('deals', 'DEAL_DELETED'),
  dealController.delete
);

router.patch(
  '/status',
  requirePermission('deals:edit'),
  validateRequest(bulkUpdateStatusSchema),
  logActivity('deals', 'DEAL_STATUS_CHANGED'),
  dealController.bulkUpdateStatus
);

router.patch(
  '/stage',
  requirePermission('deals:edit'),
  validateRequest(updateStageSchema),
  logActivity('deals', 'DEAL_STAGE_CHANGED'),
  dealController.updateStage
);

router.patch(
  '/owner',
  requirePermission('deals:assign'),
  validateRequest(bulkUpdateOwnerSchema),
  logActivity('deals', 'DEAL_OWNER_CHANGED'),
  dealController.bulkUpdateOwner
);

// --- DEAL 360° WORKSPACE EXTENSIONS ---
import { dealWorkspaceController } from '../controller/dealWorkspace.controller';

// Profile details
router.get('/:id/profile', requirePermission('deals:view'), dealWorkspaceController.getProfile);

// Sales timeline logs
router.get('/:id/timeline', requirePermission('deals:view'), dealWorkspaceController.getTimeline);

// Notes CRUD
router.get('/:id/notes', requirePermission('deals:view'), dealWorkspaceController.getNotes);
router.post('/:id/notes', requirePermission('deals:edit'), dealWorkspaceController.createNote);
router.put('/:id/notes/:noteId', requirePermission('deals:edit'), dealWorkspaceController.updateNote);
router.delete('/:id/notes/:noteId', requirePermission('deals:edit'), dealWorkspaceController.deleteNote);

// Activities CRUD
router.get('/:id/activities', requirePermission('deals:view'), dealWorkspaceController.getActivities);
router.post('/:id/activities', requirePermission('deals:edit'), dealWorkspaceController.createActivity);
router.put('/:id/activities/:activityId', requirePermission('deals:edit'), dealWorkspaceController.updateActivity);
router.delete('/:id/activities/:activityId', requirePermission('deals:edit'), dealWorkspaceController.deleteActivity);

// Files CRUD
router.get('/:id/files', requirePermission('deals:view'), dealWorkspaceController.getFiles);
router.post('/:id/files', requirePermission('deals:edit'), dealWorkspaceController.createFile);
router.delete('/:id/files/:fileId', requirePermission('deals:edit'), dealWorkspaceController.deleteFile);

// History, Products, Quotes
router.get('/:id/history', requirePermission('deals:view'), dealWorkspaceController.getHistory);
router.get('/:id/products', requirePermission('deals:view'), dealWorkspaceController.getProducts);
router.get('/:id/quotes', requirePermission('deals:view'), dealWorkspaceController.getQuotes);

export default router;
