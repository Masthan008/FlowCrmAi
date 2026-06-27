import { departmentRepository } from '../repository/department.repository';
import { companyTimelineService } from './companyTimeline.service';

export const departmentService = {
  getDepartments: async (companyId: string) => {
    return departmentRepository.findByCompanyId(companyId);
  },

  createDepartment: async (companyId: string, data: any, userId?: string) => {
    const dept = await departmentRepository.create({
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

    await companyTimelineService.logEvent({
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

  updateDepartment: async (deptId: string, data: any, companyId: string, userId?: string) => {
    const existing = await departmentRepository.findById(deptId);
    if (!existing) throw Object.assign(new Error('Department not found'), { statusCode: 404 });

    const updated = await departmentRepository.update(deptId, {
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

  deleteDepartment: async (deptId: string, companyId: string, userId?: string) => {
    const existing = await departmentRepository.findById(deptId);
    if (!existing) throw Object.assign(new Error('Department not found'), { statusCode: 404 });

    await departmentRepository.softDelete(deptId, userId || null);

    await companyTimelineService.logEvent({
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
