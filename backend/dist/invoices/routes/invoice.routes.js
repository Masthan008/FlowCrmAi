"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controller/invoice.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const invoice_validator_1 = require("../validators/invoice.validator");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', (0, permission_1.requirePermission)('invoices:view'), invoice_controller_1.invoiceController.list);
router.get('/:id', (0, permission_1.requirePermission)('invoices:view'), invoice_controller_1.invoiceController.getById);
router.post('/', (0, permission_1.requirePermission)('invoices:create'), (0, validate_1.validateRequest)(invoice_validator_1.createInvoiceSchema), invoice_controller_1.invoiceController.create);
router.put('/:id', (0, permission_1.requirePermission)('invoices:edit'), (0, validate_1.validateRequest)(invoice_validator_1.updateInvoiceSchema), invoice_controller_1.invoiceController.update);
router.delete('/:id', (0, permission_1.requirePermission)('invoices:delete'), invoice_controller_1.invoiceController.delete);
// Invoice Payments
router.get('/:id/payments', (0, permission_1.requirePermission)('invoices:view'), invoice_controller_1.invoiceController.getPayments);
router.post('/:id/payments', (0, permission_1.requirePermission)('invoices:edit'), (0, validate_1.validateRequest)(invoice_validator_1.recordPaymentSchema), invoice_controller_1.invoiceController.recordPayment);
exports.default = router;
