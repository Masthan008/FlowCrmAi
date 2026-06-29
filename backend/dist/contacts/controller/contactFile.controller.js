"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactFileController = void 0;
const contactFile_service_1 = require("../service/contactFile.service");
const response_1 = require("../../helpers/response");
exports.contactFileController = {
    list: async (req, res, next) => {
        try {
            const files = await contactFile_service_1.contactFileService.getFiles(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Files retrieved successfully.', files);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const file = await contactFile_service_1.contactFileService.createFile(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'File uploaded successfully.', file);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await contactFile_service_1.contactFileService.deleteFile(req.params.fileId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'File deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.contactFileController;
