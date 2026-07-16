import { Router } from 'express';
import { portalController } from '../controller/portal.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createPortalUserSchema, updatePortalUserSchema, portalLoginSchema, portalRegisterSchema } from '../validators/portal.validator';

const router = Router();

router.use(requireAuth);

router.get('/users', requirePermission('portal:view'), portalController.listUsers);
router.get('/users/:id', requirePermission('portal:view'), portalController.getUserById);
router.post('/users', requirePermission('portal:manage'), validateRequest(createPortalUserSchema), portalController.createUser);
router.put('/users/:id', requirePermission('portal:manage'), validateRequest(updatePortalUserSchema), portalController.updateUser);
router.delete('/users/:id', requirePermission('portal:manage'), portalController.deleteUser);
router.get('/me', portalController.getProfile);

export default router;
