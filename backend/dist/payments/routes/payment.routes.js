"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controller/payment.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const payment_validator_1 = require("../validators/payment.validator");
const router = (0, express_1.Router)();
// Public / Guest Payment Processing endpoint for Checkout & Subscriptions
router.post('/process', payment_controller_1.paymentController.processPayment);
// Authenticated Routes
router.use(auth_1.requireAuth);
router.get('/', (0, permission_1.requirePermission)('invoices:view'), payment_controller_1.paymentController.list);
router.get('/:id', (0, permission_1.requirePermission)('invoices:view'), (0, validate_1.validateRequest)(payment_validator_1.getPaymentByIdSchema), payment_controller_1.paymentController.getById);
router.post('/', (0, permission_1.requirePermission)('invoices:create'), (0, validate_1.validateRequest)(payment_validator_1.createPaymentSchema), payment_controller_1.paymentController.create);
router.put('/:id', (0, permission_1.requirePermission)('invoices:edit'), (0, validate_1.validateRequest)(payment_validator_1.updatePaymentSchema), payment_controller_1.paymentController.update);
router.delete('/:id', (0, permission_1.requirePermission)('invoices:delete'), (0, validate_1.validateRequest)(payment_validator_1.getPaymentByIdSchema), payment_controller_1.paymentController.delete);
exports.default = router;
