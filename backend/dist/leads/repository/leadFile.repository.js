"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadFileRepository = exports.LeadFileRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class LeadFileRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.leadFile);
    }
    async findByLeadId(leadId) {
        return db_1.prisma.leadFile.findMany({
            where: { leadId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStorageSummary(leadId) {
        const aggregate = await db_1.prisma.leadFile.aggregate({
            where: { leadId, deletedAt: null },
            _sum: { size: true },
            _count: { id: true },
        });
        return {
            totalSize: aggregate._sum.size || 0,
            fileCount: aggregate._count.id || 0,
        };
    }
}
exports.LeadFileRepository = LeadFileRepository;
exports.leadFileRepository = new LeadFileRepository();
exports.default = exports.leadFileRepository;
