"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractService = void 0;
const contract_repository_1 = require("../repository/contract.repository");
const db_1 = require("../../database/db");
exports.contractService = {
    getContracts: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.title = { contains: params.search, mode: 'insensitive' };
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.type) {
            where.type = params.type;
        }
        if (params.customerId) {
            where.customerId = params.customerId;
        }
        const [items, total] = await Promise.all([
            contract_repository_1.contractRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            contract_repository_1.contractRepository.count(where),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },
    getContractById: async (id) => {
        const contract = await contract_repository_1.contractRepository.findById(id);
        if (!contract || contract.deletedAt) {
            throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
        }
        return contract;
    },
    createContract: async (data, userId) => {
        if (data.customerId) {
            const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
            if (!customer) {
                throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
            }
        }
        const title = data.title || data.name || 'Untitled Contract';
        const contractNumber = data.contractNumber || `CTR-${Date.now()}`;
        return contract_repository_1.contractRepository.create({
            title,
            contractNumber,
            description: data.description,
            type: data.type || 'Service',
            status: data.status || 'Draft',
            customerId: data.customerId,
            value: data.value || 0,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            createdBy: userId || null,
        });
    },
    updateContract: async (id, data, userId) => {
        const existing = await contract_repository_1.contractRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.startDate)
            updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined)
            updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        return contract_repository_1.contractRepository.update(id, updateData);
    },
    deleteContract: async (id, userId) => {
        const existing = await contract_repository_1.contractRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
        }
        return contract_repository_1.contractRepository.softDelete(id, userId);
    },
    updateContractStatus: async (id, status, userId) => {
        const existing = await contract_repository_1.contractRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
        }
        return contract_repository_1.contractRepository.update(id, { status, updatedBy: userId || null });
    },
    renewContract: async (id, data, userId) => {
        const existing = await contract_repository_1.contractRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
        }
        const updateData = {
            status: 'Active',
            updatedBy: userId || null,
        };
        if (data.endDate)
            updateData.endDate = new Date(data.endDate);
        if (data.value !== undefined)
            updateData.value = data.value;
        return contract_repository_1.contractRepository.update(id, updateData);
    },
};
exports.default = exports.contractService;
