import { Request, Response, NextFunction } from 'express';
import { expenseService } from '../service/expense.service';
import { ResponseHelper } from '../../helpers/response';

export const expenseController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const employeeId = req.query.employeeId as string;
      const status = req.query.status as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const categoryId = req.query.categoryId as string;

      const result = await expenseService.getExpenses({ page, limit, employeeId, status, dateFrom, dateTo, categoryId });
      ResponseHelper.sendSuccess(req, res, 200, 'Expenses retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.getExpenseById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense details retrieved successfully.', expense);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.createExpense(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Expense created successfully.', expense);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.updateExpense(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense updated successfully.', expense);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await expenseService.deleteExpense(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense deleted successfully.');
    } catch (error) { next(error); }
  },

  approve: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.approveExpense(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense approved successfully.', expense);
    } catch (error) { next(error); }
  },

  reimburse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.reimburseExpense(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense reimbursed successfully.', expense);
    } catch (error) { next(error); }
  },

  reject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.rejectExpense(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense rejected successfully.', expense);
    } catch (error) { next(error); }
  },

  listCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await expenseService.getCategories();
      ResponseHelper.sendSuccess(req, res, 200, 'Expense categories retrieved successfully.', categories);
    } catch (error) { next(error); }
  },

  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await expenseService.createCategory(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Expense category created successfully.', category);
    } catch (error) { next(error); }
  },

  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await expenseService.updateCategory(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense category updated successfully.', category);
    } catch (error) { next(error); }
  },

  deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await expenseService.deleteCategory(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Expense category deleted successfully.');
    } catch (error) { next(error); }
  },

  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await expenseService.getStatistics();
      ResponseHelper.sendSuccess(req, res, 200, 'Expense statistics retrieved successfully.', stats);
    } catch (error) { next(error); }
  },
};

export default expenseController;
