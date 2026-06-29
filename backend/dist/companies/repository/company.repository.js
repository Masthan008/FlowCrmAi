"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRepository = exports.CompanyRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
const companyInclude = {
    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
    parentCompany: { select: { id: true, name: true, companyNumber: true } },
};
class CompanyRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.company);
    }
    async getNextCompanyNumber() {
        const lastCompany = await db_1.prisma.company.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { companyNumber: true },
        });
        let nextNum = 1;
        if (lastCompany?.companyNumber) {
            const parts = lastCompany.companyNumber.split('-');
            const num = parseInt(parts[1], 10);
            if (!isNaN(num))
                nextNum = num + 1;
        }
        return `CMP-${String(nextNum).padStart(5, '0')}`;
    }
    async findByIdWithRelations(id) {
        return db_1.prisma.company.findFirst({
            where: { id, deletedAt: null },
            include: companyInclude,
        });
    }
    async paginateWithRelations(params) {
        const { page = 1, limit = 20, search, status, industry, country, state, owner, priority, rating, minRevenue, maxRevenue, minEmployees, maxEmployees, fromDate, toDate, myCompaniesOnly, customersOnly, partnersOnly, prospectsOnly, recentlyAdded, highRevenue, highPriority, archivedOnly, currentUserId, sortBy = 'createdAt', sortDir = 'desc', } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (myCompaniesOnly && currentUserId) {
            where.ownerId = currentUserId;
        }
        if (customersOnly)
            where.status = 'Customer';
        if (partnersOnly)
            where.status = 'Partner';
        if (prospectsOnly)
            where.status = 'Prospect';
        if (archivedOnly)
            where.status = 'Archived';
        if (highRevenue) {
            where.annualRevenue = { gte: 10000000 };
        }
        if (highPriority) {
            where.priority = 'High';
        }
        if (recentlyAdded) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            where.createdAt = { gte: thirtyDaysAgo };
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { legalName: { contains: search, mode: 'insensitive' } },
                { primaryEmail: { contains: search, mode: 'insensitive' } },
                { primaryPhone: { contains: search, mode: 'insensitive' } },
                { gstNumber: { contains: search, mode: 'insensitive' } },
                { registrationNumber: { contains: search, mode: 'insensitive' } },
                { website: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (industry)
            where.industry = industry;
        if (country)
            where.country = country;
        if (state)
            where.state = state;
        if (owner)
            where.ownerId = owner;
        if (priority)
            where.priority = priority;
        if (rating)
            where.rating = parseInt(rating);
        if (minRevenue || maxRevenue) {
            where.annualRevenue = {};
            if (minRevenue)
                where.annualRevenue.gte = minRevenue;
            if (maxRevenue)
                where.annualRevenue.lte = maxRevenue;
        }
        if (minEmployees || maxEmployees) {
            where.employeeCount = {};
            if (minEmployees)
                where.employeeCount.gte = minEmployees;
            if (maxEmployees)
                where.employeeCount.lte = maxEmployees;
        }
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate)
                where.createdAt.gte = new Date(fromDate);
            if (toDate)
                where.createdAt.lte = new Date(toDate);
        }
        const orderBy = {};
        orderBy[sortBy || 'createdAt'] = sortDir || 'desc';
        const [items, totalItems] = await Promise.all([
            db_1.prisma.company.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: companyInclude,
            }),
            db_1.prisma.company.count({ where }),
        ]);
        return {
            items,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            page,
            limit,
        };
    }
    async getStatistics(currentUserId) {
        const baseWhere = { deletedAt: null };
        const [total, customers, partners, prospects, highRevenue, active, inactive] = await Promise.all([
            db_1.prisma.company.count({ where: baseWhere }),
            db_1.prisma.company.count({ where: { ...baseWhere, status: 'Customer' } }),
            db_1.prisma.company.count({ where: { ...baseWhere, status: 'Partner' } }),
            db_1.prisma.company.count({ where: { ...baseWhere, status: 'Prospect' } }),
            db_1.prisma.company.count({ where: { ...baseWhere, annualRevenue: { gte: 10000000 } } }),
            db_1.prisma.company.count({ where: { ...baseWhere, status: { notIn: ['Inactive', 'Archived'] } } }),
            db_1.prisma.company.count({ where: { ...baseWhere, status: { in: ['Inactive', 'Archived'] } } }),
        ]);
        return { total, customers, partners, prospects, highRevenue, active, inactive };
    }
    async findEmployees() {
        return db_1.prisma.employee.findMany({
            where: { deletedAt: null },
            select: { id: true, firstName: true, lastName: true, email: true },
        });
    }
}
exports.CompanyRepository = CompanyRepository;
exports.companyRepository = new CompanyRepository();
