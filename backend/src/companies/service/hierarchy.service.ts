import { hierarchyRepository } from '../repository/hierarchy.repository';
import { companyTimelineService } from './companyTimeline.service';

export const hierarchyService = {
  getHierarchy: async (companyId: string) => {
    return hierarchyRepository.findByCompanyId(companyId);
  },

  getHierarchyTree: async (companyId: string) => {
    return hierarchyRepository.findTree(companyId);
  },

  createHierarchyEntry: async (companyId: string, data: any, userId?: string) => {
    const entry = await hierarchyRepository.create({
      companyId,
      parentCompanyId: data.parentCompanyId || null,
      relationshipType: data.relationshipType || 'Subsidiary',
      level: data.level || 0,
      description: data.description || null,
      createdBy: userId || null,
    });

    await companyTimelineService.logEvent({
      companyId,
      type: 'HIERARCHY_CREATED',
      title: `Hierarchy Entry: ${data.relationshipType}`,
      description: `New ${data.relationshipType} relationship established`,
      icon: 'GitBranch',
      color: '#F59E0B',
      createdBy: userId || 'system',
    });

    return entry;
  },

  deleteHierarchyEntry: async (entryId: string, companyId: string, userId?: string) => {
    const existing = await hierarchyRepository.findById(entryId);
    if (!existing) throw Object.assign(new Error('Hierarchy entry not found'), { statusCode: 404 });

    await hierarchyRepository.softDelete(entryId, userId || null);

    await companyTimelineService.logEvent({
      companyId,
      type: 'HIERARCHY_DELETED',
      title: 'Hierarchy Entry Removed',
      description: `${existing.relationshipType} relationship removed`,
      icon: 'GitBranch',
      color: '#EF4444',
      createdBy: userId || 'system',
    });
  },
};
