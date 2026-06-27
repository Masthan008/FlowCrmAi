import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class HierarchyRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyHierarchy);
  }

  async findByCompanyId(companyId: string) {
    return prisma.companyHierarchy.findMany({
      where: { companyId, deletedAt: null },
      include: {
        parentCompany: { select: { id: true, name: true, companyNumber: true, status: true } },
      },
      orderBy: { level: 'asc' },
    });
  }

  async findTree(companyId: string) {
    const allEntries = await prisma.companyHierarchy.findMany({
      where: { deletedAt: null },
      include: {
        company: { select: { id: true, name: true, companyNumber: true, status: true, industry: true } },
        parentCompany: { select: { id: true, name: true, companyNumber: true, status: true } },
      },
      orderBy: { level: 'asc' },
    });
    const roots = allEntries.filter(e => !e.parentCompanyId && e.companyId === companyId);
    const buildTree = (parentId: string, level: number): any[] => {
      return allEntries
        .filter(e => e.parentCompanyId === parentId && e.level === level + 1)
        .map(e => ({ ...e, children: buildTree(e.companyId, e.level) }));
    };
    return roots.map(r => ({ ...r, children: buildTree(r.companyId, r.level) }));
  }
}

export const hierarchyRepository = new HierarchyRepository();
