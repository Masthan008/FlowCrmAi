import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class CompanyIntelligenceRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyLifecycle);
  }

  async getLifecycle(companyId: string) {
    try {
      return prisma.companyLifecycle.findUnique({
        where: { companyId },
      });
    } catch (error) {
      throw error;
    }
  }

  async upsertLifecycle(companyId: string, data: any) {
    try {
      return prisma.companyLifecycle.upsert({
        where: { companyId },
        create: { companyId, ...data },
        update: data,
      });
    } catch (error) {
      throw error;
    }
  }

  async getStageHistory(companyId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const where = { companyId, deletedAt: null };

      const [items, totalItems] = await Promise.all([
        prisma.companyStageHistory.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.companyStageHistory.count({ where }),
      ]);

      return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async addStageHistory(companyId: string, data: any) {
    try {
      return prisma.companyStageHistory.create({
        data: { companyId, ...data },
      });
    } catch (error) {
      throw error;
    }
  }

  async getScore(companyId: string) {
    try {
      return prisma.companyScore.findUnique({
        where: { companyId },
      });
    } catch (error) {
      throw error;
    }
  }

  async upsertScore(companyId: string, data: any) {
    try {
      return prisma.companyScore.upsert({
        where: { companyId },
        create: { companyId, ...data },
        update: data,
      });
    } catch (error) {
      throw error;
    }
  }

  async getHealth(companyId: string) {
    try {
      return prisma.companyHealth.findUnique({
        where: { companyId },
      });
    } catch (error) {
      throw error;
    }
  }

  async upsertHealth(companyId: string, data: any) {
    try {
      return prisma.companyHealth.upsert({
        where: { companyId },
        create: { companyId, ...data },
        update: data,
      });
    } catch (error) {
      throw error;
    }
  }

  async getRisk(companyId: string) {
    try {
      return prisma.companyRisk.findUnique({
        where: { companyId },
      });
    } catch (error) {
      throw error;
    }
  }

  async upsertRisk(companyId: string, data: any) {
    try {
      return prisma.companyRisk.upsert({
        where: { companyId },
        create: { companyId, ...data },
        update: data,
      });
    } catch (error) {
      throw error;
    }
  }

  async listSegments(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    try {
      const { page = 1, limit = 20, search, isActive } = params;
      const skip = (page - 1) * limit;
      const where: any = { deletedAt: null };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (isActive !== undefined) where.isActive = isActive;

      const [items, totalItems] = await Promise.all([
        prisma.companySegment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { rules: true, _count: { select: { companyMappings: true } } },
        }),
        prisma.companySegment.count({ where }),
      ]);

      return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async getSegment(id: string) {
    try {
      return prisma.companySegment.findFirst({
        where: { id, deletedAt: null },
        include: { rules: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async createSegment(data: any) {
    try {
      const { rules, ...segmentData } = data;
      return prisma.companySegment.create({
        data: {
          ...segmentData,
          rules: rules ? { createMany: { data: rules } } : undefined,
        },
        include: { rules: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateSegment(id: string, data: any) {
    try {
      const { rules, ...segmentData } = data;

      if (rules) {
        await prisma.companySegmentRule.deleteMany({ where: { segmentId: id } });
      }

      return prisma.companySegment.update({
        where: { id },
        data: {
          ...segmentData,
          rules: rules ? { createMany: { data: rules } } : undefined,
        },
        include: { rules: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteSegment(id: string) {
    try {
      return prisma.companySegment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw error;
    }
  }

  async evaluateSegment(segmentId: string) {
    try {
      const segment = await prisma.companySegment.findFirst({
        where: { id: segmentId, deletedAt: null },
        include: { rules: true },
      });

      if (!segment) return [];

      const matchType = segment.matchType || 'ALL';
      const companies = await prisma.company.findMany({
        where: { deletedAt: null },
      });

      const matchingCompanies = companies.filter((company) => {
        if (matchType === 'ALL') {
          return segment.rules.every((rule) => this.evaluateRule(company, rule));
        }
        return segment.rules.some((rule) => this.evaluateRule(company, rule));
      });

      return matchingCompanies;
    } catch (error) {
      throw error;
    }
  }

  private evaluateRule(company: any, rule: any): boolean {
    const fieldValue = this.getFieldValue(company, rule.field);
    if (fieldValue === undefined || fieldValue === null) return false;

    switch (rule.operator) {
      case 'equals':
        return String(fieldValue).toLowerCase() === rule.value.toLowerCase();
      case 'notEquals':
        return String(fieldValue).toLowerCase() !== rule.value.toLowerCase();
      case 'contains':
        return String(fieldValue).toLowerCase().includes(rule.value.toLowerCase());
      case 'greaterThan':
        return Number(fieldValue) > Number(rule.value);
      case 'lessThan':
        return Number(fieldValue) < Number(rule.value);
      case 'in': {
        const values = rule.value.split(',').map((v: string) => v.trim().toLowerCase());
        return values.includes(String(fieldValue).toLowerCase());
      }
      case 'between': {
        const num = Number(fieldValue);
        return num >= Number(rule.value) && num <= Number(rule.value2 || rule.value);
      }
      default:
        return false;
    }
  }

  private getFieldValue(company: any, field: string): any {
    const fieldMap: Record<string, string> = {
      industry: 'industry',
      revenue: 'annualRevenue',
      country: 'country',
      lifecycleStage: 'lifecycleStage',
      status: 'status',
      owner: 'ownerId',
      employeeCount: 'employeeCount',
      state: 'state',
      city: 'city',
      companyType: 'companyType',
      priority: 'priority',
      rating: 'rating',
    };

    const mappedField = fieldMap[field] || field;
    return company[mappedField];
  }

  async listTags(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    try {
      const { page = 1, limit = 20, search, isActive } = params;
      const skip = (page - 1) * limit;
      const where: any = { deletedAt: null };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (isActive !== undefined) where.isActive = isActive;

      const [items, totalItems] = await Promise.all([
        prisma.companyTag.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
          include: { _count: { select: { mappings: true } } },
        }),
        prisma.companyTag.count({ where }),
      ]);

      return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async createTag(data: any) {
    try {
      return prisma.companyTag.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async updateTag(id: string, data: any) {
    try {
      return prisma.companyTag.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteTag(id: string) {
    try {
      return prisma.companyTag.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw error;
    }
  }

  async getCompanyTags(companyId: string) {
    try {
      return prisma.companyTagMapping.findMany({
        where: { companyId },
        include: { tag: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async assignTagsToCompany(companyId: string, tagIds: string[], assignedBy?: string) {
    try {
      const existing = await prisma.companyTagMapping.findMany({
        where: { companyId, tagId: { in: tagIds } },
        select: { tagId: true },
      });
      const existingTagIds = new Set(existing.map((e) => e.tagId));
      const newTagIds = tagIds.filter((id) => !existingTagIds.has(id));

      if (newTagIds.length === 0) return [];

      await prisma.companyTagMapping.createMany({
        data: newTagIds.map((tagId) => ({
          companyId,
          tagId,
          assignedBy: assignedBy || null,
        })),
        skipDuplicates: true,
      });

      return this.getCompanyTags(companyId);
    } catch (error) {
      throw error;
    }
  }

  async removeTagFromCompany(companyId: string, tagId: string) {
    try {
      return prisma.companyTagMapping.deleteMany({
        where: { companyId, tagId },
      });
    } catch (error) {
      throw error;
    }
  }

  async listWorkflows(params: {
    page?: number;
    limit?: number;
    search?: string;
    triggerType?: string;
  }) {
    try {
      const { page = 1, limit = 20, search, triggerType } = params;
      const skip = (page - 1) * limit;
      const where: any = { deletedAt: null };

      if (search) where.name = { contains: search, mode: 'insensitive' };
      if (triggerType) where.triggerType = triggerType;

      const [items, totalItems] = await Promise.all([
        prisma.companyWorkflow.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.companyWorkflow.count({ where }),
      ]);

      return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async createWorkflow(data: any) {
    try {
      return prisma.companyWorkflow.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async updateWorkflow(id: string, data: any) {
    try {
      return prisma.companyWorkflow.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteWorkflow(id: string) {
    try {
      return prisma.companyWorkflow.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw error;
    }
  }

  async listRecommendations(companyId: string, params: {
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
    isRead?: boolean;
    isActioned?: boolean;
  }) {
    try {
      const { page = 1, limit = 20, type, priority, isRead, isActioned } = params;
      const skip = (page - 1) * limit;
      const where: any = { companyId, deletedAt: null };

      if (type) where.type = type;
      if (priority) where.priority = priority;
      if (isRead !== undefined) where.isRead = isRead;
      if (isActioned !== undefined) where.isActioned = isActioned;

      const [items, totalItems] = await Promise.all([
        prisma.companyRecommendation.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.companyRecommendation.count({ where }),
      ]);

      return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async createRecommendation(data: any) {
    try {
      return prisma.companyRecommendation.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async markRecommendationRead(id: string) {
    try {
      return prisma.companyRecommendation.update({
        where: { id },
        data: { isRead: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async markRecommendationActioned(id: string) {
    try {
      return prisma.companyRecommendation.update({
        where: { id },
        data: { isActioned: true, actionedAt: new Date() },
      });
    } catch (error) {
      throw error;
    }
  }

  async listFollowups(companyId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
  }) {
    try {
      const { page = 1, limit = 20, status, type, priority } = params;
      const skip = (page - 1) * limit;
      const where: any = { companyId, deletedAt: null };

      if (status) where.status = status;
      if (type) where.type = type;
      if (priority) where.priority = priority;

      const [items, totalItems] = await Promise.all([
        prisma.companyFollowup.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
          include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
        }),
        prisma.companyFollowup.count({ where }),
      ]);

      return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async createFollowup(data: any) {
    try {
      return prisma.companyFollowup.create({
        data,
        include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateFollowup(id: string, data: any) {
    try {
      return prisma.companyFollowup.update({
        where: { id },
        data,
        include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteFollowup(id: string) {
    try {
      return prisma.companyFollowup.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw error;
    }
  }

  async getInsights() {
    try {
      const baseWhere = { deletedAt: null };

      const [
        highestRevenue,
        recentCompanies,
        mostActive,
        highestLTV,
        mostMeetings,
        mostDeals,
        mostContacts,
        highestPipeline,
        totalCompanies,
        totalRevenue,
        avgScore,
        avgHealth,
      ] = await Promise.all([
        prisma.company.findFirst({
          where: baseWhere,
          orderBy: { annualRevenue: 'desc' },
          select: { id: true, name: true, annualRevenue: true, industry: true },
        }),
        prisma.company.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, name: true, createdAt: true },
        }),
        prisma.companyActivity.groupBy({
          by: ['companyId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
        prisma.company.findFirst({
          where: baseWhere,
          orderBy: { annualRevenue: 'desc' },
          select: { id: true, name: true, annualRevenue: true },
        }),
        prisma.companyActivity.findMany({
          where: { deletedAt: null, type: 'Meeting' },
          select: { companyId: true, company: { select: { id: true, name: true } } },
        }),
        null,
        null,
        null,
        prisma.company.count({ where: baseWhere }),
        prisma.company.aggregate({ where: baseWhere, _sum: { annualRevenue: true } }),
        prisma.companyScore.aggregate({ _avg: { overallScore: true } }),
        prisma.companyHealth.aggregate({ _avg: { overallHealth: true } }),
      ]);

      const meetingCounts: Record<string, { id: string; name: string; count: number }> = {};
      (mostMeetings || []).forEach((m) => {
        const cid = m.companyId;
        if (!meetingCounts[cid]) {
          meetingCounts[cid] = { id: cid, name: m.company?.name || 'Unknown', count: 0 };
        }
        meetingCounts[cid].count++;
      });
      const topMeetings = Object.values(meetingCounts).sort((a, b) => b.count - a.count).slice(0, 5);

      return {
        highestRevenueCompany: highestRevenue || null,
        fastestGrowing: recentCompanies || [],
        mostActive: mostActive || [],
        highestLTV: highestLTV || null,
        mostMeetings: topMeetings,
        mostDeals: [],
        mostContacts: [],
        highestPipelineValue: 0,
        totals: {
          companies: totalCompanies,
          revenue: totalRevenue._sum?.annualRevenue || 0,
        },
        averages: {
          score: Math.round(avgScore._avg?.overallScore || 0),
          health: Math.round(avgHealth._avg?.overallHealth || 0),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getAnalytics(params: {
    period?: string;
    year?: number;
  }) {
    try {
      const { period = 'monthly', year = new Date().getFullYear() } = params;
      const baseWhere: any = { deletedAt: null };

      const [
        companyCount,
        industryDistribution,
        lifecycleDistribution,
        statusDistribution,
        geographicalDistribution,
        totalRevenue,
      ] = await Promise.all([
        prisma.company.count({ where: baseWhere }),
        prisma.company.groupBy({
          by: ['industry'],
          _count: { id: true },
          where: { ...baseWhere, industry: { not: null } },
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.company.groupBy({
          by: ['lifecycleStage'],
          _count: { id: true },
          where: baseWhere,
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.company.groupBy({
          by: ['status'],
          _count: { id: true },
          where: baseWhere,
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.company.groupBy({
          by: ['country'],
          _count: { id: true },
          where: { ...baseWhere, country: { not: null } },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        prisma.companyRevenue.aggregate({
          where: { deletedAt: null, year, type: 'Revenue' },
          _sum: { amount: true },
        }),
      ]);

      return {
        totalCompanies: companyCount,
        totalRevenue: totalRevenue._sum?.amount || 0,
        period,
        year,
        industryDistribution: industryDistribution.map((i) => ({
          name: i.industry || 'Unknown',
          count: i._count.id,
        })),
        lifecycleDistribution: lifecycleDistribution.map((l) => ({
          stage: l.lifecycleStage,
          count: l._count.id,
        })),
        customerDistribution: statusDistribution.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        geographicalDistribution: geographicalDistribution.map((g) => ({
          country: g.country || 'Unknown',
          count: g._count.id,
        })),
      };
    } catch (error) {
      throw error;
    }
  }
}

export const companyIntelligenceRepository = new CompanyIntelligenceRepository();
