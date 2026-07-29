import { contractRepository } from '../repository/contract.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const contractService = {
  getContracts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    customerId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ContractWhereInput = {
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
      contractRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      contractRepository.count(where),
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

  getContractById: async (id: string) => {
    const contract = await contractRepository.findById(id);
    if (!contract || contract.deletedAt) {
      throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
    }
    return contract;
  },

  createContract: async (
    data: {
      name?: string;
      title?: string;
      description?: string;
      type: string;
      status?: string;
      customerId: string;
      startDate: string;
      endDate?: string;
      value?: number;
      contractNumber?: string;
    },
    userId?: string
  ) => {
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
      }
    }

    const title = data.title || data.name || 'Untitled Contract';
    const contractNumber = data.contractNumber || `CTR-${Date.now()}`;

    return contractRepository.create({
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

  updateContract: async (
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      type: string;
      status: string;
      customerId: string;
      startDate: string;
      endDate: string | null;
      value: number;
    }>,
    userId?: string
  ) => {
    const existing = await contractRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    return contractRepository.update(id, updateData);
  },

  deleteContract: async (id: string, userId?: string) => {
    const existing = await contractRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
    }
    return contractRepository.softDelete(id, userId);
  },

  updateContractStatus: async (id: string, status: string, userId?: string) => {
    const existing = await contractRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
    }
    return contractRepository.update(id, { status, updatedBy: userId || null });
  },

  renewContract: async (
    id: string,
    data: { endDate: string; value?: number },
    userId?: string
  ) => {
    const existing = await contractRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Contract not found'), { statusCode: 404 });
    }

    const updateData: any = {
      status: 'Active',
      updatedBy: userId || null,
    };
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.value !== undefined) updateData.value = data.value;

    return contractRepository.update(id, updateData);
  },
};

export default contractService;
