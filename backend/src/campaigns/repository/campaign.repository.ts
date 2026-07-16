import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class CampaignRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CampaignWhereInput;
    orderBy?: Prisma.CampaignOrderByWithRelationInput;
  }) {
    return prisma.campaign.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
    });
  }

  async count(where?: Prisma.CampaignWhereInput) {
    return prisma.campaign.count({ where });
  }

  async findById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.CampaignUncheckedCreateInput) {
    return prisma.campaign.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CampaignUncheckedUpdateInput) {
    return prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.campaign.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const campaignRepository = new CampaignRepository();
export default campaignRepository;
