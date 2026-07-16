import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class ExpenseRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ExpenseWhereInput;
    orderBy?: Prisma.ExpenseOrderByWithRelationInput;
  }) {
    return prisma.expense.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        deal: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async count(where?: Prisma.ExpenseWhereInput) {
    return prisma.expense.count({ where });
  }

  async findById(id: string) {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        deal: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async create(data: Prisma.ExpenseUncheckedCreateInput) {
    return prisma.expense.create({
      data,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ExpenseUncheckedUpdateInput) {
    return prisma.expense.update({
      where: { id },
      data,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const expenseRepository = new ExpenseRepository();
export default expenseRepository;
