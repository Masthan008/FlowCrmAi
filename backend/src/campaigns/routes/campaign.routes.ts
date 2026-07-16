import { Router } from 'express';
import { campaignController } from '../controller/campaign.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createCampaignSchema, updateCampaignSchema, createCampaignListSchema, createCampaignEmailSchema, updateCampaignEmailSchema } from '../validators/campaign.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('campaigns:view'), campaignController.list);
router.get('/:id', requirePermission('campaigns:view'), campaignController.getById);
router.post('/', requirePermission('campaigns:create'), validateRequest(createCampaignSchema), campaignController.create);
router.put('/:id', requirePermission('campaigns:edit'), validateRequest(updateCampaignSchema), campaignController.update);
router.delete('/:id', requirePermission('campaigns:delete'), campaignController.delete);
router.post('/:id/launch', requirePermission('campaigns:edit'), campaignController.launch);
router.post('/:id/pause', requirePermission('campaigns:edit'), campaignController.pause);
router.get('/:id/analytics', requirePermission('campaigns:view'), campaignController.getAnalytics);
router.get('/:id/lists', requirePermission('campaigns:view'), campaignController.getLists);
router.post('/:id/lists', requirePermission('campaigns:create'), validateRequest(createCampaignListSchema), campaignController.createList);
router.delete('/:id/lists/:listId', requirePermission('campaigns:delete'), campaignController.deleteList);
router.get('/:id/emails', requirePermission('campaigns:view'), campaignController.getEmails);
router.post('/:id/emails', requirePermission('campaigns:create'), validateRequest(createCampaignEmailSchema), campaignController.createEmail);
router.put('/:id/emails/:emailId', requirePermission('campaigns:edit'), validateRequest(updateCampaignEmailSchema), campaignController.updateEmail);
router.delete('/:id/emails/:emailId', requirePermission('campaigns:delete'), campaignController.deleteEmail);

export default router;
