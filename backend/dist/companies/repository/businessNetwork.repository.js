"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessNetworkRepository = exports.BusinessNetworkRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class BusinessNetworkRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyBusinessNetwork);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.companyBusinessNetwork.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async findByType(companyId, type) {
        return db_1.prisma.companyBusinessNetwork.findMany({
            where: { companyId, relationshipType: type, deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async getGroupedByType(companyId) {
        const all = await this.findByCompanyId(companyId);
        const grouped = {};
        for (const item of all) {
            if (!grouped[item.relationshipType])
                grouped[item.relationshipType] = [];
            grouped[item.relationshipType].push(item);
        }
        return grouped;
    }
}
exports.BusinessNetworkRepository = BusinessNetworkRepository;
exports.businessNetworkRepository = new BusinessNetworkRepository();
