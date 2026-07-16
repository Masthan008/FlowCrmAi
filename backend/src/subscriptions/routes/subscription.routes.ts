import { Router } from 'express';
import { subscriptionController } from '../controller/subscription.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createPlanSchema, updatePlanSchema, createSubscriptionSchema, updateSubscriptionSchema } from '../validators/subscription.validator';

const router = Router();

router.use(requireAuth);

router.get('/plans', requirePermission('subscriptions:view'), subscriptionController.listPlans);
router.post('/plans', requirePermission('subscriptions:create'), validateRequest(createPlanSchema), subscriptionController.createPlan);
router.put('/plans/:id', requirePermission('subscriptions:edit'), validateRequest(updatePlanSchema), subscriptionController.updatePlan);
router.delete('/plans/:id', requirePermission('subscriptions:delete'), subscriptionController.deletePlan);
router.get('/', requirePermission('subscriptions:view'), subscriptionController.list);
router.get('/:id', requirePermission('subscriptions:view'), subscriptionController.getById);
router.post('/', requirePermission('subscriptions:create'), validateRequest(createSubscriptionSchema), subscriptionController.create);
router.put('/:id', requirePermission('subscriptions:edit'), validateRequest(updateSubscriptionSchema), subscriptionController.update);
router.delete('/:id', requirePermission('subscriptions:delete'), subscriptionController.cancel);
router.patch('/:id/pause', requirePermission('subscriptions:edit'), subscriptionController.pause);
router.patch('/:id/resume', requirePermission('subscriptions:edit'), subscriptionController.resume);

export default router;
