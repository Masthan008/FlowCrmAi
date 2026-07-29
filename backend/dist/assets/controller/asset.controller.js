"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetController = void 0;
const asset_service_1 = require("../service/asset.service");
const response_1 = require("../../helpers/response");
exports.assetController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const type = req.query.type;
            const status = req.query.status;
            const assignedToId = req.query.assignedToId;
            const search = req.query.search;
            const result = await asset_service_1.assetService.getAssets({ page, limit, type, status, assignedToId, search });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Assets retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const asset = await asset_service_1.assetService.getAssetById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Asset details retrieved successfully.', asset);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const asset = await asset_service_1.assetService.createAsset(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Asset created successfully.', asset);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const asset = await asset_service_1.assetService.updateAsset(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Asset updated successfully.', asset);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await asset_service_1.assetService.deleteAsset(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Asset deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    assign: async (req, res, next) => {
        try {
            const asset = await asset_service_1.assetService.assignAsset(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Asset assigned successfully.', asset);
        }
        catch (error) {
            next(error);
        }
    },
    retire: async (req, res, next) => {
        try {
            const asset = await asset_service_1.assetService.retireAsset(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Asset retired successfully.', asset);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.assetController;
