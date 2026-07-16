import { Router } from 'express';
import { webFormController } from '../controller/webform.controller';

const router = Router();

router.post('/:id/submit', webFormController.submitPublic);

export default router;
