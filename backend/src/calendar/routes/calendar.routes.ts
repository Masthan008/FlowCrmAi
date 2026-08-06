import { Router } from 'express';
import { calendarController } from '../controller/calendar.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import {
  createCalendarSchema,
  updateCalendarSchema,
  getCalendarByIdSchema,
} from '../validators/calendar.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('meetings:view'), calendarController.list);
router.get('/:id', requirePermission('meetings:view'), validateRequest(getCalendarByIdSchema), calendarController.getById);
router.post('/', requirePermission('meetings:create'), validateRequest(createCalendarSchema), calendarController.create);
router.put('/:id', requirePermission('meetings:edit'), validateRequest(updateCalendarSchema), calendarController.update);
router.delete('/:id', requirePermission('meetings:delete'), validateRequest(getCalendarByIdSchema), calendarController.delete);

export default router;
