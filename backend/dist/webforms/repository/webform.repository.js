"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webFormRepository = exports.WebFormRepository = void 0;
const db_1 = require("../../database/db");
class WebFormRepository {
    async findMany(params) {
        return db_1.prisma.webForm.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                assignTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                source: {
                    select: { id: true, name: true },
                },
                status: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { submissions: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.webForm.count({ where });
    }
    async findById(id) {
        return db_1.prisma.webForm.findUnique({
            where: { id },
            include: {
                assignTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                source: {
                    select: { id: true, name: true },
                },
                status: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { submissions: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.webForm.create({
            data,
            include: {
                assignTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                source: {
                    select: { id: true, name: true },
                },
                status: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.webForm.update({
            where: { id },
            data,
            include: {
                assignTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                source: {
                    select: { id: true, name: true },
                },
                status: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.webForm.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.WebFormRepository = WebFormRepository;
exports.webFormRepository = new WebFormRepository();
exports.default = exports.webFormRepository;
