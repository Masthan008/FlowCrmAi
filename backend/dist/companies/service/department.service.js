"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = void 0;
const department_repository_1 = require("../repository/department.repository");
const companyTimeline_service_1 = require("./companyTimeline.service");
exports.departmentService = {
    getDepartments: async (companyId) => {
        return department_repository_1.departmentRepository.findByCompanyId(companyId);
    },
    createDepartment: async (companyId, data, userId) => {
        const dept = await department_repository_1.departmentRepository.create({
            companyId,
            name: data.name,
            type: data.type || 'Custom',
            managerId: data.managerId || null,
            description: data.description || null,
            revenue: data.revenue || 0,
            status: data.status || 'Active',
            employeeCount: data.employeeCount || 0,
            createdBy: userId || null,
        });
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId,
            type: 'DEPARTMENT_CREATED',
            title: `Department Created: ${data.name}`,
            description: `New ${data.type || 'department'} added`,
            icon: 'Layers',
            color: '#3B82F6',
            createdBy: userId || 'system',
        });
        return dept;
    },
    updateDepartment: async (deptId, data, companyId, userId) => {
        const existing = await department_repository_1.departmentRepository.findById(deptId);
        if (!existing)
            throw Object.assign(new Error('Department not found'), { statusCode: 404 });
        const updated = await department_repository_1.departmentRepository.update(deptId, {
            name: data.name !== undefined ? data.name : existing.name,
            type: data.type !== undefined ? data.type : existing.type,
            managerId: data.managerId !== undefined ? data.managerId : existing.managerId,
            description: data.description !== undefined ? data.description : existing.description,
            revenue: data.revenue !== undefined ? data.revenue : existing.revenue,
            status: data.status !== undefined ? data.status : existing.status,
            employeeCount: data.employeeCount !== undefined ? data.employeeCount : existing.employeeCount,
            updatedBy: userId || null,
        });
        return updated;
    },
    deleteDepartment: async (deptId, companyId, userId) => {
        const existing = await department_repository_1.departmentRepository.findById(deptId);
        if (!existing)
            throw Object.assign(new Error('Department not found'), { statusCode: 404 });
        await department_repository_1.departmentRepository.softDelete(deptId, userId || null);
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId,
            type: 'DEPARTMENT_DELETED',
            title: `Department Deleted: ${existing.name}`,
            description: 'Department removed',
            icon: 'Layers',
            color: '#EF4444',
            createdBy: userId || 'system',
        });
    },
};
