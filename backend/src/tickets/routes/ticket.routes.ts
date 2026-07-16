import { Router } from 'express';
import { ticketController } from '../controller/ticket.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createTicketSchema, updateTicketSchema, createTicketCommentSchema, createTicketTimeLogSchema } from '../validators/ticket.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tickets:view'), ticketController.list);
router.get('/statistics', requirePermission('tickets:view'), ticketController.getStatistics);
router.get('/:id', requirePermission('tickets:view'), ticketController.getById);
router.post('/', requirePermission('tickets:create'), validateRequest(createTicketSchema), ticketController.create);
router.put('/:id', requirePermission('tickets:edit'), validateRequest(updateTicketSchema), ticketController.update);
router.delete('/:id', requirePermission('tickets:delete'), ticketController.delete);
router.patch('/:id/status', requirePermission('tickets:edit'), ticketController.updateStatus);
router.patch('/:id/priority', requirePermission('tickets:edit'), ticketController.updatePriority);
router.patch('/:id/assign', requirePermission('tickets:edit'), ticketController.assign);
router.get('/:id/comments', requirePermission('tickets:view'), ticketController.getComments);
router.post('/:id/comments', requirePermission('tickets:create'), validateRequest(createTicketCommentSchema), ticketController.addComment);
router.delete('/:id/comments/:commentId', requirePermission('tickets:delete'), ticketController.deleteComment);
router.get('/:id/attachments', requirePermission('tickets:view'), ticketController.getAttachments);
router.post('/:id/attachments', requirePermission('tickets:create'), ticketController.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', requirePermission('tickets:delete'), ticketController.deleteAttachment);
router.get('/:id/time-logs', requirePermission('tickets:view'), ticketController.getTimeLogs);
router.post('/:id/time-logs', requirePermission('tickets:create'), validateRequest(createTicketTimeLogSchema), ticketController.logTime);

export default router;
