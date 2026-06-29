"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hierarchyRepository = exports.HierarchyRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class HierarchyRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyHierarchy);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.companyHierarchy.findMany({
            where: { companyId, deletedAt: null },
            include: {
                parentCompany: { select: { id: true, name: true, companyNumber: true, status: true } },
            },
            orderBy: { level: 'asc' },
        });
    }
    async findTree(companyId) {
        const allEntries = await db_1.prisma.companyHierarchy.findMany({
            where: { deletedAt: null },
            include: {
                company: { select: { id: true, name: true, companyNumber: true, status: true, industry: true } },
                parentCompany: { select: { id: true, name: true, companyNumber: true, status: true } },
            },
            orderBy: { level: 'asc' },
        });
        const roots = allEntries.filter(e => !e.parentCompanyId && e.companyId === companyId);
        const buildTree = (parentId, level) => {
            return allEntries
                .filter(e => e.parentCompanyId === parentId && e.level === level + 1)
                .map(e => ({ ...e, children: buildTree(e.companyId, e.level) }));
        };
        return roots.map(r => ({ ...r, children: buildTree(r.companyId, r.level) }));
    }
}
exports.HierarchyRepository = HierarchyRepository;
exports.hierarchyRepository = new HierarchyRepository();
