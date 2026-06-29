"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactNoteRepository = exports.ContactNoteRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class ContactNoteRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.contactNote);
    }
    async findByContactId(contactId, search) {
        const where = { contactId, deletedAt: null };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }
        return db_1.prisma.contactNote.findMany({
            where,
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
}
exports.ContactNoteRepository = ContactNoteRepository;
exports.contactNoteRepository = new ContactNoteRepository();
exports.default = exports.contactNoteRepository;
