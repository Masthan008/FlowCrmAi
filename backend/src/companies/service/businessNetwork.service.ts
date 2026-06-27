import { businessNetworkRepository } from '../repository/businessNetwork.repository';
import { companyTimelineService } from './companyTimeline.service';

export const businessNetworkService = {
  getNetwork: async (companyId: string) => {
    return businessNetworkRepository.findByCompanyId(companyId);
  },

  getGroupedNetwork: async (companyId: string) => {
    return businessNetworkRepository.getGroupedByType(companyId);
  },

  createNetworkEntry: async (companyId: string, data: any, userId?: string) => {
    const entry = await businessNetworkRepository.create({
      companyId,
      relatedCompanyId: data.relatedCompanyId || null,
      name: data.name,
      relationshipType: data.relationshipType || 'Partner',
      description: data.description || null,
      status: data.status || 'Active',
      website: data.website || null,
      createdBy: userId || null,
    });

    await companyTimelineService.logEvent({
      companyId,
      type: 'NETWORK_ADDED',
      title: `Network: ${data.name}`,
      description: `Added as ${data.relationshipType}`,
      icon: 'Share2',
      color: '#10B981',
      createdBy: userId || 'system',
    });

    return entry;
  },

  updateNetworkEntry: async (entryId: string, data: any, companyId: string, userId?: string) => {
    const existing = await businessNetworkRepository.findById(entryId);
    if (!existing) throw Object.assign(new Error('Network entry not found'), { statusCode: 404 });

    return businessNetworkRepository.update(entryId, {
      name: data.name !== undefined ? data.name : existing.name,
      relationshipType: data.relationshipType !== undefined ? data.relationshipType : existing.relationshipType,
      description: data.description !== undefined ? data.description : existing.description,
      status: data.status !== undefined ? data.status : existing.status,
      website: data.website !== undefined ? data.website : existing.website,
      updatedBy: userId || null,
    });
  },

  deleteNetworkEntry: async (entryId: string, companyId: string, userId?: string) => {
    const existing = await businessNetworkRepository.findById(entryId);
    if (!existing) throw Object.assign(new Error('Network entry not found'), { statusCode: 404 });

    await businessNetworkRepository.softDelete(entryId, userId || null);

    await companyTimelineService.logEvent({
      companyId,
      type: 'NETWORK_REMOVED',
      title: `Network Removed: ${existing.name}`,
      description: `${existing.relationshipType} relationship ended`,
      icon: 'Share2',
      color: '#EF4444',
      createdBy: userId || 'system',
    });
  },
};
