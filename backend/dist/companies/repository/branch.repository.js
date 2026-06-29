"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRepository = exports.BranchRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class BranchRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.branch);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.branch.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByIdWithCompany(id) {
        return db_1.prisma.branch.findFirst({
            where: { id, deletedAt: null },
            include: { company: true },
        });
    }
}
exports.BranchRepository = BranchRepository;
exports.branchRepository = new BranchRepository();
