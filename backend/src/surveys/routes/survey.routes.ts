import { Router } from 'express';
import { surveyController } from '../controller/survey.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createSurveySchema, updateSurveySchema } from '../validators/survey.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('surveys:view'), surveyController.list);
router.get('/:id', requirePermission('surveys:view'), surveyController.getById);
router.post('/', requirePermission('surveys:create'), validateRequest(createSurveySchema), surveyController.create);
router.put('/:id', requirePermission('surveys:edit'), validateRequest(updateSurveySchema), surveyController.update);
router.delete('/:id', requirePermission('surveys:delete'), surveyController.delete);
router.patch('/:id/activate', requirePermission('surveys:edit'), surveyController.activate);
router.patch('/:id/close', requirePermission('surveys:edit'), surveyController.close);
router.get('/:id/responses', requirePermission('surveys:view'), surveyController.getResponses);
router.get('/:id/analytics', requirePermission('surveys:view'), surveyController.getAnalytics);

export default router;
