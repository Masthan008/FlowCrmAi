import { Router } from 'express';
import { paymentController } from '../controller/payment.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import {
  createPaymentSchema,
  updatePaymentSchema,
  getPaymentByIdSchema,
} from '../validators/payment.validator';

const router = Router();

// Public / Guest Payment Processing endpoint for Checkout & Subscriptions
router.post('/process', paymentController.processPayment);

// Authenticated Routes
router.use(requireAuth);

router.get('/', requirePermission('invoices:view'), paymentController.list);
router.get('/:id', requirePermission('invoices:view'), validateRequest(getPaymentByIdSchema), paymentController.getById);
router.post('/', requirePermission('invoices:create'), validateRequest(createPaymentSchema), paymentController.create);
router.put('/:id', requirePermission('invoices:edit'), validateRequest(updatePaymentSchema), paymentController.update);
router.delete('/:id', requirePermission('invoices:delete'), validateRequest(getPaymentByIdSchema), paymentController.delete);

export default router;
