"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseService = void 0;
const expense_repository_1 = require("../repository/expense.repository");
const db_1 = require("../../database/db");
exports.expenseService = {
    getExpenses: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.employeeId) {
            where.employeeId = params.employeeId;
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.categoryId) {
            where.categoryId = params.categoryId;
        }
        if (params.dateFrom || params.dateTo) {
            where.date = {};
            if (params.dateFrom)
                where.date.gte = new Date(params.dateFrom);
            if (params.dateTo)
                where.date.lte = new Date(params.dateTo);
        }
        const [items, total] = await Promise.all([
            expense_repository_1.expenseRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { date: 'desc' },
            }),
            expense_repository_1.expenseRepository.count(where),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },
    getExpenseById: async (id) => {
        const expense = await expense_repository_1.expenseRepository.findById(id);
        if (!expense || expense.deletedAt) {
            throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
        }
        return expense;
    },
    createExpense: async (data, userId) => {
        let empId = data.employeeId;
        if (!empId && userId) {
            const emp = await db_1.prisma.employee.findFirst({ where: { userId } });
            if (emp)
                empId = emp.id;
        }
        if (!empId) {
            const firstEmp = await db_1.prisma.employee.findFirst();
            if (firstEmp)
                empId = firstEmp.id;
        }
        if (!empId) {
            throw Object.assign(new Error('No employee found. Please add an employee first.'), { statusCode: 400 });
        }
        if (data.categoryId) {
            const category = await db_1.prisma.expenseCategory.findUnique({ where: { id: data.categoryId } });
            if (!category) {
                data.categoryId = null;
            }
        }
        const dateObj = data.date ? new Date(data.date) : new Date();
        return expense_repository_1.expenseRepository.create({
            employeeId: empId,
            categoryId: data.categoryId || null,
            amount: Number(data.amount),
            currency: data.currency || 'USD',
            description: data.description || data.title || null,
            date: isNaN(dateObj.getTime()) ? new Date() : dateObj,
            receiptUrl: data.receiptUrl || null,
            dealId: data.dealId || null,
            projectId: data.projectId || null,
            billable: data.billable ?? false,
            taxRelevant: data.taxRelevant ?? false,
            tags: data.tags || [],
            createdBy: userId || null,
        });
    },
    updateExpense: async (id, data, userId) => {
        const existing = await expense_repository_1.expenseRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.date)
            updateData.date = new Date(data.date);
        return expense_repository_1.expenseRepository.update(id, updateData);
    },
    deleteExpense: async (id, userId) => {
        const existing = await expense_repository_1.expenseRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
        }
        return expense_repository_1.expenseRepository.softDelete(id, userId);
    },
    approveExpense: async (id, userId) => {
        const existing = await expense_repository_1.expenseRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
        }
        if (existing.status !== 'Pending') {
            throw Object.assign(new Error('Only pending expenses can be approved'), { statusCode: 400 });
        }
        return expense_repository_1.expenseRepository.update(id, {
            status: 'Approved',
            approvedById: userId || null,
            approvedAt: new Date(),
            updatedBy: userId || null,
        });
    },
    reimburseExpense: async (id, userId) => {
        const existing = await expense_repository_1.expenseRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
        }
        if (existing.status !== 'Approved') {
            throw Object.assign(new Error('Only approved expenses can be reimbursed'), { statusCode: 400 });
        }
        return expense_repository_1.expenseRepository.update(id, {
            status: 'Reimbursed',
            updatedBy: userId || null,
        });
    },
    rejectExpense: async (id, userId) => {
        const existing = await expense_repository_1.expenseRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
        }
        if (existing.status !== 'Pending') {
            throw Object.assign(new Error('Only pending expenses can be rejected'), { statusCode: 400 });
        }
        return expense_repository_1.expenseRepository.update(id, {
            status: 'Rejected',
            updatedBy: userId || null,
        });
    },
    getCategories: async () => {
        return db_1.prisma.expenseCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { expenses: true } },
            },
        });
    },
    createCategory: async (data, userId) => {
        const existing = await db_1.prisma.expenseCategory.findUnique({ where: { name: data.name } });
        if (existing) {
            throw Object.assign(new Error('Category already exists'), { statusCode: 409 });
        }
        return db_1.prisma.expenseCategory.create({
            data: { ...data, createdBy: userId || null },
        });
    },
    updateCategory: async (id, data, userId) => {
        const existing = await db_1.prisma.expenseCategory.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Category not found'), { statusCode: 404 });
        }
        return db_1.prisma.expenseCategory.update({
            where: { id },
            data: { ...data, updatedBy: userId || null },
        });
    },
    deleteCategory: async (id, userId) => {
        const existing = await db_1.prisma.expenseCategory.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Category not found'), { statusCode: 404 });
        }
        return db_1.prisma.expenseCategory.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
    getStatistics: async () => {
        const [byCategory, byStatus, total] = await Promise.all([
            db_1.prisma.expense.groupBy({
                by: ['categoryId'],
                where: { deletedAt: null },
                _sum: { amount: true },
                _count: true,
            }),
            db_1.prisma.expense.groupBy({
                by: ['status'],
                where: { deletedAt: null },
                _sum: { amount: true },
                _count: true,
            }),
            db_1.prisma.expense.aggregate({
                where: { deletedAt: null },
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        return { byCategory, byStatus, total };
    },
};
exports.default = exports.expenseService;
