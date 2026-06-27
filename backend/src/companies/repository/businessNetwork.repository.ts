import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class BusinessNetworkRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyBusinessNetwork);
  }

  async findByCompanyId(companyId: string) {
    return prisma.companyBusinessNetwork.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findByType(companyId: string, type: string) {
    return prisma.companyBusinessNetwork.findMany({
      where: { companyId, relationshipType: type, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async getGroupedByType(companyId: string) {
    const all = await this.findByCompanyId(companyId);
    const grouped: Record<string, any[]> = {};
    for (const item of all) {
      if (!grouped[item.relationshipType]) grouped[item.relationshipType] = [];
      grouped[item.relationshipType].push(item);
    }
    return grouped;
  }
}

export const businessNetworkRepository = new BusinessNetworkRepository();
