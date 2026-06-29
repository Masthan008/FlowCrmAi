"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hierarchyService = void 0;
const hierarchy_repository_1 = require("../repository/hierarchy.repository");
const companyTimeline_service_1 = require("./companyTimeline.service");
exports.hierarchyService = {
    getHierarchy: async (companyId) => {
        return hierarchy_repository_1.hierarchyRepository.findByCompanyId(companyId);
    },
    getHierarchyTree: async (companyId) => {
        return hierarchy_repository_1.hierarchyRepository.findTree(companyId);
    },
    createHierarchyEntry: async (companyId, data, userId) => {
        const entry = await hierarchy_repository_1.hierarchyRepository.create({
            companyId,
            parentCompanyId: data.parentCompanyId || null,
            relationshipType: data.relationshipType || 'Subsidiary',
            level: data.level || 0,
            description: data.description || null,
            createdBy: userId || null,
        });
        await companyTimeline_service_1.companyTimelineService.logEvent({
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
    deleteHierarchyEntry: async (entryId, companyId, userId) => {
        const existing = await hierarchy_repository_1.hierarchyRepository.findById(entryId);
        if (!existing)
            throw Object.assign(new Error('Hierarchy entry not found'), { statusCode: 404 });
        await hierarchy_repository_1.hierarchyRepository.softDelete(entryId, userId || null);
        await companyTimeline_service_1.companyTimelineService.logEvent({
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
