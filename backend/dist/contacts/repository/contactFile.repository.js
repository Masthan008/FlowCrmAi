"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactFileRepository = exports.ContactFileRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class ContactFileRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.contactFile);
    }
    async findByContactId(contactId, search) {
        const where = { contactId, deletedAt: null };
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        return db_1.prisma.contactFile.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.ContactFileRepository = ContactFileRepository;
exports.contactFileRepository = new ContactFileRepository();
exports.default = exports.contactFileRepository;
