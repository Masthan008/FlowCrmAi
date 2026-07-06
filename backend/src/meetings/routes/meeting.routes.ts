import { Router } from 'express';
import { meetingController } from '../controller/meeting.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createMeetingSchema, updateMeetingSchema } from '../validators/meeting.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('meetings:view'), meetingController.list);
router.get('/:id', requirePermission('meetings:view'), meetingController.getById);
router.post('/', requirePermission('meetings:create'), validateRequest(createMeetingSchema), meetingController.create);
router.put('/:id', requirePermission('meetings:edit'), validateRequest(updateMeetingSchema), meetingController.update);
router.delete('/:id', requirePermission('meetings:delete'), meetingController.delete);

export default router;
