"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyNoteRepository = exports.CompanyNoteRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class CompanyNoteRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyNote);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.companyNote.findMany({
            where: { companyId, deletedAt: null },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });
    }
}
exports.CompanyNoteRepository = CompanyNoteRepository;
exports.companyNoteRepository = new CompanyNoteRepository();
