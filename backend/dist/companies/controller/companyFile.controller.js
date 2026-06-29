"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyFileController = void 0;
const companyFile_service_1 = require("../service/companyFile.service");
const response_1 = require("../../helpers/response");
exports.companyFileController = {
    list: async (req, res, next) => {
        try {
            const files = await companyFile_service_1.companyFileService.getFiles(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Files retrieved successfully.', files);
        }
        catch (error) {
            next(error);
        }
    },
    getStorageSummary: async (req, res, next) => {
        try {
            const summary = await companyFile_service_1.companyFileService.getStorageSummary(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Storage summary retrieved successfully.', summary);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            if (!req.file) {
                response_1.ResponseHelper.sendError(req, res, 400, 'No file uploaded.');
                return;
            }
            const file = await companyFile_service_1.companyFileService.createFile(req.params.id, req.file, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'File uploaded successfully.', file);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await companyFile_service_1.companyFileService.deleteFile(req.params.fileId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'File deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
