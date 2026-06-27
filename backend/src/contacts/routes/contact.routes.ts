import { Router } from 'express';
import { contactController } from '../controller/contact.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';

import {
  createContactSchema,
  updateContactSchema,
  bulkUpdateStatusSchema,
  bulkUpdateOwnerSchema,
  getContactByIdSchema,
} from '../validators/contact.validator';

const router = Router();

// All contact routes require authentication
router.use(requireAuth);

// Statistics route (must come before /:id)
router.get(
  '/statistics',
  requirePermission('contacts:view'),
  contactController.getStatistics
);

// Bulk updates
router.patch(
  '/status',
  requirePermission('contacts:edit'),
  validateRequest(bulkUpdateStatusSchema),
  logActivity('contacts', 'CONTACT_BULK_STATUS_UPDATED'),
  contactController.bulkUpdateStatus
);

router.patch(
  '/owner',
  requirePermission('contacts:assign'),
  validateRequest(bulkUpdateOwnerSchema),
  logActivity('contacts', 'CONTACT_BULK_OWNER_UPDATED'),
  contactController.bulkUpdateOwner
);

// CRUD routes
router.get(
  '/',
  requirePermission('contacts:view'),
  contactController.list
);

router.get(
  '/:id',
  requirePermission('contacts:view'),
  validateRequest(getContactByIdSchema),
  logActivity('contacts', 'CONTACT_VIEWED'),
  contactController.getById
);

router.post(
  '/',
  requirePermission('contacts:create'),
  validateRequest(createContactSchema),
  logActivity('contacts', 'CONTACT_CREATED'),
  contactController.create
);

router.put(
  '/:id',
  requirePermission('contacts:edit'),
  validateRequest(updateContactSchema),
  logActivity('contacts', 'CONTACT_UPDATED'),
  contactController.update
);

router.delete(
  '/:id',
  requirePermission('contacts:delete'),
  validateRequest(getContactByIdSchema),
  logActivity('contacts', 'CONTACT_DELETED'),
  contactController.delete
);

export default router;
