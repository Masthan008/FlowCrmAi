"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessNetworkService = void 0;
const businessNetwork_repository_1 = require("../repository/businessNetwork.repository");
const companyTimeline_service_1 = require("./companyTimeline.service");
exports.businessNetworkService = {
    getNetwork: async (companyId) => {
        return businessNetwork_repository_1.businessNetworkRepository.findByCompanyId(companyId);
    },
    getGroupedNetwork: async (companyId) => {
        return businessNetwork_repository_1.businessNetworkRepository.getGroupedByType(companyId);
    },
    createNetworkEntry: async (companyId, data, userId) => {
        const entry = await businessNetwork_repository_1.businessNetworkRepository.create({
            companyId,
            relatedCompanyId: data.relatedCompanyId || null,
            name: data.name,
            relationshipType: data.relationshipType || 'Partner',
            description: data.description || null,
            status: data.status || 'Active',
            website: data.website || null,
            createdBy: userId || null,
        });
        await companyTimeline_service_1.companyTimelineService.logEvent({
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
    updateNetworkEntry: async (entryId, data, companyId, userId) => {
        const existing = await businessNetwork_repository_1.businessNetworkRepository.findById(entryId);
        if (!existing)
            throw Object.assign(new Error('Network entry not found'), { statusCode: 404 });
        return businessNetwork_repository_1.businessNetworkRepository.update(entryId, {
            name: data.name !== undefined ? data.name : existing.name,
            relationshipType: data.relationshipType !== undefined ? data.relationshipType : existing.relationshipType,
            description: data.description !== undefined ? data.description : existing.description,
            status: data.status !== undefined ? data.status : existing.status,
            website: data.website !== undefined ? data.website : existing.website,
            updatedBy: userId || null,
        });
    },
    deleteNetworkEntry: async (entryId, companyId, userId) => {
        const existing = await businessNetwork_repository_1.businessNetworkRepository.findById(entryId);
        if (!existing)
            throw Object.assign(new Error('Network entry not found'), { statusCode: 404 });
        await businessNetwork_repository_1.businessNetworkRepository.softDelete(entryId, userId || null);
        await companyTimeline_service_1.companyTimelineService.logEvent({
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
