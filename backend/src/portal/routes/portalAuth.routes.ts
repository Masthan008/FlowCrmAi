import { Router } from 'express';
import { portalController } from '../controller/portal.controller';
import { validateRequest } from '../../middlewares/validate';
import { portalLoginSchema, portalRegisterSchema } from '../validators/portal.validator';

const router = Router();

router.post('/login', validateRequest(portalLoginSchema), portalController.login);
router.post('/register', validateRequest(portalRegisterSchema), portalController.register);

export default router;
