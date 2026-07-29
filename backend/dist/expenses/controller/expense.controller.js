"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseController = void 0;
const expense_service_1 = require("../service/expense.service");
const response_1 = require("../../helpers/response");
exports.expenseController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const employeeId = req.query.employeeId;
            const status = req.query.status;
            const dateFrom = req.query.dateFrom;
            const dateTo = req.query.dateTo;
            const categoryId = req.query.categoryId;
            const result = await expense_service_1.expenseService.getExpenses({ page, limit, employeeId, status, dateFrom, dateTo, categoryId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expenses retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const expense = await expense_service_1.expenseService.getExpenseById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense details retrieved successfully.', expense);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const expense = await expense_service_1.expenseService.createExpense(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Expense created successfully.', expense);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const expense = await expense_service_1.expenseService.updateExpense(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense updated successfully.', expense);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await expense_service_1.expenseService.deleteExpense(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    approve: async (req, res, next) => {
        try {
            const expense = await expense_service_1.expenseService.approveExpense(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense approved successfully.', expense);
        }
        catch (error) {
            next(error);
        }
    },
    reimburse: async (req, res, next) => {
        try {
            const expense = await expense_service_1.expenseService.reimburseExpense(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense reimbursed successfully.', expense);
        }
        catch (error) {
            next(error);
        }
    },
    reject: async (req, res, next) => {
        try {
            const expense = await expense_service_1.expenseService.rejectExpense(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense rejected successfully.', expense);
        }
        catch (error) {
            next(error);
        }
    },
    listCategories: async (req, res, next) => {
        try {
            const categories = await expense_service_1.expenseService.getCategories();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense categories retrieved successfully.', categories);
        }
        catch (error) {
            next(error);
        }
    },
    createCategory: async (req, res, next) => {
        try {
            const category = await expense_service_1.expenseService.createCategory(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Expense category created successfully.', category);
        }
        catch (error) {
            next(error);
        }
    },
    updateCategory: async (req, res, next) => {
        try {
            const category = await expense_service_1.expenseService.updateCategory(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense category updated successfully.', category);
        }
        catch (error) {
            next(error);
        }
    },
    deleteCategory: async (req, res, next) => {
        try {
            await expense_service_1.expenseService.deleteCategory(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense category deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getStatistics: async (req, res, next) => {
        try {
            const stats = await expense_service_1.expenseService.getStatistics();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Expense statistics retrieved successfully.', stats);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.expenseController;
