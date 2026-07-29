"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignService = void 0;
const campaign_repository_1 = require("../repository/campaign.repository");
const db_1 = require("../../database/db");
exports.campaignService = {
    getCampaigns: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
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
            campaign_repository_1.campaignRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            campaign_repository_1.campaignRepository.count(where),
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
    getCampaignById: async (id) => {
        const campaign = await campaign_repository_1.campaignRepository.findById(id);
        if (!campaign || campaign.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        return campaign;
    },
    createCampaign: async (data, userId) => {
        return campaign_repository_1.campaignRepository.create({
            name: data.name,
            description: data.description,
            type: data.type,
            status: data.status,
            startDate: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            createdBy: userId || null,
        });
    },
    updateCampaign: async (id, data, userId) => {
        const existing = await campaign_repository_1.campaignRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.scheduledAt)
            updateData.startDate = new Date(data.scheduledAt);
        delete updateData.scheduledAt;
        return campaign_repository_1.campaignRepository.update(id, updateData);
    },
    deleteCampaign: async (id, userId) => {
        const existing = await campaign_repository_1.campaignRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        return campaign_repository_1.campaignRepository.softDelete(id, userId);
    },
    updateCampaignStatus: async (id, status, userId) => {
        const existing = await campaign_repository_1.campaignRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        return campaign_repository_1.campaignRepository.update(id, { status, updatedBy: userId || null });
    },
    getCampaignAnalytics: async (id) => {
        const campaign = await campaign_repository_1.campaignRepository.findById(id);
        if (!campaign || campaign.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        const totalEmails = await db_1.prisma.campaignEmail.count({ where: { campaignId: id, deletedAt: null } });
        const totalLists = await db_1.prisma.campaignList.count({ where: { campaignId: id, deletedAt: null } });
        return {
            campaignId: id,
            totalEmails,
            totalLists,
        };
    },
    getCampaignLists: async (id) => {
        const campaign = await campaign_repository_1.campaignRepository.findById(id);
        if (!campaign || campaign.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        return db_1.prisma.campaignList.findMany({
            where: { campaignId: id, deletedAt: null },
        });
    },
    createCampaignList: async (campaignId, data, userId) => {
        const campaign = await campaign_repository_1.campaignRepository.findById(campaignId);
        if (!campaign || campaign.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        return db_1.prisma.campaignList.create({
            data: {
                campaignId,
                name: data.name,
                description: data.description,
                createdBy: userId || null,
            },
        });
    },
    deleteCampaignList: async (campaignId, listId, userId) => {
        const list = await db_1.prisma.campaignList.findUnique({ where: { id: listId } });
        if (!list || list.deletedAt || list.campaignId !== campaignId) {
            throw Object.assign(new Error('Campaign list not found'), { statusCode: 404 });
        }
        return db_1.prisma.campaignList.update({
            where: { id: listId },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
    getCampaignEmails: async (id) => {
        const campaign = await campaign_repository_1.campaignRepository.findById(id);
        if (!campaign || campaign.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        return db_1.prisma.campaignEmail.findMany({
            where: { campaignId: id, deletedAt: null },
            orderBy: { createdAt: 'asc' },
        });
    },
    createCampaignEmail: async (campaignId, data, userId) => {
        const campaign = await campaign_repository_1.campaignRepository.findById(campaignId);
        if (!campaign || campaign.deletedAt) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        return db_1.prisma.campaignEmail.create({
            data: {
                campaignId,
                subject: data.subject,
                bodyHtml: data.body,
                createdBy: userId || null,
            },
        });
    },
    updateCampaignEmail: async (campaignId, emailId, data, userId) => {
        const email = await db_1.prisma.campaignEmail.findUnique({ where: { id: emailId } });
        if (!email || email.deletedAt || email.campaignId !== campaignId) {
            throw Object.assign(new Error('Campaign email not found'), { statusCode: 404 });
        }
        const updateData = { updatedBy: userId || null };
        if (data.subject !== undefined)
            updateData.subject = data.subject;
        if (data.body !== undefined)
            updateData.bodyHtml = data.body;
        return db_1.prisma.campaignEmail.update({
            where: { id: emailId },
            data: updateData,
        });
    },
    deleteCampaignEmail: async (campaignId, emailId, userId) => {
        const email = await db_1.prisma.campaignEmail.findUnique({ where: { id: emailId } });
        if (!email || email.deletedAt || email.campaignId !== campaignId) {
            throw Object.assign(new Error('Campaign email not found'), { statusCode: 404 });
        }
        return db_1.prisma.campaignEmail.update({
            where: { id: emailId },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
};
exports.default = exports.campaignService;
