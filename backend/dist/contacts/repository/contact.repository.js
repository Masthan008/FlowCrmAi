"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRepository = exports.ContactRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
const contactInclude = {
    company: { select: { id: true, name: true, website: true, primaryPhone: true, industry: true, status: true } },
    lead: { select: { id: true, leadNumber: true, firstName: true, lastName: true, fullName: true } },
    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
    customer: { select: { id: true, name: true, email: true, phone: true, type: true, status: true } },
};
class ContactRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.contact);
    }
    /**
     * Generate the next sequential contact number (CNT-00001, CNT-00002, ...)
     */
    async getNextContactNumber() {
        const lastContact = await db_1.prisma.contact.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { contactNumber: true },
        });
        let nextNum = 1;
        if (lastContact?.contactNumber) {
            const parts = lastContact.contactNumber.split('-');
            const num = parseInt(parts[1], 10);
            if (!isNaN(num))
                nextNum = num + 1;
        }
        return `CNT-${String(nextNum).padStart(5, '0')}`;
    }
    /**
     * Find contact by ID with all relations
     */
    async findByIdWithRelations(id) {
        return db_1.prisma.contact.findFirst({
            where: { id, deletedAt: null },
            include: contactInclude,
        });
    }
    /**
     * Server-side paginated list of contacts with filters, sorting, and search
     */
    async paginateWithRelations(params) {
        const { page = 1, limit = 20, search, status, owner, vip, recentlyAdded, customerOnly, partnerOnly, inactiveOnly, archivedOnly, myContactsOnly, currentUserId, companyId, sortBy = 'createdAt', sortDir = 'desc', } = params;
        const skip = (page - 1) * limit;
        // Build dynamic where clause
        const where = { deletedAt: null };
        // Standard Quick Filters
        if (vip) {
            where.status = 'VIP';
        }
        if (customerOnly) {
            where.status = 'Customer';
        }
        if (partnerOnly) {
            where.status = 'Partner';
        }
        if (inactiveOnly) {
            where.status = 'Inactive';
        }
        if (archivedOnly) {
            where.status = 'Archived';
        }
        if (myContactsOnly && currentUserId) {
            // Find employee associated with user
            const emp = await db_1.prisma.employee.findFirst({
                where: { userId: currentUserId, deletedAt: null },
            });
            if (emp) {
                where.ownerId = emp.id;
            }
            else {
                // Fallback to impossible owner so it returns empty list rather than exposing other users' contacts
                where.ownerId = '00000000-0000-0000-0000-000000000000';
            }
        }
        if (recentlyAdded) {
            // Added within last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            where.createdAt = { gte: sevenDaysAgo };
        }
        // Explicit Filter fields
        if (status && !vip && !customerOnly && !partnerOnly && !inactiveOnly && !archivedOnly) {
            where.status = status;
        }
        if (owner) {
            where.ownerId = owner;
        }
        if (companyId) {
            where.companyId = companyId;
        }
        // Search query
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { contactNumber: { contains: search, mode: 'insensitive' } },
                { jobTitle: { contains: search, mode: 'insensitive' } },
                { linkedin: { contains: search, mode: 'insensitive' } },
                { company: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        // Build orderBy
        const orderBy = {};
        const allowedSortFields = [
            'contactNumber', 'firstName', 'lastName', 'fullName', 'email', 'phone',
            'jobTitle', 'status', 'createdAt', 'updatedAt',
        ];
        if (allowedSortFields.includes(sortBy)) {
            orderBy[sortBy] = sortDir === 'asc' ? 'asc' : 'desc';
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [items, totalItems] = await Promise.all([
            db_1.prisma.contact.findMany({
                where,
                include: contactInclude,
                skip,
                take: limit,
                orderBy,
            }),
            db_1.prisma.contact.count({ where }),
        ]);
        return {
            items,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            page,
            limit,
        };
    }
    /**
     * Bulk status update
     */
    async bulkUpdateStatus(ids, status, updatedBy) {
        return db_1.prisma.contact.updateMany({
            where: {
                id: { in: ids },
                deletedAt: null,
            },
            data: {
                status,
                updatedBy,
            },
        });
    }
    /**
     * Bulk owner update
     */
    async bulkUpdateOwner(ids, ownerId, updatedBy) {
        return db_1.prisma.contact.updateMany({
            where: {
                id: { in: ids },
                deletedAt: null,
            },
            data: {
                ownerId,
                updatedBy,
            },
        });
    }
    /**
     * Get Contact Statistics
     */
    async getStatistics(currentUserId) {
        const baseWhere = { deletedAt: null };
        // Recently added within 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [totalContacts, activeContacts, vipContacts, customerContacts, partnerContacts, recentlyAdded] = await Promise.all([
            db_1.prisma.contact.count({ where: baseWhere }),
            db_1.prisma.contact.count({ where: { ...baseWhere, status: 'Active' } }),
            db_1.prisma.contact.count({ where: { ...baseWhere, status: 'VIP' } }),
            db_1.prisma.contact.count({ where: { ...baseWhere, status: 'Customer' } }),
            db_1.prisma.contact.count({ where: { ...baseWhere, status: 'Partner' } }),
            db_1.prisma.contact.count({ where: { ...baseWhere, createdAt: { gte: sevenDaysAgo } } }),
        ]);
        return {
            totalContacts,
            activeContacts,
            vipContacts,
            customerContacts,
            partnerContacts,
            recentlyAdded,
        };
    }
}
exports.ContactRepository = ContactRepository;
exports.contactRepository = new ContactRepository();
exports.default = exports.contactRepository;
