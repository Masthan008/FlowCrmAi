import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class CustomerJourneyRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyCustomerJourney);
  }

  async findByCompanyId(companyId: string) {
    return prisma.companyCustomerJourney.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findByType(companyId: string, type: string) {
    return prisma.companyCustomerJourney.findMany({
      where: { companyId, type, deletedAt: null },
      orderBy: { eventDate: 'desc' },
    });
  }
}

export const customerJourneyRepository = new CustomerJourneyRepository();
