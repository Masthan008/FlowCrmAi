"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetRepository = exports.AssetRepository = void 0;
const db_1 = require("../../database/db");
class AssetRepository {
    async findMany(params) {
        return db_1.prisma.asset.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                company: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.asset.count({ where });
    }
    async findById(id) {
        return db_1.prisma.asset.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                company: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.asset.create({
            data,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.asset.update({
            where: { id },
            data,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.asset.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.AssetRepository = AssetRepository;
exports.assetRepository = new AssetRepository();
exports.default = exports.assetRepository;
