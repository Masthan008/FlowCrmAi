"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_controller_1 = require("../controller/lead.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const activityLogger_1 = require("../../middlewares/activityLogger");
const lead_validator_1 = require("../validators/lead.validator");
const router = (0, express_1.Router)();
// All lead routes require authentication
router.use(auth_1.requireAuth);
// Master data endpoints (must come before /:id routes)
router.get('/sources', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getSources);
router.get('/statuses', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getStatuses);
router.get('/statistics', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getStatistics);
// CRUD routes
router.get('/', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.listLeadsSchema), lead_controller_1.leadController.list);
router.get('/:id', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_VIEWED'), lead_controller_1.leadController.getById);
router.post('/', (0, permission_1.requirePermission)('leads:create'), (0, validate_1.validateRequest)(lead_validator_1.createLeadSchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_CREATED'), lead_controller_1.leadController.create);
router.put('/:id', (0, permission_1.requirePermission)('leads:edit'), (0, validate_1.validateRequest)(lead_validator_1.updateLeadSchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_UPDATED'), lead_controller_1.leadController.update);
router.delete('/:id', (0, permission_1.requirePermission)('leads:delete'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_DELETED'), lead_controller_1.leadController.delete);
// Patch routes for individual field updates
router.patch('/:id/status', (0, permission_1.requirePermission)('leads:edit'), (0, validate_1.validateRequest)(lead_validator_1.updateStatusSchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_STATUS_CHANGED'), lead_controller_1.leadController.updateStatus);
router.patch('/:id/owner', (0, permission_1.requirePermission)('leads:assign'), (0, validate_1.validateRequest)(lead_validator_1.updateOwnerSchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_OWNER_CHANGED'), lead_controller_1.leadController.updateOwner);
router.patch('/:id/priority', (0, permission_1.requirePermission)('leads:edit'), (0, validate_1.validateRequest)(lead_validator_1.updatePrioritySchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_PRIORITY_CHANGED'), lead_controller_1.leadController.updatePriority);
router.patch('/:id/rating', (0, permission_1.requirePermission)('leads:edit'), (0, validate_1.validateRequest)(lead_validator_1.updateRatingSchema), (0, activityLogger_1.logActivity)('leads', 'LEAD_RATING_CHANGED'), lead_controller_1.leadController.updateRating);
exports.default = router;
