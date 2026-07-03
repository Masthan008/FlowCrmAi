"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyKYCController = void 0;
const cvrRegistry_service_1 = require("../services/cvrRegistry.service");
const companyKYC_service_1 = require("../services/companyKYC.service");
const response_1 = require("../../helpers/response");
exports.companyKYCController = {
    searchCVR: async (req, res, next) => {
        try {
            const query = req.query.query || '';
            const results = await cvrRegistry_service_1.cvrRegistryService.searchCVR(query);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'CVR Registry search results fetched.', results);
        }
        catch (error) {
            next(error);
        }
    },
    getKYC: async (req, res, next) => {
        try {
            const kyc = await companyKYC_service_1.companyKYCService.getKYCByCompanyId(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company KYC compliance details fetched.', kyc);
        }
        catch (error) {
            next(error);
        }
    },
    updateKYC: async (req, res, next) => {
        try {
            const updated = await companyKYC_service_1.companyKYCService.updateKYC(req.params.id, req.body, req.user?.email || 'Compliance Officer');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company KYC compliance updated.', updated);
        }
        catch (error) {
            next(error);
        }
    }
};
