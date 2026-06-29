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

router.get('/statistics', requirePermission('deals:view'), dealController.getStatistics);

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
