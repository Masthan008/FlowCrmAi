import { Router } from 'express';
import { emailController } from '../controller/email.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createAccountSchema, updateAccountSchema, sendEmailSchema } from '../validators/email.validator';

const router = Router();

router.use(requireAuth);

router.get('/accounts', requirePermission('email:view'), emailController.listAccounts);
router.post('/accounts', requirePermission('email:manage'), validateRequest(createAccountSchema), emailController.addAccount);
router.put('/accounts/:id', requirePermission('email:manage'), validateRequest(updateAccountSchema), emailController.updateAccount);
router.delete('/accounts/:id', requirePermission('email:manage'), emailController.removeAccount);
router.post('/accounts/:id/sync', requirePermission('email:manage'), emailController.syncAccount);
router.post('/sync', requirePermission('email:manage'), emailController.syncAccount);
router.get('/messages', requirePermission('email:view'), emailController.listMessages);
router.get('/accounts/:id/messages', requirePermission('email:view'), emailController.listMessages);
router.get('/messages/:id', requirePermission('email:view'), emailController.getMessage);
router.patch('/messages/:id/read', requirePermission('email:view'), emailController.markAsRead);
router.patch('/messages/:id/star', requirePermission('email:view'), emailController.toggleStar);
router.post('/send', requirePermission('email:send'), validateRequest(sendEmailSchema), emailController.send);

export default router;
