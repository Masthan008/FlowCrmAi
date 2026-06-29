"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadNoteRepository = exports.LeadNoteRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class LeadNoteRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.leadNote);
    }
    async findByLeadId(leadId) {
        return db_1.prisma.leadNote.findMany({
            where: { leadId, deletedAt: null },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
}
exports.LeadNoteRepository = LeadNoteRepository;
exports.leadNoteRepository = new LeadNoteRepository();
exports.default = exports.leadNoteRepository;
