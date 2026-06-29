"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactTimelineRepository = exports.ContactTimelineRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class ContactTimelineRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.contactTimeline);
    }
    async findByContactId(contactId, search) {
        const where = { contactId, deletedAt: null };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        return db_1.prisma.contactTimeline.findMany({
            where,
            orderBy: { eventDate: 'desc' },
        });
    }
}
exports.ContactTimelineRepository = ContactTimelineRepository;
exports.contactTimelineRepository = new ContactTimelineRepository();
exports.default = exports.contactTimelineRepository;
