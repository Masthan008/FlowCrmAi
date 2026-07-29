"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataRequestRepository = exports.consentLogRepository = exports.DataRequestRepository = exports.ConsentLogRepository = void 0;
const db_1 = require("../../database/db");
class ConsentLogRepository {
    async findMany(params) {
        return db_1.prisma.consentLog.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                contact: {
                    select: { id: true, fullName: true, email: true },
                },
                company: {
                    select: { id: true, name: true, primaryEmail: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.consentLog.count({ where });
    }
    async findById(id) {
        return db_1.prisma.consentLog.findUnique({
            where: { id },
            include: {
                contact: {
                    select: { id: true, fullName: true, email: true },
                },
                company: {
                    select: { id: true, name: true, primaryEmail: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.consentLog.create({ data });
    }
    async update(id, data) {
        return db_1.prisma.consentLog.update({
            where: { id },
            data,
            include: {
                contact: {
                    select: { id: true, fullName: true, email: true },
                },
                company: {
                    select: { id: true, name: true, primaryEmail: true },
                },
            },
        });
    }
}
exports.ConsentLogRepository = ConsentLogRepository;
class DataRequestRepository {
    async findMany(params) {
        return db_1.prisma.dataRequest.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                contact: {
                    select: { id: true, fullName: true, email: true },
                },
                company: {
                    select: { id: true, name: true, primaryEmail: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.dataRequest.count({ where });
    }
    async findById(id) {
        return db_1.prisma.dataRequest.findUnique({
            where: { id },
            include: {
                contact: {
                    select: { id: true, fullName: true, email: true },
                },
                company: {
                    select: { id: true, name: true, primaryEmail: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.dataRequest.create({
            data,
            include: {
                contact: {
                    select: { id: true, fullName: true, email: true },
                },
                company: {
                    select: { id: true, name: true, primaryEmail: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.dataRequest.update({
            where: { id },
            data,
            include: {
                contact: {
                    select: { id: true, fullName: true, email: true },
                },
                company: {
                    select: { id: true, name: true, primaryEmail: true },
                },
            },
        });
    }
}
exports.DataRequestRepository = DataRequestRepository;
exports.consentLogRepository = new ConsentLogRepository();
exports.dataRequestRepository = new DataRequestRepository();
