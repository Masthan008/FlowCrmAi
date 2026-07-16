import { campaignRepository } from '../repository/campaign.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const campaignService = {
  getCampaigns: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.type) {
      where.type = params.type;
    }

    const [items, total] = await Promise.all([
      campaignRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      campaignRepository.count(where),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  getCampaignById: async (id: string) => {
    const campaign = await campaignRepository.findById(id);
    if (!campaign || campaign.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }
    return campaign;
  },

  createCampaign: async (
    data: {
      name: string;
      description?: string;
      type: string;
      status?: string;
      scheduledAt?: string;
    },
    userId?: string
  ) => {
    return campaignRepository.create({
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      createdBy: userId || null,
    });
  },

  updateCampaign: async (
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      type: string;
      status: string;
      scheduledAt: string;
    }>,
    userId?: string
  ) => {
    const existing = await campaignRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);

    return campaignRepository.update(id, updateData);
  },

  deleteCampaign: async (id: string, userId?: string) => {
    const existing = await campaignRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }
    return campaignRepository.softDelete(id, userId);
  },

  updateCampaignStatus: async (id: string, status: string, userId?: string) => {
    const existing = await campaignRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }
    return campaignRepository.update(id, { status, updatedBy: userId || null });
  },

  getCampaignAnalytics: async (id: string) => {
    const campaign = await campaignRepository.findById(id);
    if (!campaign || campaign.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }

    const totalEmails = await prisma.campaignEmail.count({ where: { campaignId: id, deletedAt: null } });
    const totalLists = await prisma.campaignList.count({ where: { campaignId: id, deletedAt: null } });

    return {
      campaignId: id,
      totalEmails,
      totalLists,
    };
  },

  getCampaignLists: async (id: string) => {
    const campaign = await campaignRepository.findById(id);
    if (!campaign || campaign.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }
    return prisma.campaignList.findMany({
      where: { campaignId: id, deletedAt: null },
    });
  },

  createCampaignList: async (
    campaignId: string,
    data: { name: string; description?: string },
    userId?: string
  ) => {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign || campaign.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }
    return prisma.campaignList.create({
      data: {
        campaignId,
        name: data.name,
        description: data.description,
        createdBy: userId || null,
      },
    });
  },

  deleteCampaignList: async (campaignId: string, listId: string, userId?: string) => {
    const list = await prisma.campaignList.findUnique({ where: { id: listId } });
    if (!list || list.deletedAt || list.campaignId !== campaignId) {
      throw Object.assign(new Error('Campaign list not found'), { statusCode: 404 });
    }
    return prisma.campaignList.update({
      where: { id: listId },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },

  getCampaignEmails: async (id: string) => {
    const campaign = await campaignRepository.findById(id);
    if (!campaign || campaign.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }
    return prisma.campaignEmail.findMany({
      where: { campaignId: id, deletedAt: null },
      orderBy: { order: 'asc' },
    });
  },

  createCampaignEmail: async (
    campaignId: string,
    data: { subject: string; body: string; order?: number },
    userId?: string
  ) => {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign || campaign.deletedAt) {
      throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
    }
    return prisma.campaignEmail.create({
      data: {
        campaignId,
        subject: data.subject,
        body: data.body,
        order: data.order || 0,
        createdBy: userId || null,
      },
    });
  },

  updateCampaignEmail: async (
    campaignId: string,
    emailId: string,
    data: { subject?: string; body?: string; order?: number },
    userId?: string
  ) => {
    const email = await prisma.campaignEmail.findUnique({ where: { id: emailId } });
    if (!email || email.deletedAt || email.campaignId !== campaignId) {
      throw Object.assign(new Error('Campaign email not found'), { statusCode: 404 });
    }
    return prisma.campaignEmail.update({
      where: { id: emailId },
      data: { ...data, updatedBy: userId || null },
    });
  },

  deleteCampaignEmail: async (campaignId: string, emailId: string, userId?: string) => {
    const email = await prisma.campaignEmail.findUnique({ where: { id: emailId } });
    if (!email || email.deletedAt || email.campaignId !== campaignId) {
      throw Object.assign(new Error('Campaign email not found'), { statusCode: 404 });
    }
    return prisma.campaignEmail.update({
      where: { id: emailId },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },
};

export default campaignService;
