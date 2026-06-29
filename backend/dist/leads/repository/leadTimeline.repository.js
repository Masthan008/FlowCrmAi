"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadTimelineRepository = exports.LeadTimelineRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class LeadTimelineRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.leadTimeline);
    }
    async findByLeadId(leadId, filters) {
        const where = {
            leadId,
            deletedAt: null,
        };
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.startDate || filters.endDate) {
            where.eventDate = {};
            if (filters.startDate) {
                where.eventDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.eventDate.lte = new Date(filters.endDate);
            }
        }
        return db_1.prisma.leadTimeline.findMany({
            where,
            orderBy: { eventDate: 'desc' },
        });
    }
    async logEvent(data) {
        return db_1.prisma.leadTimeline.create({
            data: {
                leadId: data.leadId,
                type: data.type,
                title: data.title,
                description: data.description || null,
                icon: data.icon || null,
                color: data.color || null,
                createdBy: data.createdBy || null,
            },
        });
    }
}
exports.LeadTimelineRepository = LeadTimelineRepository;
exports.leadTimelineRepository = new LeadTimelineRepository();
exports.default = exports.leadTimelineRepository;
