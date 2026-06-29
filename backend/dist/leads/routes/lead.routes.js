"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_controller_1 = require("../controller/lead.controller");
const leadNote_controller_1 = require("../controller/leadNote.controller");
const leadActivity_controller_1 = require("../controller/leadActivity.controller");
const leadFile_controller_1 = require("../controller/leadFile.controller");
const leadTimeline_controller_1 = require("../controller/leadTimeline.controller");
const leadHistory_controller_1 = require("../controller/leadHistory.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const activityLogger_1 = require("../../middlewares/activityLogger");
const upload_1 = require("../../middlewares/upload");
const lead_validator_1 = require("../validators/lead.validator");
const leadNote_validator_1 = require("../validators/leadNote.validator");
const leadActivity_validator_1 = require("../validators/leadActivity.validator");
const router = (0, express_1.Router)();
// All lead routes require authentication
router.use(auth_1.requireAuth);
// Master data endpoints (must come before /:id routes)
router.get('/sources', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getSources);
router.get('/statuses', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getStatuses);
router.get('/statistics', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getStatistics);
router.get('/employees', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getEmployees);
// Advanced workspace routes
router.get('/search', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.search);
router.get('/filter', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.filter);
router.get('/views', (0, permission_1.requirePermission)('leads:manage-views'), lead_controller_1.leadController.getViews);
router.post('/save-view', (0, permission_1.requirePermission)('leads:manage-views'), lead_controller_1.leadController.saveView);
router.delete('/views/:id', (0, permission_1.requirePermission)('leads:manage-views'), lead_controller_1.leadController.deleteView);
router.post('/import', (0, permission_1.requirePermission)('leads:import'), lead_controller_1.leadController.importLeads);
router.get('/export', (0, permission_1.requirePermission)('leads:export'), lead_controller_1.leadController.exportLeads);
router.patch('/bulk-update', (0, permission_1.requirePermission)('leads:bulk-edit'), lead_controller_1.leadController.bulkUpdate);
router.patch('/archive', (0, permission_1.requirePermission)('leads:archive'), lead_controller_1.leadController.archive);
router.patch('/restore', (0, permission_1.requirePermission)('leads:restore'), lead_controller_1.leadController.restore);
router.post('/merge', (0, permission_1.requirePermission)('leads:merge'), lead_controller_1.leadController.merge);
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
// Lead Automation & Intelligence Routes
router.post('/:id/assign', (0, permission_1.requirePermission)('leads:assign'), lead_controller_1.leadController.assign);
router.post('/:id/convert', (0, permission_1.requirePermission)('leads:convert'), lead_controller_1.leadController.convert);
router.post('/:id/follow-up', (0, permission_1.requirePermission)('leads:edit'), lead_controller_1.leadController.createFollowup);
router.get('/:id/follow-ups', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.getFollowups);
router.patch('/:id/workflow', (0, permission_1.requirePermission)('leads:workflow-manage'), lead_controller_1.leadController.workflow);
router.get('/:id/score', (0, permission_1.requirePermission)('leads:score-view'), lead_controller_1.leadController.score);
router.get('/:id/health', (0, permission_1.requirePermission)('leads:score-view'), lead_controller_1.leadController.health);
router.get('/:id/sla', (0, permission_1.requirePermission)('leads:view'), lead_controller_1.leadController.sla);
router.post('/:id/approval', (0, permission_1.requirePermission)('leads:approve'), lead_controller_1.leadController.approval);
router.patch('/:id/reassign', (0, permission_1.requirePermission)('leads:reassign'), lead_controller_1.leadController.reassign);
// Detailed profile route
router.get('/:id/profile', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), lead_controller_1.leadController.getProfile);
// Notes routes
router.get('/:id/notes', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), leadNote_controller_1.leadNoteController.list);
router.post('/:id/notes', (0, permission_1.requirePermission)('leads:notes:create'), (0, validate_1.validateRequest)(leadNote_validator_1.createNoteSchema), (0, activityLogger_1.logActivity)('leads', 'NOTE_ADDED'), leadNote_controller_1.leadNoteController.create);
router.put('/:id/notes/:noteId', (0, permission_1.requirePermission)('leads:notes:edit'), (0, validate_1.validateRequest)(leadNote_validator_1.updateNoteSchema), (0, activityLogger_1.logActivity)('leads', 'NOTE_UPDATED'), leadNote_controller_1.leadNoteController.update);
router.delete('/:id/notes/:noteId', (0, permission_1.requirePermission)('leads:notes:delete'), (0, activityLogger_1.logActivity)('leads', 'NOTE_DELETED'), leadNote_controller_1.leadNoteController.delete);
// Activities routes
router.get('/:id/activities', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), leadActivity_controller_1.leadActivityController.list);
router.post('/:id/activities', (0, permission_1.requirePermission)('leads:activities:create'), (0, validate_1.validateRequest)(leadActivity_validator_1.createActivitySchema), (0, activityLogger_1.logActivity)('leads', 'ACTIVITY_CREATED'), leadActivity_controller_1.leadActivityController.create);
router.put('/:id/activities/:activityId', (0, permission_1.requirePermission)('leads:activities:edit'), (0, validate_1.validateRequest)(leadActivity_validator_1.updateActivitySchema), (0, activityLogger_1.logActivity)('leads', 'ACTIVITY_UPDATED'), leadActivity_controller_1.leadActivityController.update);
router.delete('/:id/activities/:activityId', (0, permission_1.requirePermission)('leads:activities:delete'), (0, activityLogger_1.logActivity)('leads', 'ACTIVITY_DELETED'), leadActivity_controller_1.leadActivityController.delete);
// Files routes
router.get('/:id/files', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), leadFile_controller_1.leadFileController.list);
router.get('/:id/files/summary', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), leadFile_controller_1.leadFileController.getStorageSummary);
router.post('/:id/files', (0, permission_1.requirePermission)('leads:files:upload'), upload_1.upload.single('file'), (0, activityLogger_1.logActivity)('leads', 'FILE_UPLOADED'), leadFile_controller_1.leadFileController.create);
router.delete('/:id/files/:fileId', (0, permission_1.requirePermission)('leads:files:delete'), (0, activityLogger_1.logActivity)('leads', 'FILE_DELETED'), leadFile_controller_1.leadFileController.delete);
// Timeline route
router.get('/:id/timeline', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), leadTimeline_controller_1.leadTimelineController.list);
// History (Audit log) route
router.get('/:id/history', (0, permission_1.requirePermission)('leads:view'), (0, validate_1.validateRequest)(lead_validator_1.getLeadByIdSchema), leadHistory_controller_1.leadHistoryController.list);
exports.default = router;
