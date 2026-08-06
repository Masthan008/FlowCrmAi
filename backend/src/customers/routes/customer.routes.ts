import { Router } from 'express';
import { customerController } from '../controller/customer.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerByIdSchema,
} from '../validators/customer.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('contacts:view'), customerController.list);
router.get('/:id', requirePermission('contacts:view'), validateRequest(getCustomerByIdSchema), customerController.getById);
router.post('/', requirePermission('contacts:create'), validateRequest(createCustomerSchema), customerController.create);
router.put('/:id', requirePermission('contacts:edit'), validateRequest(updateCustomerSchema), customerController.update);
router.delete('/:id', requirePermission('contacts:delete'), validateRequest(getCustomerByIdSchema), customerController.delete);

export default router;
