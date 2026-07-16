import { Router } from 'express';
import { gdprController } from '../controller/gdpr.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { recordConsentSchema, createDataRequestSchema } from '../validators/gdpr.validator';

const router = Router();

router.use(requireAuth);

router.get('/consent-logs', requirePermission('gdpr:view'), gdprController.listConsentLogs);
router.post('/consent-logs', requirePermission('gdpr:manage'), validateRequest(recordConsentSchema), gdprController.recordConsent);
router.patch('/consent-logs/:id/revoke', requirePermission('gdpr:manage'), gdprController.revokeConsent);

router.get('/data-requests', requirePermission('gdpr:view'), gdprController.listDataRequests);
router.post('/data-requests', requirePermission('gdpr:manage'), validateRequest(createDataRequestSchema), gdprController.createDataRequest);
router.patch('/data-requests/:id/process', requirePermission('gdpr:manage'), gdprController.processDataRequest);
router.patch('/data-requests/:id/complete', requirePermission('gdpr:manage'), gdprController.completeDataRequest);
router.patch('/data-requests/:id/reject', requirePermission('gdpr:manage'), gdprController.rejectDataRequest);

export default router;
