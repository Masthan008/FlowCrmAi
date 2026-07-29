"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalUserRepository = exports.PortalUserRepository = void 0;
const db_1 = require("../../database/db");
class PortalUserRepository {
    async findMany(params) {
        return db_1.prisma.portalUser.findMany({
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
        return db_1.prisma.portalUser.count({ where });
    }
    async findById(id) {
        return db_1.prisma.portalUser.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async findByEmail(email) {
        return db_1.prisma.portalUser.findUnique({
            where: { email },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.portalUser.create({
            data,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.portalUser.update({
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
        return db_1.prisma.portalUser.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.PortalUserRepository = PortalUserRepository;
exports.portalUserRepository = new PortalUserRepository();
exports.default = exports.portalUserRepository;
