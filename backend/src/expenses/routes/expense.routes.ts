import { Router } from 'express';
import { expenseController } from '../controller/expense.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import {
  createExpenseSchema,
  updateExpenseSchema,
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from '../validators/expense.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('expenses:view'), expenseController.list);
router.get('/:id', requirePermission('expenses:view'), expenseController.getById);
router.post('/', requirePermission('expenses:create'), validateRequest(createExpenseSchema), expenseController.create);
router.put('/:id', requirePermission('expenses:edit'), validateRequest(updateExpenseSchema), expenseController.update);
router.delete('/:id', requirePermission('expenses:delete'), expenseController.delete);
router.patch('/:id/approve', requirePermission('expenses:edit'), expenseController.approve);
router.patch('/:id/reimburse', requirePermission('expenses:edit'), expenseController.reimburse);
router.patch('/:id/reject', requirePermission('expenses:edit'), expenseController.reject);
router.get('/categories', requirePermission('expenses:view'), expenseController.listCategories);
router.post('/categories', requirePermission('expenses:create'), validateRequest(createExpenseCategorySchema), expenseController.createCategory);
router.put('/categories/:id', requirePermission('expenses:edit'), validateRequest(updateExpenseCategorySchema), expenseController.updateCategory);
router.delete('/categories/:id', requirePermission('expenses:delete'), expenseController.deleteCategory);
router.get('/statistics', requirePermission('expenses:view'), expenseController.getStatistics);

export default router;
