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
router.get('/statistics', (0, permission_1.requirePermission)('deals:view'), deal_controller_1.dealController.getStatistics);
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
