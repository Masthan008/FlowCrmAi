import { Router } from 'express';
import { contractController } from '../controller/contract.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createContractSchema, updateContractSchema } from '../validators/contract.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('contracts:view'), contractController.list);
router.get('/:id', requirePermission('contracts:view'), contractController.getById);
router.post('/', requirePermission('contracts:create'), validateRequest(createContractSchema), contractController.create);
router.put('/:id', requirePermission('contracts:edit'), validateRequest(updateContractSchema), contractController.update);
router.delete('/:id', requirePermission('contracts:delete'), contractController.delete);
router.patch('/:id/approve', requirePermission('contracts:edit'), contractController.approve);
router.patch('/:id/renew', requirePermission('contracts:edit'), contractController.renew);
router.patch('/:id/terminate', requirePermission('contracts:edit'), contractController.terminate);

export default router;
