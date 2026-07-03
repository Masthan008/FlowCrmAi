"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyKYCService = void 0;
const companyKYC_repository_1 = require("../repositories/companyKYC.repository");
const db_1 = require("../../database/db");
exports.companyKYCService = {
    getKYCByCompanyId: async (companyId) => {
        return companyKYC_repository_1.companyKYCRepository.findByCompanyId(companyId);
    },
    updateKYC: async (companyId, data, updatedBy) => {
        const updatedRecord = await companyKYC_repository_1.companyKYCRepository.upsertKYC(companyId, {
            ...data,
            updatedBy: updatedBy || 'Compliance Officer'
        });
        // Update Company cvrVerified or compliance flag if verified
        if (data.status === 'Verified') {
            await db_1.prisma.company.update({
                where: { id: companyId },
                data: { cvrVerified: true }
            });
        }
        return updatedRecord;
    }
};
