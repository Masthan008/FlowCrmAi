import { Router } from 'express';
import { webFormController } from '../controller/webform.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createWebFormSchema, updateWebFormSchema } from '../validators/webform.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('webforms:view'), webFormController.list);
router.get('/:id', requirePermission('webforms:view'), webFormController.getById);
router.post('/', requirePermission('webforms:create'), validateRequest(createWebFormSchema), webFormController.create);
router.put('/:id', requirePermission('webforms:edit'), validateRequest(updateWebFormSchema), webFormController.update);
router.delete('/:id', requirePermission('webforms:delete'), webFormController.delete);
router.patch('/:id/activate', requirePermission('webforms:edit'), webFormController.activate);
router.patch('/:id/deactivate', requirePermission('webforms:edit'), webFormController.deactivate);
router.get('/:id/submissions', requirePermission('webforms:view'), webFormController.getSubmissions);
router.get('/:id/embed', requirePermission('webforms:view'), webFormController.getEmbedCode);

export default router;
