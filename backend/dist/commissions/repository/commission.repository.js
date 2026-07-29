"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionPayoutRepository = exports.commissionRuleRepository = exports.CommissionPayoutRepository = exports.CommissionRuleRepository = void 0;
const db_1 = require("../../database/db");
class CommissionRuleRepository {
    async findMany(params) {
        return db_1.prisma.commissionRule.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                _count: { select: { payouts: true } },
            },
        });
    }
    async count(where) {
        return db_1.prisma.commissionRule.count({ where });
    }
    async findById(id) {
        return db_1.prisma.commissionRule.findUnique({
            where: { id },
            include: {
                _count: { select: { payouts: true } },
            },
        });
    }
    async create(data) {
        return db_1.prisma.commissionRule.create({ data });
    }
    async update(id, data) {
        return db_1.prisma.commissionRule.update({ where: { id }, data });
    }
    async softDelete(id, userId) {
        return db_1.prisma.commissionRule.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    }
}
exports.CommissionRuleRepository = CommissionRuleRepository;
class CommissionPayoutRepository {
    async findMany(params) {
        return db_1.prisma.commissionPayout.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                rule: { select: { id: true, name: true, type: true, rate: true } },
                employee: { select: { id: true, firstName: true, lastName: true, email: true } },
                deal: { select: { id: true, name: true, value: true } },
                invoice: { select: { id: true, number: true, total: true } },
            },
        });
    }
    async count(where) {
        return db_1.prisma.commissionPayout.count({ where });
    }
    async findById(id) {
        return db_1.prisma.commissionPayout.findUnique({
            where: { id },
            include: {
                rule: { select: { id: true, name: true, type: true, rate: true } },
                employee: { select: { id: true, firstName: true, lastName: true, email: true } },
                deal: { select: { id: true, name: true, value: true } },
                invoice: { select: { id: true, number: true, total: true } },
            },
        });
    }
    async create(data) {
        return db_1.prisma.commissionPayout.create({
            data,
            include: {
                rule: { select: { id: true, name: true, type: true, rate: true } },
                employee: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.commissionPayout.update({
            where: { id },
            data,
            include: {
                rule: { select: { id: true, name: true, type: true, rate: true } },
                employee: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }
}
exports.CommissionPayoutRepository = CommissionPayoutRepository;
exports.commissionRuleRepository = new CommissionRuleRepository();
exports.commissionPayoutRepository = new CommissionPayoutRepository();
