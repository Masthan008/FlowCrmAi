import { dealRepository } from '../repository/deal.repository';
import { prisma } from '../../database/db';

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

export const dealService = {
  list: async (params: any, currentUserId?: string) => {
    return dealRepository.paginateWithRelations({
      page: params.page ? Number(params.page) : 1,
      limit: params.limit ? Number(params.limit) : 20,
      search: params.search,
      status: params.status,
      pipelineId: params.pipelineId,
      stageId: params.stageId,
      assignedToId: params.assignedToId,
      priority: params.priority,
      source: params.source,
      industry: params.industry,
      companyId: params.companyId,
      valueMin: params.valueMin ? Number(params.valueMin) : undefined,
      valueMax: params.valueMax ? Number(params.valueMax) : undefined,
      probabilityMin: params.probabilityMin ? Number(params.probabilityMin) : undefined,
      probabilityMax: params.probabilityMax ? Number(params.probabilityMax) : undefined,
      closeDateFrom: params.closeDateFrom,
      closeDateTo: params.closeDateTo,
      createdFrom: params.createdFrom,
      createdTo: params.createdTo,
      myDeals: params.myDeals === 'true',
      open: params.open === 'true',
      won: params.won === 'true',
      lost: params.lost === 'true',
      closingThisMonth: params.closingThisMonth === 'true',
      highProbability: params.highProbability === 'true',
      highValue: params.highValue === 'true',
      recentlyCreated: params.recentlyCreated === 'true',
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      currentUserId,
    });
  },

  getById: async (id: string) => {
    const deal = await dealRepository.findByIdWithRelations(id);
    if (!deal) {
      throw Object.assign(new Error('Deal not found'), { statusCode: 404 });
    }
    return deal;
  },

  create: async (data: any, userId?: string) => {
    const cleaned = cleanData(data);
    const dealNumber = await dealRepository.getNextDealNumber();

    if (cleaned.expectedCloseDate) {
      cleaned.expectedCloseDate = new Date(cleaned.expectedCloseDate);
    }
    if (cleaned.actualCloseDate) {
      cleaned.actualCloseDate = new Date(cleaned.actualCloseDate);
    }

    cleaned.createdBy = userId || null;
    cleaned.dealNumber = dealNumber;

    const deal = await prisma.deal.create({
      data: cleaned as any,
      include: {
        company: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, email: true } },
        primaryContact: { select: { id: true, firstName: true, lastName: true, email: true } },
        lead: { select: { id: true, leadNumber: true, fullName: true } },
        stage: { select: { id: true, name: true, order: true, probability: true } },
        pipeline: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return deal;
  },

  update: async (id: string, data: any, userId?: string) => {
    const existing = await dealRepository.findByIdWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Deal not found'), { statusCode: 404 });
    }

    const cleaned = cleanData(data);

    if (cleaned.expectedCloseDate) {
      cleaned.expectedCloseDate = new Date(cleaned.expectedCloseDate);
    }
    if (cleaned.actualCloseDate) {
      cleaned.actualCloseDate = new Date(cleaned.actualCloseDate);
    }

    cleaned.updatedBy = userId || null;

    const deal = await prisma.deal.update({
      where: { id },
      data: cleaned as any,
      include: {
        company: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, email: true } },
        primaryContact: { select: { id: true, firstName: true, lastName: true, email: true } },
        lead: { select: { id: true, leadNumber: true, fullName: true } },
        stage: { select: { id: true, name: true, order: true, probability: true } },
        pipeline: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return deal;
  },

  delete: async (id: string, userId?: string) => {
    const existing = await dealRepository.findByIdWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Deal not found'), { statusCode: 404 });
    }

    return dealRepository.softDelete(id, userId || null);
  },

  bulkUpdateStatus: async (ids: string[], status: string, userId?: string) => {
    return dealRepository.updateStatus(ids, status, userId || '');
  },

  updateStage: async (id: string, stageId: string, userId?: string) => {
    const existing = await dealRepository.findByIdWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Deal not found'), { statusCode: 404 });
    }

    const stage = await prisma.pipelineStage.findUnique({
      where: { id: stageId },
      select: { id: true, name: true },
    });
    if (!stage) {
      throw Object.assign(new Error('Stage not found'), { statusCode: 404 });
    }

    return dealRepository.updateStage(id, stageId, userId || '');
  },

  bulkUpdateOwner: async (ids: string[], ownerId: string, userId?: string) => {
    return dealRepository.updateOwner(ids, ownerId, userId || '');
  },

  getStatistics: async (currentUserId?: string) => {
    return dealRepository.getStatistics(currentUserId);
  },

  getEmployees: async () => {
    return prisma.employee.findMany({
      where: { deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: 'asc' },
    });
  },
};

export default dealService;
