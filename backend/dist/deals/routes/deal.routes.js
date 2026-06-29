"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deal_controller_1 = require("../controller/deal.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const activityLogger_1 = require("../../middlewares/activityLogger");
const deal_validator_1 = require("../validators/deal.validator");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// --- ENTERPRISE SALES PIPELINE INTELLIGENCE ---
const dealPipeline_controller_1 = require("../controller/dealPipeline.controller");
// Pipeline CRUD
router.get('/pipeline', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.listPipelines);
router.post('/pipeline', (0, permission_1.requirePermission)('deals:create'), dealPipeline_controller_1.dealPipelineController.createPipeline);
router.get('/pipeline/:pipeId', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getPipeline);
router.put('/pipeline/:pipeId', (0, permission_1.requirePermission)('deals:edit'), dealPipeline_controller_1.dealPipelineController.updatePipeline);
router.delete('/pipeline/:pipeId', (0, permission_1.requirePermission)('deals:delete'), dealPipeline_controller_1.dealPipelineController.deletePipeline);
router.post('/pipeline/:pipeId/duplicate', (0, permission_1.requirePermission)('deals:create'), dealPipeline_controller_1.dealPipelineController.duplicatePipeline);
// Kanban Board
router.get('/kanban', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getKanban);
// Revenue Forecasting
router.get('/forecast', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getForecast);
// Sales Analytics
router.get('/analytics', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getAnalytics);
// Sales KPIs
router.get('/kpis', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getKpis);
// Funnel Analytics
router.get('/funnel', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getFunnel);
// Deal Aging
router.get('/aging', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getAging);
// Pipeline Health
router.get('/pipeline-health', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getPipelineHealth);
// Quotas
router.get('/quotas', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getQuotas);
router.post('/quotas', (0, permission_1.requirePermission)('deals:create'), dealPipeline_controller_1.dealPipelineController.createQuota);
router.put('/quotas/:quotaId', (0, permission_1.requirePermission)('deals:edit'), dealPipeline_controller_1.dealPipelineController.updateQuota);
router.delete('/quotas/:quotaId', (0, permission_1.requirePermission)('deals:delete'), dealPipeline_controller_1.dealPipelineController.deleteQuota);
// Team Performance
router.get('/performance', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getPerformance);
// Saved Pipeline Views
router.get('/pipeline-views', (0, permission_1.requirePermission)('deals:view'), dealPipeline_controller_1.dealPipelineController.getViews);
router.post('/pipeline-views', (0, permission_1.requirePermission)('deals:create'), dealPipeline_controller_1.dealPipelineController.createView);
router.delete('/pipeline-views/:viewId', (0, permission_1.requirePermission)('deals:delete'), dealPipeline_controller_1.dealPipelineController.deleteView);
// Move Stage (drag & drop)
router.patch('/:id/move-stage', (0, permission_1.requirePermission)('deals:edit'), dealPipeline_controller_1.dealPipelineController.moveStage);
// --- EXISTING DEAL CRUD ROUTES ---
router.get('/employees', (0, permission_1.requirePermission)('deals:view'), deal_controller_1.dealController.getEmployees);
router.get('/', (0, permission_1.requirePermission)('deals:view'), (0, validate_1.validateRequest)(deal_validator_1.listDealsSchema), deal_controller_1.dealController.list);
router.get('/:id', (0, permission_1.requirePermission)('deals:view'), (0, validate_1.validateRequest)(deal_validator_1.getDealByIdSchema), (0, activityLogger_1.logActivity)('deals', 'DEAL_VIEWED'), deal_controller_1.dealController.getById);
router.post('/', (0, permission_1.requirePermission)('deals:create'), (0, validate_1.validateRequest)(deal_validator_1.createDealSchema), (0, activityLogger_1.logActivity)('deals', 'DEAL_CREATED'), deal_controller_1.dealController.create);
router.put('/:id', (0, permission_1.requirePermission)('deals:edit'), (0, validate_1.validateRequest)(deal_validator_1.updateDealSchema), (0, activityLogger_1.logActivity)('deals', 'DEAL_UPDATED'), deal_controller_1.dealController.update);
router.delete('/:id', (0, permission_1.requirePermission)('deals:delete'), (0, validate_1.validateRequest)(deal_validator_1.getDealByIdSchema), (0, activityLogger_1.logActivity)('deals', 'DEAL_DELETED'), deal_controller_1.dealController.delete);
router.patch('/status', (0, permission_1.requirePermission)('deals:edit'), (0, validate_1.validateRequest)(deal_validator_1.bulkUpdateStatusSchema), (0, activityLogger_1.logActivity)('deals', 'DEAL_STATUS_CHANGED'), deal_controller_1.dealController.bulkUpdateStatus);
router.patch('/stage', (0, permission_1.requirePermission)('deals:edit'), (0, validate_1.validateRequest)(deal_validator_1.updateStageSchema), (0, activityLogger_1.logActivity)('deals', 'DEAL_STAGE_CHANGED'), deal_controller_1.dealController.updateStage);
router.patch('/owner', (0, permission_1.requirePermission)('deals:assign'), (0, validate_1.validateRequest)(deal_validator_1.bulkUpdateOwnerSchema), (0, activityLogger_1.logActivity)('deals', 'DEAL_OWNER_CHANGED'), deal_controller_1.dealController.bulkUpdateOwner);
// --- DEAL 360° WORKSPACE EXTENSIONS ---
const dealWorkspace_controller_1 = require("../controller/dealWorkspace.controller");
// Profile details
router.get('/:id/profile', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getProfile);
// Sales timeline logs
router.get('/:id/timeline', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getTimeline);
// Notes CRUD
router.get('/:id/notes', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getNotes);
router.post('/:id/notes', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.createNote);
router.put('/:id/notes/:noteId', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.updateNote);
router.delete('/:id/notes/:noteId', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.deleteNote);
// Activities CRUD
router.get('/:id/activities', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getActivities);
router.post('/:id/activities', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.createActivity);
router.put('/:id/activities/:activityId', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.updateActivity);
router.delete('/:id/activities/:activityId', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.deleteActivity);
// Files CRUD
router.get('/:id/files', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getFiles);
router.post('/:id/files', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.createFile);
router.delete('/:id/files/:fileId', (0, permission_1.requirePermission)('deals:edit'), dealWorkspace_controller_1.dealWorkspaceController.deleteFile);
// History, Products, Quotes
router.get('/:id/history', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getHistory);
router.get('/:id/products', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getProducts);
router.get('/:id/quotes', (0, permission_1.requirePermission)('deals:view'), dealWorkspace_controller_1.dealWorkspaceController.getQuotes);
exports.default = router;
