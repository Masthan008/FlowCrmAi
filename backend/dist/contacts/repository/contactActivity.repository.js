"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactActivityRepository = exports.ContactActivityRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class ContactActivityRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.contactActivity);
    }
    async findByContactId(contactId, params) {
        const { type, owner, status, priority, search } = params;
        const where = { contactId, deletedAt: null };
        if (type)
            where.type = type;
        if (owner)
            where.assignedToId = owner;
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        return db_1.prisma.contactActivity.findMany({
            where,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { activityDate: 'desc' },
        });
    }
}
exports.ContactActivityRepository = ContactActivityRepository;
exports.contactActivityRepository = new ContactActivityRepository();
exports.default = exports.contactActivityRepository;
