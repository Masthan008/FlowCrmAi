"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const upload_1 = require("../../middlewares/upload");
const task_controller_1 = require("../controller/task.controller");
const task_validator_1 = require("../validators/task.validator");
const router = (0, express_1.Router)();
// Apply auth middleware to all task routes
router.use(auth_1.requireAuth);
// 1. Statistics endpoint (must be declared BEFORE /:id routes)
router.get('/statistics', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getStatistics);
router.get('/calendar', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getCalendar);
router.get('/workload', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getWorkload);
router.get('/productivity', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getProductivity);
// 2. Task CRUD Endpoints
router.get('/', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getTasks);
router.get('/:id', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getById);
router.post('/', (0, permission_1.requirePermission)('tasks:create'), (0, validate_1.validateRequest)(task_validator_1.createTaskSchema), task_controller_1.taskController.create);
router.put('/:id', (0, permission_1.requirePermission)('tasks:edit'), (0, validate_1.validateRequest)(task_validator_1.updateTaskSchema), task_controller_1.taskController.update);
router.delete('/:id', (0, permission_1.requirePermission)('tasks:delete'), task_controller_1.taskController.delete);
// 3. Patch specific task fields
router.patch('/status', (0, permission_1.requirePermission)('tasks:complete'), (0, validate_1.validateRequest)(task_validator_1.patchStatusSchema), task_controller_1.taskController.patchStatus);
router.patch('/:id/status', (0, permission_1.requirePermission)('tasks:complete'), (0, validate_1.validateRequest)(task_validator_1.patchStatusSchema), task_controller_1.taskController.patchStatus);
router.patch('/progress', (0, permission_1.requirePermission)('tasks:edit'), (0, validate_1.validateRequest)(task_validator_1.patchProgressSchema), task_controller_1.taskController.patchProgress);
router.patch('/:id/progress', (0, permission_1.requirePermission)('tasks:edit'), (0, validate_1.validateRequest)(task_validator_1.patchProgressSchema), task_controller_1.taskController.patchProgress);
router.patch('/assign', (0, permission_1.requirePermission)('tasks:assign'), (0, validate_1.validateRequest)(task_validator_1.patchAssignSchema), task_controller_1.taskController.patchAssign);
router.patch('/:id/assign', (0, permission_1.requirePermission)('tasks:assign'), (0, validate_1.validateRequest)(task_validator_1.patchAssignSchema), task_controller_1.taskController.patchAssign);
// 4. Comments Sub-routes
router.post('/:id/comments', (0, permission_1.requirePermission)('tasks:view'), (0, validate_1.validateRequest)(task_validator_1.createCommentSchema), task_controller_1.taskController.addComment);
router.put('/:id/comments/:commentId', (0, permission_1.requirePermission)('tasks:edit'), (0, validate_1.validateRequest)(task_validator_1.createCommentSchema), task_controller_1.taskController.updateComment);
router.delete('/:id/comments/:commentId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.deleteComment);
// 5. Attachments Sub-routes
router.post('/:id/attachments', (0, permission_1.requirePermission)('tasks:edit'), upload_1.upload.single('file'), task_controller_1.taskController.addAttachment);
router.delete('/:id/attachments/:attachmentId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.deleteAttachment);
// 6. Subtask Routes
router.get('/:id/subtasks', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getSubtasks);
router.post('/:id/subtasks', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.addSubtask);
router.put('/:id/subtasks/:subtaskId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.updateSubtask);
router.delete('/:id/subtasks/:subtaskId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.deleteSubtask);
// 7. Checklist Routes
router.post('/:id/checklists', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.addChecklistItem);
router.put('/:id/checklists/:itemId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.updateChecklistItem);
router.delete('/:id/checklists/:itemId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.deleteChecklistItem);
// 8. Time Logging Routes
router.get('/:id/time', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getTimeLogs);
router.post('/:id/time', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.addTimeLog);
router.delete('/:id/time/:logId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.deleteTimeLog);
// 9. Watchers Routes
router.post('/:id/watchers', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.addWatcher);
router.delete('/:id/watchers/:employeeId', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.removeWatcher);
// 10. Dependencies Routes
router.post('/:id/dependencies', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.addDependency);
router.delete('/:id/dependencies/:dependentTaskId/:type', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.removeDependency);
// 11. Recurrence Routes
router.post('/:id/recurrence', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.upsertRecurrence);
// 12. Approvals Routes
router.post('/:id/approve/request', (0, permission_1.requirePermission)('tasks:edit'), task_controller_1.taskController.requestApproval);
router.patch('/:id/approve', (0, permission_1.requirePermission)('tasks:complete'), task_controller_1.taskController.approveTask);
router.patch('/:id/reject', (0, permission_1.requirePermission)('tasks:complete'), task_controller_1.taskController.rejectTask);
// 13. Timeline History Route
router.get('/:id/timeline', (0, permission_1.requirePermission)('tasks:view'), task_controller_1.taskController.getTimeline);
exports.default = router;
exports.taskRouter = router;
