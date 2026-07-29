"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commission_controller_1 = require("../controller/commission.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const commission_validator_1 = require("../validators/commission.validator");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Rules
router.get('/rules', (0, permission_1.requirePermission)('commissions:view'), commission_controller_1.commissionController.listRules);
router.post('/rules', (0, permission_1.requirePermission)('commissions:manage'), (0, validate_1.validateRequest)(commission_validator_1.createCommissionRuleSchema), commission_controller_1.commissionController.createRule);
router.put('/rules/:id', (0, permission_1.requirePermission)('commissions:manage'), (0, validate_1.validateRequest)(commission_validator_1.updateCommissionRuleSchema), commission_controller_1.commissionController.updateRule);
router.delete('/rules/:id', (0, permission_1.requirePermission)('commissions:manage'), commission_controller_1.commissionController.deleteRule);
// Payouts
router.get('/payouts', (0, permission_1.requirePermission)('commissions:view'), commission_controller_1.commissionController.listPayouts);
router.get('/payouts/:id', (0, permission_1.requirePermission)('commissions:view'), commission_controller_1.commissionController.getPayoutById);
router.post('/payouts/calculate', (0, permission_1.requirePermission)('commissions:manage'), commission_controller_1.commissionController.calculatePayouts);
router.patch('/payouts/:id/approve', (0, permission_1.requirePermission)('commissions:manage'), commission_controller_1.commissionController.approvePayout);
router.patch('/payouts/:id/pay', (0, permission_1.requirePermission)('commissions:manage'), commission_controller_1.commissionController.payPayout);
// Dashboard
router.get('/dashboard', (0, permission_1.requirePermission)('commissions:view'), commission_controller_1.commissionController.getDashboard);
exports.default = router;
