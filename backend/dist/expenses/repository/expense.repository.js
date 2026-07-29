"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRepository = exports.ExpenseRepository = void 0;
const db_1 = require("../../database/db");
class ExpenseRepository {
    async findMany(params) {
        return db_1.prisma.expense.findMany({
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
    async count(where) {
        return db_1.prisma.expense.count({ where });
    }
    async findById(id) {
        return db_1.prisma.expense.findUnique({
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
    async create(data) {
        return db_1.prisma.expense.create({
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
    async update(id, data) {
        return db_1.prisma.expense.update({
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
    async softDelete(id, userId) {
        return db_1.prisma.expense.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.ExpenseRepository = ExpenseRepository;
exports.expenseRepository = new ExpenseRepository();
exports.default = exports.expenseRepository;
