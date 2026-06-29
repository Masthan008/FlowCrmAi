"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadRepository = exports.LeadRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
// Relations to include when fetching leads
const leadInclude = {
    source: { select: { id: true, name: true } },
    status: { select: { id: true, name: true, color: true, order: true } },
    assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
};
class LeadRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.lead);
    }
    /**
     * Generate the next sequential lead number (LEAD-00001, LEAD-00002, ...)
     */
    async getNextLeadNumber() {
        const lastLead = await db_1.prisma.lead.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { leadNumber: true },
        });
        let nextNum = 1;
        if (lastLead?.leadNumber) {
            const parts = lastLead.leadNumber.split('-');
            const num = parseInt(parts[1], 10);
            if (!isNaN(num))
                nextNum = num + 1;
        }
        return `LEAD-${String(nextNum).padStart(5, '0')}`;
    }
    /**
     * Find a single lead with all relations
     */
    async findWithRelations(id) {
        return db_1.prisma.lead.findFirst({
            where: { id, deletedAt: null },
            include: leadInclude,
        });
    }
    /**
     * Server-side paginated listing with filters, sorting, and search
     */
    async paginateWithRelations(params) {
        const { page = 1, limit = 20, search, status, source, priority, owner, sortBy = 'createdAt', sortDir = 'desc', } = params;
        const skip = (page - 1) * limit;
        // Build dynamic where clause
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { leadNumber: { contains: search, mode: 'insensitive' } },
                { website: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.statusId = status;
        if (source)
            where.sourceId = source;
        if (priority)
            where.priority = priority;
        if (owner)
            where.assignedToId = owner;
        // Build orderBy
        const orderBy = {};
        const allowedSortFields = [
            'leadNumber', 'fullName', 'companyName', 'email', 'phone',
            'priority', 'value', 'createdAt', 'updatedAt', 'expectedClosingDate',
        ];
        if (allowedSortFields.includes(sortBy)) {
            orderBy[sortBy] = sortDir === 'asc' ? 'asc' : 'desc';
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [items, totalItems] = await Promise.all([
            db_1.prisma.lead.findMany({
                where,
                include: leadInclude,
                skip,
                take: limit,
                orderBy,
            }),
            db_1.prisma.lead.count({ where }),
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
     * Get aggregate statistics for leads
     */
    async getStatistics() {
        const baseWhere = { deletedAt: null };
        // Fetch all statuses to map names
        const statuses = await db_1.prisma.leadStatus.findMany({ select: { id: true, name: true } });
        const statusMap = new Map(statuses.map((s) => [s.name, s.id]));
        const [totalLeads, qualifiedLeads, wonLeads, lostLeads, totalValue,] = await Promise.all([
            db_1.prisma.lead.count({ where: baseWhere }),
            db_1.prisma.lead.count({
                where: { ...baseWhere, statusId: statusMap.get('Qualified') || undefined },
            }),
            db_1.prisma.lead.count({
                where: { ...baseWhere, statusId: statusMap.get('Won') || undefined },
            }),
            db_1.prisma.lead.count({
                where: { ...baseWhere, statusId: statusMap.get('Lost') || undefined },
            }),
            db_1.prisma.lead.aggregate({
                where: baseWhere,
                _avg: { value: true },
                _sum: { value: true },
            }),
        ]);
        const conversionRate = totalLeads > 0
            ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(2))
            : 0;
        return {
            totalLeads,
            qualifiedLeads,
            wonLeads,
            lostLeads,
            conversionRate,
            averageValue: totalValue._avg.value || 0,
            totalValue: totalValue._sum.value || 0,
        };
    }
    /**
     * Update lead status
     */
    async updateStatus(id, statusId, updatedBy) {
        return db_1.prisma.lead.update({
            where: { id },
            data: { statusId, updatedBy },
            include: leadInclude,
        });
    }
    /**
     * Update lead owner
     */
    async updateOwner(id, assignedToId, updatedBy) {
        return db_1.prisma.lead.update({
            where: { id },
            data: { assignedToId, updatedBy },
            include: leadInclude,
        });
    }
    /**
     * Update lead priority
     */
    async updatePriority(id, priority, updatedBy) {
        return db_1.prisma.lead.update({
            where: { id },
            data: { priority, updatedBy },
            include: leadInclude,
        });
    }
    /**
     * Update lead rating
     */
    async updateRating(id, rating, updatedBy) {
        return db_1.prisma.lead.update({
            where: { id },
            data: { rating, updatedBy },
            include: leadInclude,
        });
    }
    /**
     * Create a new lead with auto-generated lead number
     */
    async createLead(data) {
        const leadNumber = await this.getNextLeadNumber();
        return db_1.prisma.lead.create({
            data: {
                ...data,
                leadNumber,
                fullName: `${data.firstName} ${data.lastName}`,
            },
            include: leadInclude,
        });
    }
    /**
     * Update an existing lead
     */
    async updateLead(id, data) {
        const updateData = { ...data };
        if (data.firstName || data.lastName) {
            // Fetch current lead to compute full name if partial update
            const current = await db_1.prisma.lead.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
            if (current) {
                updateData.fullName = `${data.firstName || current.firstName} ${data.lastName || current.lastName}`;
            }
        }
        return db_1.prisma.lead.update({
            where: { id },
            data: updateData,
            include: leadInclude,
        });
    }
    /**
     * Get all lead sources
     */
    async getSources() {
        return db_1.prisma.leadSource.findMany({
            where: { deletedAt: null, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    /**
     * Get all lead statuses
     */
    async getStatuses() {
        return db_1.prisma.leadStatus.findMany({
            where: { deletedAt: null, isActive: true },
            orderBy: { order: 'asc' },
        });
    }
    /**
     * Get all assignable employees
     */
    /**
     * Global fuzzy search across all fields
     */
    async globalSearch(params) {
        const { query, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            archivedAt: null,
            OR: [
                { leadNumber: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } },
                { alternatePhone: { contains: query, mode: 'insensitive' } },
                { companyName: { contains: query, mode: 'insensitive' } },
                { website: { contains: query, mode: 'insensitive' } },
                { industry: { contains: query, mode: 'insensitive' } },
                { city: { contains: query, mode: 'insensitive' } },
                { state: { contains: query, mode: 'insensitive' } },
                { country: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { source: { name: { contains: query, mode: 'insensitive' } } },
                { status: { name: { contains: query, mode: 'insensitive' } } },
                { assignedTo: { firstName: { contains: query, mode: 'insensitive' } } },
                { assignedTo: { lastName: { contains: query, mode: 'insensitive' } } },
                { tagMappings: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } },
            ],
        };
        const [items, totalItems] = await Promise.all([
            db_1.prisma.lead.findMany({
                where,
                include: {
                    ...leadInclude,
                    tagMappings: { include: { tag: true } },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.lead.count({ where }),
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
     * Advanced query filter builder supporting AND/OR groups
     */
    async advancedFilter(params) {
        const { filters, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' } = params;
        const skip = (page - 1) * limit;
        const baseWhere = { deletedAt: null };
        // Build the query tree from custom builder rules
        if (filters && filters.rules && filters.rules.length > 0) {
            const condition = filters.condition === 'OR' ? 'OR' : 'AND';
            const clauses = filters.rules.map((rule) => {
                const { field, operator, value } = rule;
                const clause = {};
                // Special handlers
                if (field === 'tags') {
                    const tagsArr = Array.isArray(value) ? value : [value];
                    return {
                        tagMappings: {
                            some: {
                                tag: {
                                    name: { in: tagsArr, mode: 'insensitive' },
                                },
                            },
                        },
                    };
                }
                if (field === 'dateCreated' || field === 'dateUpdated' || field === 'expectedClosingDate') {
                    const mappedField = field === 'dateCreated' ? 'createdAt' : field === 'dateUpdated' ? 'updatedAt' : field;
                    if (operator === 'between' && Array.isArray(value)) {
                        return {
                            [mappedField]: {
                                gte: new Date(value[0]),
                                lte: new Date(value[1]),
                            },
                        };
                    }
                    if (operator === 'gte')
                        return { [mappedField]: { gte: new Date(value) } };
                    if (operator === 'lte')
                        return { [mappedField]: { lte: new Date(value) } };
                    return { [mappedField]: { equals: new Date(value) } };
                }
                // Standard operator parsing
                if (operator === 'equals') {
                    clause[field] = value;
                }
                else if (operator === 'contains') {
                    clause[field] = { contains: value, mode: 'insensitive' };
                }
                else if (operator === 'in') {
                    clause[field] = { in: Array.isArray(value) ? value : [value] };
                }
                else if (operator === 'gte') {
                    clause[field] = { gte: typeof value === 'string' ? parseFloat(value) : value };
                }
                else if (operator === 'lte') {
                    clause[field] = { lte: typeof value === 'string' ? parseFloat(value) : value };
                }
                return clause;
            });
            baseWhere[condition] = clauses;
        }
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortDir === 'asc' ? 'asc' : 'desc';
        }
        const [items, totalItems] = await Promise.all([
            db_1.prisma.lead.findMany({
                where: baseWhere,
                include: {
                    ...leadInclude,
                    tagMappings: { include: { tag: true } },
                },
                skip,
                take: limit,
                orderBy,
            }),
            db_1.prisma.lead.count({ where: baseWhere }),
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
     * Sync color-coded tags for a single lead record
     */
    async syncLeadTags(leadId, tagNames) {
        await db_1.prisma.leadTagMapping.deleteMany({ where: { leadId } });
        for (const name of tagNames) {
            const formattedName = name.trim();
            if (!formattedName)
                continue;
            // Upsert LeadTag
            const tag = await db_1.prisma.leadTag.upsert({
                where: { name: formattedName },
                update: {},
                create: {
                    name: formattedName,
                    color: this.getRandomColor(formattedName),
                },
            });
            await db_1.prisma.leadTagMapping.create({
                data: { leadId, tagId: tag.id },
            });
        }
    }
    getRandomColor(name) {
        const colors = ['#EF4444', '#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#64748B'];
        const hash = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }
    /**
     * Bulk modify status, priority, rating, owner, source, or industry
     */
    async bulkUpdate(params) {
        const { ids, statusId, priority, rating, assignedToId, sourceId, industry, tags, userId } = params;
        const data = { updatedBy: userId || 'system' };
        if (statusId)
            data.statusId = statusId;
        if (priority)
            data.priority = priority;
        if (rating !== undefined)
            data.rating = rating;
        if (assignedToId)
            data.assignedToId = assignedToId;
        if (sourceId)
            data.sourceId = sourceId;
        if (industry)
            data.industry = industry;
        await db_1.prisma.lead.updateMany({
            where: { id: { in: ids } },
            data,
        });
        if (tags && tags.length > 0) {
            for (const leadId of ids) {
                await this.syncLeadTags(leadId, tags);
            }
        }
    }
    /**
     * Soft-archive lead records instead of permanent deletes
     */
    async archiveLeads(ids, archivedBy) {
        return db_1.prisma.lead.updateMany({
            where: { id: { in: ids } },
            data: {
                archivedAt: new Date(),
                archivedBy,
            },
        });
    }
    /**
     * Restore soft-archived records
     */
    async restoreLeads(ids) {
        return db_1.prisma.lead.updateMany({
            where: { id: { in: ids } },
            data: {
                archivedAt: null,
                archivedBy: null,
            },
        });
    }
    /**
     * Merge secondary duplicates records into primary lead survivor
     */
    async mergeLeads(params) {
        const { primaryId, secondaryIds, fieldValues, userId } = params;
        // Update primary lead with chosen survivors fields values
        await db_1.prisma.lead.update({
            where: { id: primaryId },
            data: {
                ...fieldValues,
                updatedBy: userId,
            },
        });
        // Migrating notes, files, activities, and timeline history events to surviving primary lead
        await Promise.all([
            db_1.prisma.leadNote.updateMany({
                where: { leadId: { in: secondaryIds } },
                data: { leadId: primaryId },
            }),
            db_1.prisma.leadFile.updateMany({
                where: { leadId: { in: secondaryIds } },
                data: { leadId: primaryId },
            }),
            db_1.prisma.leadActivity.updateMany({
                where: { leadId: { in: secondaryIds } },
                data: { leadId: primaryId },
            }),
            db_1.prisma.leadTimeline.updateMany({
                where: { leadId: { in: secondaryIds } },
                data: { leadId: primaryId },
            }),
        ]);
        // Soft-delete secondary records
        await db_1.prisma.lead.updateMany({
            where: { id: { in: secondaryIds } },
            data: {
                deletedAt: new Date(),
                deletedBy: userId,
            },
        });
        // Save Merge history
        await db_1.prisma.leadMergeHistory.create({
            data: {
                primaryLeadId: primaryId,
                mergedLeadIds: secondaryIds,
                mergedDetails: fieldValues,
                createdBy: userId,
            },
        });
        // Log surviving timeline log
        await db_1.prisma.leadTimeline.create({
            data: {
                leadId: primaryId,
                type: 'LEAD_MERGED',
                title: 'Lead Merged',
                description: `Merged duplicate records: ${secondaryIds.join(', ')}`,
                createdBy: userId,
            },
        });
    }
    async getEmployees() {
        return db_1.prisma.employee.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
            orderBy: { firstName: 'asc' },
        });
    }
}
exports.LeadRepository = LeadRepository;
exports.leadRepository = new LeadRepository();
exports.default = exports.leadRepository;
