"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyFileRepository = exports.CompanyFileRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class CompanyFileRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyFile);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.companyFile.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStorageSummary(companyId) {
        const aggregate = await db_1.prisma.companyFile.aggregate({
            where: { companyId, deletedAt: null },
            _sum: { size: true },
            _count: { id: true },
        });
        return { totalSize: aggregate._sum.size || 0, fileCount: aggregate._count.id || 0 };
    }
}
exports.CompanyFileRepository = CompanyFileRepository;
exports.companyFileRepository = new CompanyFileRepository();
