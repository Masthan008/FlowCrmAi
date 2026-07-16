import { Router } from 'express';
import { commissionController } from '../controller/commission.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createCommissionRuleSchema, updateCommissionRuleSchema } from '../validators/commission.validator';

const router = Router();

router.use(requireAuth);

// Rules
router.get('/rules', requirePermission('commissions:view'), commissionController.listRules);
router.post('/rules', requirePermission('commissions:manage'), validateRequest(createCommissionRuleSchema), commissionController.createRule);
router.put('/rules/:id', requirePermission('commissions:manage'), validateRequest(updateCommissionRuleSchema), commissionController.updateRule);
router.delete('/rules/:id', requirePermission('commissions:manage'), commissionController.deleteRule);

// Payouts
router.get('/payouts', requirePermission('commissions:view'), commissionController.listPayouts);
router.get('/payouts/:id', requirePermission('commissions:view'), commissionController.getPayoutById);
router.post('/payouts/calculate', requirePermission('commissions:manage'), commissionController.calculatePayouts);
router.patch('/payouts/:id/approve', requirePermission('commissions:manage'), commissionController.approvePayout);
router.patch('/payouts/:id/pay', requirePermission('commissions:manage'), commissionController.payPayout);

// Dashboard
router.get('/dashboard', requirePermission('commissions:view'), commissionController.getDashboard);

export default router;
