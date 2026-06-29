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

export default router;
