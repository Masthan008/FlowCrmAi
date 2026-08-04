import { consentLogRepository, dataRequestRepository } from '../repository/gdpr.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const gdprService = {
  getConsentLogs: async (params: {
    page?: number;
    limit?: number;
    contactId?: string;
    companyId?: string;
    type?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ConsentLogWhereInput = {};

    if (params.contactId) where.contactId = params.contactId;
    if (params.companyId) where.companyId = params.companyId;
    if (params.type) where.type = params.type;

    const [items, total] = await Promise.all([
      consentLogRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { consentDate: 'desc' },
      }),
      consentLogRepository.count(where),
    ]);

    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  recordConsent: async (data: {
    contactId?: string | null;
    companyId?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    purpose?: string | null;
    type?: string;
    granted?: boolean;
    source?: string;
    ipAddress?: string | null;
    expiresAt?: string | null;
    details?: any;
  }) => {
    if (data.contactId) {
      const contact = await prisma.contact.findUnique({ where: { id: data.contactId } });
      if (!contact) {
        data.contactId = null;
      }
    }

    if (data.companyId) {
      const company = await prisma.company.findUnique({ where: { id: data.companyId } });
      if (!company) {
        data.companyId = null;
      }
    }

    const consentType = data.type || (data.purpose ? 'Marketing' : 'Marketing');
    const sourceVal = data.source || 'Manual';

    const createData: any = {
      contactId: data.contactId || null,
      companyId: data.companyId || null,
      type: consentType,
      granted: data.granted !== undefined ? data.granted : true,
      source: sourceVal,
      ipAddress: data.ipAddress || null,
      details: {
        ...(data.details || {}),
        contactName: data.contactName || null,
        contactEmail: data.contactEmail || null,
        purpose: data.purpose || null,
      },
      consentDate: new Date(),
    };

    if (data.expiresAt) createData.expiresAt = new Date(data.expiresAt);

    return consentLogRepository.create(createData);
  },

  revokeConsent: async (id: string) => {
    const existing = await consentLogRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Consent log not found'), { statusCode: 404 });
    }

    return consentLogRepository.update(id, {
      granted: false,
      revokedAt: new Date(),
    });
  },

  getDataRequests: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.DataRequestWhereInput = {};

    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      dataRequestRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { requestedAt: 'desc' },
      }),
      dataRequestRepository.count(where),
    ]);

    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  createDataRequest: async (data: {
    contactId?: string | null;
    companyId?: string | null;
    requestorName?: string | null;
    requestorEmail?: string | null;
    type?: string;
    description?: string | null;
  }) => {
    const requestNumber = `DR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (data.contactId) {
      const contact = await prisma.contact.findUnique({ where: { id: data.contactId } });
      if (!contact) {
        data.contactId = null;
      }
    }

    if (data.companyId) {
      const company = await prisma.company.findUnique({ where: { id: data.companyId } });
      if (!company) {
        data.companyId = null;
      }
    }

    const desc = data.description || (data.requestorName ? `Request from ${data.requestorName} (${data.requestorEmail || 'N/A'})` : null);

    return dataRequestRepository.create({
      requestNumber,
      contactId: data.contactId || null,
      companyId: data.companyId || null,
      type: data.type || 'Access',
      description: desc,
      status: 'Pending',
    });
  },

  processDataRequest: async (id: string) => {
    const existing = await dataRequestRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Data request not found'), { statusCode: 404 });
    }
    if (existing.status !== 'Pending') {
      throw Object.assign(new Error('Only pending requests can be processed'), { statusCode: 400 });
    }
    return dataRequestRepository.update(id, { status: 'In Progress' });
  },

  completeDataRequest: async (id: string, responseData?: any) => {
    const existing = await dataRequestRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Data request not found'), { statusCode: 404 });
    }
    return dataRequestRepository.update(id, {
      status: 'Completed',
      completedAt: new Date(),
      responseData: responseData || null,
    });
  },

  rejectDataRequest: async (id: string) => {
    const existing = await dataRequestRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Data request not found'), { statusCode: 404 });
    }
    if (existing.status === 'Completed') {
      throw Object.assign(new Error('Cannot reject a completed request'), { statusCode: 400 });
    }
    return dataRequestRepository.update(id, { status: 'Rejected' });
  },
};

export default gdprService;
