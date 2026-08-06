import { dealRepository } from '../repository/deal.repository';
import { prisma } from '../../database/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (val: any) => typeof val === 'string' && UUID_REGEX.test(val);

const cleanData = (data: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === undefined || value === null) {
      if (key === 'tags') {
        cleaned[key] = [];
      } else {
        cleaned[key] = null;
      }
    } else {
      cleaned[key] = value;
    }
  }

  // Ensure UUID foreign keys are valid UUIDs or set to null
  const uuidFields = ['customerId', 'companyId', 'primaryContactId', 'leadId', 'pipelineId', 'stageId', 'assignedToId'];
  for (const field of uuidFields) {
    if (cleaned[field] && !isUuid(cleaned[field])) {
      cleaned[field] = null;
    }
  }

  // Safe numeric parsing
  if (cleaned.value !== undefined && cleaned.value !== null) cleaned.value = Number(cleaned.value) || 0;
  if (cleaned.probability !== undefined && cleaned.probability !== null) cleaned.probability = Number(cleaned.probability) || 0;
  if (cleaned.expectedRevenue !== undefined && cleaned.expectedRevenue !== null) cleaned.expectedRevenue = Number(cleaned.expectedRevenue) || 0;

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

    if (!cleaned.customerId) {
      const firstCust = await prisma.customer.findFirst();
      if (firstCust) {
        cleaned.customerId = firstCust.id;
      } else {
        const newCust = await prisma.customer.create({
          data: { name: 'Default Enterprise Customer', type: 'client', status: 'active', createdBy: userId || null }
        });
        cleaned.customerId = newCust.id;
      }
    }

    if (!cleaned.pipelineId || !cleaned.stageId) {
      let firstPipeline = await prisma.pipeline.findFirst({
        include: { stages: { orderBy: { order: 'asc' } } }
      });
      if (!firstPipeline) {
        firstPipeline = await prisma.pipeline.create({
          data: {
            name: 'Standard Sales Pipeline',
            stages: {
              create: [
                { name: 'Qualification', order: 1, probability: 20 },
                { name: 'Proposal', order: 2, probability: 50 },
                { name: 'Negotiation', order: 3, probability: 80 },
                { name: 'Closed Won', order: 4, probability: 100 },
              ]
            }
          },
          include: { stages: { orderBy: { order: 'asc' } } }
        });
      }
      if (firstPipeline) {
        if (!cleaned.pipelineId) cleaned.pipelineId = firstPipeline.id;
        if (!cleaned.stageId && firstPipeline.stages.length > 0) {
          cleaned.stageId = firstPipeline.stages[0].id;
        }
      }
    }

    if (!cleaned.stageId) {
      let firstStage = await prisma.pipelineStage.findFirst();
      if (!firstStage) {
        firstStage = await prisma.pipelineStage.create({
          data: {
            name: 'Qualification',
            order: 1,
            probability: 20,
            pipelineId: cleaned.pipelineId || (await prisma.pipeline.create({ data: { name: 'Default Pipeline' } })).id
          }
        });
      }
      cleaned.stageId = firstStage.id;
      if (!cleaned.pipelineId) cleaned.pipelineId = firstStage.pipelineId;
    }

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
