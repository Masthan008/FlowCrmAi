"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentRepository = exports.DepartmentRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class DepartmentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyDepartment);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.companyDepartment.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async findByType(companyId, type) {
        return db_1.prisma.companyDepartment.findMany({
            where: { companyId, type, deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
}
exports.DepartmentRepository = DepartmentRepository;
exports.departmentRepository = new DepartmentRepository();
