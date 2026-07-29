"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRepository = exports.ProjectRepository = void 0;
const db_1 = require("../../database/db");
class ProjectRepository {
    async findMany(params) {
        return db_1.prisma.project.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                owner: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.project.count({ where });
    }
    async findById(id) {
        return db_1.prisma.project.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.project.create({
            data,
            include: {
                owner: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.project.update({
            where: { id },
            data,
            include: {
                owner: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.project.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.ProjectRepository = ProjectRepository;
exports.projectRepository = new ProjectRepository();
exports.default = exports.projectRepository;
