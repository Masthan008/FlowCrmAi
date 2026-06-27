import { prisma } from '../../database/db';
import { companyRepository } from '../repository/company.repository';
import { auditLogRepository } from '../../repositories/auditLog.repository';

const cleanData = (data: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === undefined) {
      cleaned[key] = null;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

export const companyService = {
  list: async (params: any, currentUserId?: string) => {
    return companyRepository.paginateWithRelations({
      page: params.page ? Number(params.page) : 1,
      limit: params.limit ? Number(params.limit) : 20,
      search: params.search,
      status: params.status,
      industry: params.industry,
      country: params.country,
      state: params.state,
      owner: params.owner,
      priority: params.priority,
      rating: params.rating,
      minRevenue: params.minRevenue ? Number(params.minRevenue) : undefined,
      maxRevenue: params.maxRevenue ? Number(params.maxRevenue) : undefined,
      minEmployees: params.minEmployees ? Number(params.minEmployees) : undefined,
      maxEmployees: params.maxEmployees ? Number(params.maxEmployees) : undefined,
      fromDate: params.fromDate,
      toDate: params.toDate,
      myCompaniesOnly: params.myCompaniesOnly === 'true' || params.myCompaniesOnly === true,
      customersOnly: params.customersOnly === 'true' || params.customersOnly === true,
      partnersOnly: params.partnersOnly === 'true' || params.partnersOnly === true,
      prospectsOnly: params.prospectsOnly === 'true' || params.prospectsOnly === true,
      recentlyAdded: params.recentlyAdded === 'true' || params.recentlyAdded === true,
      highRevenue: params.highRevenue === 'true' || params.highRevenue === true,
      highPriority: params.highPriority === 'true' || params.highPriority === true,
      archivedOnly: params.archivedOnly === 'true' || params.archivedOnly === true,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      currentUserId,
    });
  },

  getById: async (id: string) => {
    const company = await companyRepository.findByIdWithRelations(id);
    if (!company) {
      const err = new Error('Company not found') as any;
      err.statusCode = 404;
      throw err;
    }
    return company;
  },

  create: async (data: any, currentUserId: string) => {
    const cleaned = cleanData(data);
    const companyNumber = await companyRepository.getNextCompanyNumber();

    const company = await companyRepository.create({
      ...cleaned,
      companyNumber,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });

    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'COMPANY_CREATED',
      module: 'companies',
      details: { companyId: company.id, companyNumber },
    });

    return company;
  },

  update: async (id: string, data: any, currentUserId: string) => {
    const existing = await companyRepository.findById(id);
    if (!existing) {
      const err = new Error('Company not found') as any;
      err.statusCode = 404;
      throw err;
    }

    const cleaned = cleanData(data);

    const company = await companyRepository.update(id, {
      ...cleaned,
      updatedBy: currentUserId,
    });

    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'COMPANY_UPDATED',
      module: 'companies',
      details: { companyId: id, companyNumber: existing.companyNumber },
    });

    return company;
  },

  delete: async (id: string, currentUserId: string) => {
    const existing = await companyRepository.findById(id);
    if (!existing) {
      const err = new Error('Company not found') as any;
      err.statusCode = 404;
      throw err;
    }

    await companyRepository.softDelete(id, currentUserId);

    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'COMPANY_DELETED',
      module: 'companies',
      details: { companyId: id, companyNumber: existing.companyNumber },
    });
  },

  bulkUpdateStatus: async (ids: string[], status: string, currentUserId: string) => {
    await prisma.company.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { status, updatedBy: currentUserId },
    });

    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'COMPANY_STATUS_BULK_UPDATED',
      module: 'companies',
      details: { companyIds: ids, status },
    });
  },

  bulkUpdateOwner: async (ids: string[], ownerId: string, currentUserId: string) => {
    await prisma.company.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { ownerId, updatedBy: currentUserId },
    });

    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'COMPANY_OWNER_BULK_UPDATED',
      module: 'companies',
      details: { companyIds: ids, ownerId },
    });
  },

  getStatistics: async (currentUserId?: string) => {
    return companyRepository.getStatistics(currentUserId);
  },

  getEmployees: async () => {
    return companyRepository.findEmployees();
  },
};
