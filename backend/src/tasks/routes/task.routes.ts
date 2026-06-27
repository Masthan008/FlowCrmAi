import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { upload } from '../../middlewares/upload';
import { taskController } from '../controller/task.controller';
import {
  createTaskSchema,
  updateTaskSchema,
  patchStatusSchema,
  patchProgressSchema,
  patchAssignSchema,
  createCommentSchema,
} from '../validators/task.validator';

const router = Router();

// Apply auth middleware to all task routes
router.use(requireAuth);

// 1. Statistics endpoint (must be declared BEFORE /:id routes)
router.get(
  '/statistics',
  requirePermission('tasks:view'),
  taskController.getStatistics
);

router.get(
  '/calendar',
  requirePermission('tasks:view'),
  taskController.getCalendar
);

router.get(
  '/workload',
  requirePermission('tasks:view'),
  taskController.getWorkload
);

router.get(
  '/productivity',
  requirePermission('tasks:view'),
  taskController.getProductivity
);

// 2. Task CRUD Endpoints
router.get(
  '/',
  requirePermission('tasks:view'),
  taskController.getTasks
);

router.get(
  '/:id',
  requirePermission('tasks:view'),
  taskController.getById
);

router.post(
  '/',
  requirePermission('tasks:create'),
  validateRequest(createTaskSchema),
  taskController.create
);

router.put(
  '/:id',
  requirePermission('tasks:edit'),
  validateRequest(updateTaskSchema),
  taskController.update
);

router.delete(
  '/:id',
  requirePermission('tasks:delete'),
  taskController.delete
);

// 3. Patch specific task fields
router.patch(
  '/status',
  requirePermission('tasks:complete'),
  validateRequest(patchStatusSchema),
  taskController.patchStatus
);

router.patch(
  '/:id/status',
  requirePermission('tasks:complete'),
  validateRequest(patchStatusSchema),
  taskController.patchStatus
);

router.patch(
  '/progress',
  requirePermission('tasks:edit'),
  validateRequest(patchProgressSchema),
  taskController.patchProgress
);

router.patch(
  '/:id/progress',
  requirePermission('tasks:edit'),
  validateRequest(patchProgressSchema),
  taskController.patchProgress
);

router.patch(
  '/assign',
  requirePermission('tasks:assign'),
  validateRequest(patchAssignSchema),
  taskController.patchAssign
);

router.patch(
  '/:id/assign',
  requirePermission('tasks:assign'),
  validateRequest(patchAssignSchema),
  taskController.patchAssign
);

// 4. Comments Sub-routes
router.post(
  '/:id/comments',
  requirePermission('tasks:view'),
  validateRequest(createCommentSchema),
  taskController.addComment
);

router.put(
  '/:id/comments/:commentId',
  requirePermission('tasks:edit'),
  validateRequest(createCommentSchema),
  taskController.updateComment
);

router.delete(
  '/:id/comments/:commentId',
  requirePermission('tasks:edit'),
  taskController.deleteComment
);

// 5. Attachments Sub-routes
router.post(
  '/:id/attachments',
  requirePermission('tasks:edit'),
  upload.single('file'),
  taskController.addAttachment
);

router.delete(
  '/:id/attachments/:attachmentId',
  requirePermission('tasks:edit'),
  taskController.deleteAttachment
);

// 6. Subtask Routes
router.get(
  '/:id/subtasks',
  requirePermission('tasks:view'),
  taskController.getSubtasks
);

router.post(
  '/:id/subtasks',
  requirePermission('tasks:edit'),
  taskController.addSubtask
);

router.put(
  '/:id/subtasks/:subtaskId',
  requirePermission('tasks:edit'),
  taskController.updateSubtask
);

router.delete(
  '/:id/subtasks/:subtaskId',
  requirePermission('tasks:edit'),
  taskController.deleteSubtask
);

// 7. Checklist Routes
router.post(
  '/:id/checklists',
  requirePermission('tasks:edit'),
  taskController.addChecklistItem
);

router.put(
  '/:id/checklists/:itemId',
  requirePermission('tasks:edit'),
  taskController.updateChecklistItem
);

router.delete(
  '/:id/checklists/:itemId',
  requirePermission('tasks:edit'),
  taskController.deleteChecklistItem
);

// 8. Time Logging Routes
router.get(
  '/:id/time',
  requirePermission('tasks:view'),
  taskController.getTimeLogs
);

router.post(
  '/:id/time',
  requirePermission('tasks:edit'),
  taskController.addTimeLog
);

router.delete(
  '/:id/time/:logId',
  requirePermission('tasks:edit'),
  taskController.deleteTimeLog
);

// 9. Watchers Routes
router.post(
  '/:id/watchers',
  requirePermission('tasks:edit'),
  taskController.addWatcher
);

router.delete(
  '/:id/watchers/:employeeId',
  requirePermission('tasks:edit'),
  taskController.removeWatcher
);

// 10. Dependencies Routes
router.post(
  '/:id/dependencies',
  requirePermission('tasks:edit'),
  taskController.addDependency
);

router.delete(
  '/:id/dependencies/:dependentTaskId/:type',
  requirePermission('tasks:edit'),
  taskController.removeDependency
);

// 11. Recurrence Routes
router.post(
  '/:id/recurrence',
  requirePermission('tasks:edit'),
  taskController.upsertRecurrence
);

// 12. Approvals Routes
router.post(
  '/:id/approve/request',
  requirePermission('tasks:edit'),
  taskController.requestApproval
);

router.patch(
  '/:id/approve',
  requirePermission('tasks:complete'),
  taskController.approveTask
);

router.patch(
  '/:id/reject',
  requirePermission('tasks:complete'),
  taskController.rejectTask
);

// 13. Timeline History Route
router.get(
  '/:id/timeline',
  requirePermission('tasks:view'),
  taskController.getTimeline
);

export default router;
export const taskRouter = router;
