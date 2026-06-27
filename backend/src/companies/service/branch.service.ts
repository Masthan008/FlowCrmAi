import { branchRepository } from '../repository/branch.repository';
import { companyTimelineService } from './companyTimeline.service';

export const branchService = {
  getBranches: async (companyId: string) => {
    return branchRepository.findByCompanyId(companyId);
  },

  getBranch: async (branchId: string) => {
    const branch = await branchRepository.findByIdWithCompany(branchId);
    if (!branch) throw Object.assign(new Error('Branch not found'), { statusCode: 404 });
    return branch;
  },

  createBranch: async (companyId: string, data: any, userId?: string) => {
    const branch = await branchRepository.create({
      companyId,
      name: data.name,
      branchCode: data.branchCode || null,
      branchType: data.branchType || null,
      managerId: data.managerId || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      gst: data.gst || null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      employeeCount: data.employeeCount || 0,
      revenue: data.revenue || 0,
      status: data.status || 'Active',
      openingDate: data.openingDate ? new Date(data.openingDate) : null,
      timezone: data.timezone || null,
      createdBy: userId || null,
    });

    await companyTimelineService.logEvent({
      companyId,
      type: 'BRANCH_CREATED',
      title: `Branch Created: ${data.name}`,
      description: `New ${data.branchType || 'branch'} added`,
      icon: 'Building2',
      color: '#8B5CF6',
      createdBy: userId || 'system',
    });

    return branch;
  },

  updateBranch: async (branchId: string, data: any, companyId: string, userId?: string) => {
    const existing = await branchRepository.findById(branchId);
    if (!existing) throw Object.assign(new Error('Branch not found'), { statusCode: 404 });

    const updated = await branchRepository.update(branchId, {
      name: data.name !== undefined ? data.name : existing.name,
      branchCode: data.branchCode !== undefined ? data.branchCode : existing.branchCode,
      branchType: data.branchType !== undefined ? data.branchType : existing.branchType,
      managerId: data.managerId !== undefined ? data.managerId : existing.managerId,
      phone: data.phone !== undefined ? data.phone : existing.phone,
      email: data.email !== undefined ? data.email : existing.email,
      address: data.address !== undefined ? data.address : existing.address,
      gst: data.gst !== undefined ? data.gst : existing.gst,
      country: data.country !== undefined ? data.country : existing.country,
      state: data.state !== undefined ? data.state : existing.state,
      city: data.city !== undefined ? data.city : existing.city,
      employeeCount: data.employeeCount !== undefined ? data.employeeCount : existing.employeeCount,
      revenue: data.revenue !== undefined ? data.revenue : existing.revenue,
      status: data.status !== undefined ? data.status : existing.status,
      openingDate: data.openingDate !== undefined ? (data.openingDate ? new Date(data.openingDate) : null) : existing.openingDate,
      timezone: data.timezone !== undefined ? data.timezone : existing.timezone,
      updatedBy: userId || null,
    });

    await companyTimelineService.logEvent({
      companyId,
      type: 'BRANCH_UPDATED',
      title: `Branch Updated: ${updated.name}`,
      description: 'Branch details updated',
      icon: 'Building2',
      color: '#6366F1',
      createdBy: userId || 'system',
    });

    return updated;
  },

  deleteBranch: async (branchId: string, companyId: string, userId?: string) => {
    const existing = await branchRepository.findById(branchId);
    if (!existing) throw Object.assign(new Error('Branch not found'), { statusCode: 404 });

    await branchRepository.softDelete(branchId, userId || null);

    await companyTimelineService.logEvent({
      companyId,
      type: 'BRANCH_DELETED',
      title: `Branch Deleted: ${existing.name}`,
      description: 'Branch removed',
      icon: 'Building2',
      color: '#EF4444',
      createdBy: userId || 'system',
    });
  },
};
