"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetService = void 0;
const asset_repository_1 = require("../repository/asset.repository");
const db_1 = require("../../database/db");
exports.assetService = {
    getAssets: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.type)
            where.type = params.type;
        if (params.status)
            where.status = params.status;
        if (params.assignedToId)
            where.assignedToId = params.assignedToId;
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { serialNumber: { contains: params.search, mode: 'insensitive' } },
                { assetTag: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            asset_repository_1.assetRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            asset_repository_1.assetRepository.count(where),
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
    getAssetById: async (id) => {
        const asset = await asset_repository_1.assetRepository.findById(id);
        if (!asset || asset.deletedAt) {
            throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
        }
        return asset;
    },
    createAsset: async (data, userId) => {
        const createData = { ...data, createdBy: userId || null };
        if (data.purchaseDate)
            createData.purchaseDate = new Date(data.purchaseDate);
        if (data.warrantyExpiry)
            createData.warrantyExpiry = new Date(data.warrantyExpiry);
        return asset_repository_1.assetRepository.create(createData);
    },
    updateAsset: async (id, data, userId) => {
        const existing = await asset_repository_1.assetRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.purchaseDate)
            updateData.purchaseDate = new Date(data.purchaseDate);
        if (data.warrantyExpiry)
            updateData.warrantyExpiry = new Date(data.warrantyExpiry);
        return asset_repository_1.assetRepository.update(id, updateData);
    },
    deleteAsset: async (id, userId) => {
        const existing = await asset_repository_1.assetRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
        }
        return asset_repository_1.assetRepository.softDelete(id, userId);
    },
    assignAsset: async (id, data, userId) => {
        const existing = await asset_repository_1.assetRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
        }
        if (data.assignedToId) {
            const employee = await db_1.prisma.employee.findUnique({ where: { id: data.assignedToId } });
            if (!employee) {
                throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
            }
        }
        if (data.customerId) {
            const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
            if (!customer) {
                throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
            }
        }
        return asset_repository_1.assetRepository.update(id, {
            ...data,
            status: 'Active',
            updatedBy: userId || null,
        });
    },
    retireAsset: async (id, userId) => {
        const existing = await asset_repository_1.assetRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
        }
        return asset_repository_1.assetRepository.update(id, {
            status: 'Retired',
            updatedBy: userId || null,
        });
    },
};
exports.default = exports.assetService;
