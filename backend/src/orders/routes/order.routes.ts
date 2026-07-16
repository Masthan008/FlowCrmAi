import { Router } from 'express';
import { orderController } from '../controller/order.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createOrderSchema, updateOrderSchema } from '../validators/order.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('orders:view'), orderController.list);
router.get('/:id', requirePermission('orders:view'), orderController.getById);
router.post('/', requirePermission('orders:create'), validateRequest(createOrderSchema), orderController.create);
router.put('/:id', requirePermission('orders:edit'), validateRequest(updateOrderSchema), orderController.update);
router.delete('/:id', requirePermission('orders:delete'), orderController.delete);
router.patch('/:id/status', requirePermission('orders:edit'), orderController.updateStatus);

export default router;
