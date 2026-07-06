import { Router } from 'express';
import { invoiceController } from '../controller/invoice.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createInvoiceSchema, updateInvoiceSchema, recordPaymentSchema } from '../validators/invoice.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('invoices:view'), invoiceController.list);
router.get('/:id', requirePermission('invoices:view'), invoiceController.getById);
router.post('/', requirePermission('invoices:create'), validateRequest(createInvoiceSchema), invoiceController.create);
router.put('/:id', requirePermission('invoices:edit'), validateRequest(updateInvoiceSchema), invoiceController.update);
router.delete('/:id', requirePermission('invoices:delete'), invoiceController.delete);

// Invoice Payments
router.get('/:id/payments', requirePermission('invoices:view'), invoiceController.getPayments);
router.post('/:id/payments', requirePermission('invoices:edit'), validateRequest(recordPaymentSchema), invoiceController.recordPayment);

export default router;
