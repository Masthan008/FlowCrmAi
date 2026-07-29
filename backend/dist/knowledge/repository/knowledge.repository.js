"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeRepository = exports.KnowledgeRepository = void 0;
const db_1 = require("../../database/db");
class KnowledgeRepository {
    async findMany(params) {
        return db_1.prisma.knowledgeArticle.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.knowledgeArticle.count({ where });
    }
    async findById(id) {
        return db_1.prisma.knowledgeArticle.findUnique({
            where: { id },
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.knowledgeArticle.create({
            data,
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.knowledgeArticle.update({
            where: { id },
            data,
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.knowledgeArticle.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.KnowledgeRepository = KnowledgeRepository;
exports.knowledgeRepository = new KnowledgeRepository();
exports.default = exports.knowledgeRepository;
