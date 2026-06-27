import { Router } from 'express';
import { leadController } from '../controller/lead.controller';
import { leadNoteController } from '../controller/leadNote.controller';
import { leadActivityController } from '../controller/leadActivity.controller';
import { leadFileController } from '../controller/leadFile.controller';
import { leadTimelineController } from '../controller/leadTimeline.controller';
import { leadHistoryController } from '../controller/leadHistory.controller';

import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';
import { upload } from '../../middlewares/upload';

import {
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
  updateOwnerSchema,
  updatePrioritySchema,
  updateRatingSchema,
  listLeadsSchema,
  getLeadByIdSchema,
} from '../validators/lead.validator';
import { createNoteSchema, updateNoteSchema } from '../validators/leadNote.validator';
import { createActivitySchema, updateActivitySchema } from '../validators/leadActivity.validator';

const router = Router();

// All lead routes require authentication
router.use(requireAuth);

// Master data endpoints (must come before /:id routes)
router.get('/sources', requirePermission('leads:view'), leadController.getSources);
router.get('/statuses', requirePermission('leads:view'), leadController.getStatuses);
router.get('/statistics', requirePermission('leads:view'), leadController.getStatistics);
router.get('/employees', requirePermission('leads:view'), leadController.getEmployees);

// CRUD routes
router.get(
  '/',
  requirePermission('leads:view'),
  validateRequest(listLeadsSchema),
  leadController.list
);

router.get(
  '/:id',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  logActivity('leads', 'LEAD_VIEWED'),
  leadController.getById
);

router.post(
  '/',
  requirePermission('leads:create'),
  validateRequest(createLeadSchema),
  logActivity('leads', 'LEAD_CREATED'),
  leadController.create
);

router.put(
  '/:id',
  requirePermission('leads:edit'),
  validateRequest(updateLeadSchema),
  logActivity('leads', 'LEAD_UPDATED'),
  leadController.update
);

router.delete(
  '/:id',
  requirePermission('leads:delete'),
  validateRequest(getLeadByIdSchema),
  logActivity('leads', 'LEAD_DELETED'),
  leadController.delete
);

// Patch routes for individual field updates
router.patch(
  '/:id/status',
  requirePermission('leads:edit'),
  validateRequest(updateStatusSchema),
  logActivity('leads', 'LEAD_STATUS_CHANGED'),
  leadController.updateStatus
);

router.patch(
  '/:id/owner',
  requirePermission('leads:assign'),
  validateRequest(updateOwnerSchema),
  logActivity('leads', 'LEAD_OWNER_CHANGED'),
  leadController.updateOwner
);

router.patch(
  '/:id/priority',
  requirePermission('leads:edit'),
  validateRequest(updatePrioritySchema),
  logActivity('leads', 'LEAD_PRIORITY_CHANGED'),
  leadController.updatePriority
);

router.patch(
  '/:id/rating',
  requirePermission('leads:edit'),
  validateRequest(updateRatingSchema),
  logActivity('leads', 'LEAD_RATING_CHANGED'),
  leadController.updateRating
);

// Detailed profile route
router.get(
  '/:id/profile',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  leadController.getProfile
);

// Notes routes
router.get(
  '/:id/notes',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  leadNoteController.list
);

router.post(
  '/:id/notes',
  requirePermission('leads:notes:create'),
  validateRequest(createNoteSchema),
  logActivity('leads', 'NOTE_ADDED'),
  leadNoteController.create
);

router.put(
  '/:id/notes/:noteId',
  requirePermission('leads:notes:edit'),
  validateRequest(updateNoteSchema),
  logActivity('leads', 'NOTE_UPDATED'),
  leadNoteController.update
);

router.delete(
  '/:id/notes/:noteId',
  requirePermission('leads:notes:delete'),
  logActivity('leads', 'NOTE_DELETED'),
  leadNoteController.delete
);

// Activities routes
router.get(
  '/:id/activities',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  leadActivityController.list
);

router.post(
  '/:id/activities',
  requirePermission('leads:activities:create'),
  validateRequest(createActivitySchema),
  logActivity('leads', 'ACTIVITY_CREATED'),
  leadActivityController.create
);

router.put(
  '/:id/activities/:activityId',
  requirePermission('leads:activities:edit'),
  validateRequest(updateActivitySchema),
  logActivity('leads', 'ACTIVITY_UPDATED'),
  leadActivityController.update
);

router.delete(
  '/:id/activities/:activityId',
  requirePermission('leads:activities:delete'),
  logActivity('leads', 'ACTIVITY_DELETED'),
  leadActivityController.delete
);

// Files routes
router.get(
  '/:id/files',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  leadFileController.list
);

router.get(
  '/:id/files/summary',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  leadFileController.getStorageSummary
);

router.post(
  '/:id/files',
  requirePermission('leads:files:upload'),
  upload.single('file'),
  logActivity('leads', 'FILE_UPLOADED'),
  leadFileController.create
);

router.delete(
  '/:id/files/:fileId',
  requirePermission('leads:files:delete'),
  logActivity('leads', 'FILE_DELETED'),
  leadFileController.delete
);

// Timeline route
router.get(
  '/:id/timeline',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  leadTimelineController.list
);

// History (Audit log) route
router.get(
  '/:id/history',
  requirePermission('leads:view'),
  validateRequest(getLeadByIdSchema),
  leadHistoryController.list
);

export default router;
