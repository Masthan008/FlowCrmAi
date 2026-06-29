"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hierarchyController = void 0;
const hierarchy_service_1 = require("../service/hierarchy.service");
const response_1 = require("../../helpers/response");
exports.hierarchyController = {
    list: async (req, res, next) => {
        try {
            const hierarchy = await hierarchy_service_1.hierarchyService.getHierarchy(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Hierarchy retrieved successfully.', hierarchy);
        }
        catch (error) {
            next(error);
        }
    },
    getTree: async (req, res, next) => {
        try {
            const tree = await hierarchy_service_1.hierarchyService.getHierarchyTree(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Hierarchy tree retrieved successfully.', tree);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const entry = await hierarchy_service_1.hierarchyService.createHierarchyEntry(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Hierarchy entry created successfully.', entry);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await hierarchy_service_1.hierarchyService.deleteHierarchyEntry(req.params.entryId, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Hierarchy entry deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
