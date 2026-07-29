import { Router } from 'express';
import { chatController } from '../controller/chat.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import {
  createChatConversationSchema,
  sendMessageSchema,
  assignConversationSchema,
  rateConversationSchema,
} from '../validators/chat.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('chat:view'), chatController.list);
router.get('/conversations', requirePermission('chat:view'), chatController.list);
router.get('/:id', requirePermission('chat:view'), chatController.getById);
router.get('/conversations/:id', requirePermission('chat:view'), chatController.getById);
router.post('/', requirePermission('chat:respond'), validateRequest(createChatConversationSchema), chatController.create);
router.post('/conversations', requirePermission('chat:respond'), validateRequest(createChatConversationSchema), chatController.create);
router.post('/:id/messages', requirePermission('chat:respond'), validateRequest(sendMessageSchema), chatController.sendMessage);
router.post('/conversations/:id/messages', requirePermission('chat:respond'), validateRequest(sendMessageSchema), chatController.sendMessage);
router.patch('/:id/assign', requirePermission('chat:manage'), validateRequest(assignConversationSchema), chatController.assign);
router.patch('/conversations/:id/assign', requirePermission('chat:manage'), validateRequest(assignConversationSchema), chatController.assign);
router.patch('/:id/close', requirePermission('chat:manage'), chatController.close);
router.patch('/conversations/:id/close', requirePermission('chat:manage'), chatController.close);
router.patch('/:id/rate', validateRequest(rateConversationSchema), chatController.rate);
router.patch('/conversations/:id/rate', validateRequest(rateConversationSchema), chatController.rate);

export default router;
