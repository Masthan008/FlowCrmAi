"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyHistoryRepository = exports.CompanyHistoryRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class CompanyHistoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyHistory);
    }
    async findByCompanyId(companyId, filters) {
        const where = { companyId, deletedAt: null };
        if (filters.search) {
            where.OR = [
                { action: { contains: filters.search, mode: 'insensitive' } },
                { fieldName: { contains: filters.search, mode: 'insensitive' } },
                { oldValue: { contains: filters.search, mode: 'insensitive' } },
                { newValue: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return db_1.prisma.companyHistory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async logChange(data) {
        return db_1.prisma.companyHistory.create({
            data: {
                companyId: data.companyId, action: data.action,
                fieldName: data.fieldName || null, oldValue: data.oldValue || null,
                newValue: data.newValue || null, userId: data.userId || null,
                createdBy: data.createdBy || null,
            },
        });
    }
}
exports.CompanyHistoryRepository = CompanyHistoryRepository;
exports.companyHistoryRepository = new CompanyHistoryRepository();
