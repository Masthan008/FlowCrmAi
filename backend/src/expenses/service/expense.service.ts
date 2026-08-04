import { expenseRepository } from '../repository/expense.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const expenseService = {
  getExpenses: async (params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {
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
      if (params.dateFrom) where.date.gte = new Date(params.dateFrom);
      if (params.dateTo) where.date.lte = new Date(params.dateTo);
    }

    const [items, total] = await Promise.all([
      expenseRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { date: 'desc' },
      }),
      expenseRepository.count(where),
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

  getExpenseById: async (id: string) => {
    const expense = await expenseRepository.findById(id);
    if (!expense || expense.deletedAt) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }
    return expense;
  },

  createExpense: async (
    data: {
      title?: string | null;
      employeeId?: string | null;
      employeeName?: string | null;
      category?: string | null;
      categoryId?: string | null;
      amount: number;
      currency?: string;
      description?: string | null;
      date?: string | null;
      receiptUrl?: string | null;
      dealId?: string | null;
      projectId?: string | null;
      billable?: boolean;
      taxRelevant?: boolean;
      tags?: string[];
    },
    userId?: string
  ) => {
    let empId = data.employeeId;
    if (!empId && userId) {
      const emp = await prisma.employee.findFirst({ where: { userId } });
      if (emp) empId = emp.id;
    }
    if (!empId) {
      const firstEmp = await prisma.employee.findFirst();
      if (firstEmp) empId = firstEmp.id;
    }
    if (!empId) {
      throw Object.assign(new Error('No employee found. Please add an employee first.'), { statusCode: 400 });
    }

    if (data.categoryId) {
      const category = await prisma.expenseCategory.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        data.categoryId = null;
      }
    }

    const dateObj = data.date ? new Date(data.date) : new Date();

    return expenseRepository.create({
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

  updateExpense: async (
    id: string,
    data: Partial<{
      employeeId: string;
      categoryId: string | null;
      amount: number;
      currency: string;
      description: string | null;
      date: string;
      receiptUrl: string | null;
      dealId: string | null;
      projectId: string | null;
      billable: boolean;
      taxRelevant: boolean;
      tags: string[];
    }>,
    userId?: string
  ) => {
    const existing = await expenseRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    if (data.date) updateData.date = new Date(data.date);

    return expenseRepository.update(id, updateData);
  },

  deleteExpense: async (id: string, userId?: string) => {
    const existing = await expenseRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }
    return expenseRepository.softDelete(id, userId);
  },

  approveExpense: async (id: string, userId?: string) => {
    const existing = await expenseRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }
    if (existing.status !== 'Pending') {
      throw Object.assign(new Error('Only pending expenses can be approved'), { statusCode: 400 });
    }
    return expenseRepository.update(id, {
      status: 'Approved',
      approvedById: userId || null,
      approvedAt: new Date(),
      updatedBy: userId || null,
    });
  },

  reimburseExpense: async (id: string, userId?: string) => {
    const existing = await expenseRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }
    if (existing.status !== 'Approved') {
      throw Object.assign(new Error('Only approved expenses can be reimbursed'), { statusCode: 400 });
    }
    return expenseRepository.update(id, {
      status: 'Reimbursed',
      updatedBy: userId || null,
    });
  },

  rejectExpense: async (id: string, userId?: string) => {
    const existing = await expenseRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }
    if (existing.status !== 'Pending') {
      throw Object.assign(new Error('Only pending expenses can be rejected'), { statusCode: 400 });
    }
    return expenseRepository.update(id, {
      status: 'Rejected',
      updatedBy: userId || null,
    });
  },

  getCategories: async () => {
    return prisma.expenseCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { expenses: true } },
      },
    });
  },

  createCategory: async (data: { name: string; description?: string | null; icon?: string | null }, userId?: string) => {
    const existing = await prisma.expenseCategory.findUnique({ where: { name: data.name } });
    if (existing) {
      throw Object.assign(new Error('Category already exists'), { statusCode: 409 });
    }
    return prisma.expenseCategory.create({
      data: { ...data, createdBy: userId || null },
    });
  },

  updateCategory: async (id: string, data: Partial<{ name: string; description: string | null; icon: string | null; isActive: boolean }>, userId?: string) => {
    const existing = await prisma.expenseCategory.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    }
    return prisma.expenseCategory.update({
      where: { id },
      data: { ...data, updatedBy: userId || null },
    });
  },

  deleteCategory: async (id: string, userId?: string) => {
    const existing = await prisma.expenseCategory.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    }
    return prisma.expenseCategory.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },

  getStatistics: async () => {
    const [byCategory, byStatus, total] = await Promise.all([
      prisma.expense.groupBy({
        by: ['categoryId'],
        where: { deletedAt: null },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { deletedAt: null },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return { byCategory, byStatus, total };
  },
};

export default expenseService;
