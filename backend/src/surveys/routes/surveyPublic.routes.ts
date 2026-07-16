import { Router } from 'express';
import { surveyController } from '../controller/survey.controller';

const router = Router();

router.post('/:id/submit', surveyController.submitPublic);

export default router;
