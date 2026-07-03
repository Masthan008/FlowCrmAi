"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyKYCRepository = void 0;
const db_1 = require("../../database/db");
exports.companyKYCRepository = {
    findByCompanyId: async (companyId) => {
        let kyc = await db_1.prisma.companyKYC.findUnique({
            where: { companyId },
        });
        if (!kyc) {
            // Seed default KYC record if not present
            kyc = await db_1.prisma.companyKYC.create({
                data: {
                    companyId,
                    status: 'Pending',
                    riskRating: 'Low',
                    verificationType: 'Standard',
                    notes: 'Initial compliance record generated upon account creation.',
                    checklist: [
                        { id: '1', name: 'Verify Business Registration Certificate', passed: true, checkedAt: new Date().toISOString() },
                        { id: '2', name: 'Ultimate Beneficial Owner (UBO) Declaration', passed: false },
                        { id: '3', name: 'Sanctions & PEP (Politically Exposed Persons) Screening', passed: true, checkedAt: new Date().toISOString() },
                        { id: '4', name: 'Tax Residency Compliance Validation', passed: false },
                        { id: '5', name: 'Anti-Money Laundering (AML) Risk Assessment', passed: false }
                    ],
                    documents: [
                        { id: 'doc-1', name: 'Certificate_of_Incorporation.pdf', type: 'application/pdf', key: 'incorporation', url: '/documents/cert.pdf', status: 'Approved', uploadedAt: new Date().toISOString() }
                    ],
                    history: [
                        { timestamp: new Date().toISOString(), action: 'KYC Record Created', user: 'System' }
                    ]
                }
            });
        }
        return kyc;
    },
    upsertKYC: async (companyId, data) => {
        const existing = await db_1.prisma.companyKYC.findUnique({ where: { companyId } });
        const currentHistory = existing?.history || [];
        const newAuditEntry = {
            timestamp: new Date().toISOString(),
            action: `Status set to ${data.status || existing?.status || 'Pending'} (Risk: ${data.riskRating || existing?.riskRating || 'Low'})`,
            user: data.updatedBy || 'Compliance Officer'
        };
        return db_1.prisma.companyKYC.upsert({
            where: { companyId },
            create: {
                companyId,
                status: data.status || 'Pending',
                riskRating: data.riskRating || 'Low',
                verificationType: data.verificationType || 'Standard',
                notes: data.notes || '',
                documents: data.documents || [],
                checklist: data.checklist || [],
                verifiedAt: data.status === 'Verified' ? new Date() : null,
                verifiedBy: data.status === 'Verified' ? (data.updatedBy || 'Compliance Officer') : null,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
                history: [newAuditEntry],
                createdBy: data.updatedBy || 'System'
            },
            update: {
                status: data.status,
                riskRating: data.riskRating,
                verificationType: data.verificationType,
                notes: data.notes,
                documents: data.documents,
                checklist: data.checklist,
                verifiedAt: data.status === 'Verified' ? new Date() : existing?.verifiedAt,
                verifiedBy: data.status === 'Verified' ? (data.updatedBy || 'Compliance Officer') : existing?.verifiedBy,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : existing?.expiryDate,
                history: [...currentHistory, newAuditEntry],
                updatedBy: data.updatedBy
            }
        });
    }
};
