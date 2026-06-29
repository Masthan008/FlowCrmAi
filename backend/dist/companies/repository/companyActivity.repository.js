"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyActivityRepository = exports.CompanyActivityRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class CompanyActivityRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyActivity);
    }
    async findByFilters(companyId, filters) {
        const where = { companyId, deletedAt: null };
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.type)
            where.type = filters.type;
        if (filters.priority)
            where.priority = filters.priority;
        if (filters.status)
            where.status = filters.status;
        if (filters.createdBy)
            where.createdBy = filters.createdBy;
        if (filters.startDate || filters.endDate) {
            where.activityDate = {};
            if (filters.startDate)
                where.activityDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.activityDate.lte = new Date(filters.endDate);
        }
        return db_1.prisma.companyActivity.findMany({
            where,
            include: { assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { activityDate: 'desc' },
        });
    }
}
exports.CompanyActivityRepository = CompanyActivityRepository;
exports.companyActivityRepository = new CompanyActivityRepository();
