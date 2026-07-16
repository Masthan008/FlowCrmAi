import { assetRepository } from '../repository/asset.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const assetService = {
  getAssets: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    assignedToId?: string;
    search?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {
      deletedAt: null,
    };

    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;
    if (params.assignedToId) where.assignedToId = params.assignedToId;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { serialNumber: { contains: params.search, mode: 'insensitive' } },
        { assetTag: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      assetRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      assetRepository.count(where),
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

  getAssetById: async (id: string) => {
    const asset = await assetRepository.findById(id);
    if (!asset || asset.deletedAt) {
      throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    }
    return asset;
  },

  createAsset: async (
    data: {
      name: string;
      type?: string;
      serialNumber?: string | null;
      assetTag?: string | null;
      description?: string | null;
      purchaseDate?: string | null;
      purchasePrice?: number;
      currentValue?: number;
      currency?: string;
      warrantyExpiry?: string | null;
      location?: string | null;
      vendor?: string | null;
      notes?: string | null;
      tags?: string[];
    },
    userId?: string
  ) => {
    const createData: any = { ...data, createdBy: userId || null };
    if (data.purchaseDate) createData.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) createData.warrantyExpiry = new Date(data.warrantyExpiry);

    return assetRepository.create(createData);
  },

  updateAsset: async (
    id: string,
    data: Partial<{
      name: string;
      type: string;
      serialNumber: string | null;
      assetTag: string | null;
      description: string | null;
      purchaseDate: string | null;
      purchasePrice: number;
      currentValue: number;
      currency: string;
      warrantyExpiry: string | null;
      location: string | null;
      status: string;
      vendor: string | null;
      notes: string | null;
      tags: string[];
    }>,
    userId?: string
  ) => {
    const existing = await assetRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) updateData.warrantyExpiry = new Date(data.warrantyExpiry);

    return assetRepository.update(id, updateData);
  },

  deleteAsset: async (id: string, userId?: string) => {
    const existing = await assetRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    }
    return assetRepository.softDelete(id, userId);
  },

  assignAsset: async (
    id: string,
    data: { assignedToId?: string | null; customerId?: string | null },
    userId?: string
  ) => {
    const existing = await assetRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    }

    if (data.assignedToId) {
      const employee = await prisma.employee.findUnique({ where: { id: data.assignedToId } });
      if (!employee) {
        throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
      }
    }

    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
      }
    }

    return assetRepository.update(id, {
      ...data,
      status: 'Active',
      updatedBy: userId || null,
    });
  },

  retireAsset: async (id: string, userId?: string) => {
    const existing = await assetRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    }

    return assetRepository.update(id, {
      status: 'Retired',
      updatedBy: userId || null,
    });
  },
};

export default assetService;
