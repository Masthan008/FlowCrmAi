"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactHistoryRepository = exports.ContactHistoryRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class ContactHistoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.contactHistory);
    }
    async findByContactId(contactId, search) {
        const where = { contactId, deletedAt: null };
        if (search) {
            where.OR = [
                { action: { contains: search, mode: 'insensitive' } },
                { fieldName: { contains: search, mode: 'insensitive' } },
                { oldValue: { contains: search, mode: 'insensitive' } },
                { newValue: { contains: search, mode: 'insensitive' } },
            ];
        }
        return db_1.prisma.contactHistory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async logChange(params) {
        return db_1.prisma.contactHistory.create({
            data: {
                contactId: params.contactId,
                action: params.action,
                fieldName: params.fieldName || null,
                oldValue: params.oldValue || null,
                newValue: params.newValue || null,
                userId: params.userId || null,
                createdBy: params.createdBy || 'system',
            },
        });
    }
}
exports.ContactHistoryRepository = ContactHistoryRepository;
exports.contactHistoryRepository = new ContactHistoryRepository();
exports.default = exports.contactHistoryRepository;
