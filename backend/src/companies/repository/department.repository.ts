import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class DepartmentRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyDepartment);
  }

  async findByCompanyId(companyId: string) {
    return prisma.companyDepartment.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findByType(companyId: string, type: string) {
    return prisma.companyDepartment.findMany({
      where: { companyId, type, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
}

export const departmentRepository = new DepartmentRepository();
