import { Router } from 'express';
import { leadController } from '../controller/lead.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';
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

const router = Router();

// All lead routes require authentication
router.use(requireAuth);

// Master data endpoints (must come before /:id routes)
router.get('/sources', requirePermission('leads:view'), leadController.getSources);
router.get('/statuses', requirePermission('leads:view'), leadController.getStatuses);
router.get('/statistics', requirePermission('leads:view'), leadController.getStatistics);

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

export default router;
