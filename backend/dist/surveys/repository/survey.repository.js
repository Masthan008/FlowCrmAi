"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyRepository = exports.SurveyRepository = void 0;
const db_1 = require("../../database/db");
class SurveyRepository {
    async findMany(params) {
        return db_1.prisma.survey.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                template: {
                    select: { id: true, name: true, subject: true },
                },
                _count: {
                    select: { responses: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.survey.count({ where });
    }
    async findById(id) {
        return db_1.prisma.survey.findUnique({
            where: { id },
            include: {
                template: {
                    select: { id: true, name: true, subject: true },
                },
                _count: {
                    select: { responses: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.survey.create({
            data,
            include: {
                template: {
                    select: { id: true, name: true, subject: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.survey.update({
            where: { id },
            data,
            include: {
                template: {
                    select: { id: true, name: true, subject: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.survey.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.SurveyRepository = SurveyRepository;
exports.surveyRepository = new SurveyRepository();
exports.default = exports.surveyRepository;
