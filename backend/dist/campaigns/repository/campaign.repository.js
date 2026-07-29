"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRepository = exports.CampaignRepository = void 0;
const db_1 = require("../../database/db");
class CampaignRepository {
    async findMany(params) {
        return db_1.prisma.campaign.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
        });
    }
    async count(where) {
        return db_1.prisma.campaign.count({ where });
    }
    async findById(id) {
        return db_1.prisma.campaign.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return db_1.prisma.campaign.create({
            data,
        });
    }
    async update(id, data) {
        return db_1.prisma.campaign.update({
            where: { id },
            data,
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.campaign.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.CampaignRepository = CampaignRepository;
exports.campaignRepository = new CampaignRepository();
exports.default = exports.campaignRepository;
