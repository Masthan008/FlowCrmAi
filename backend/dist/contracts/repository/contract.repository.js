"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractRepository = exports.ContractRepository = void 0;
const db_1 = require("../../database/db");
class ContractRepository {
    async findMany(params) {
        return db_1.prisma.contract.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.contract.count({ where });
    }
    async findById(id) {
        return db_1.prisma.contract.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.contract.create({
            data,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.contract.update({
            where: { id },
            data,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.contract.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.ContractRepository = ContractRepository;
exports.contractRepository = new ContractRepository();
exports.default = exports.contractRepository;
