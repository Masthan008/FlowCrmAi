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

export default router;
export const taskRouter = router;
