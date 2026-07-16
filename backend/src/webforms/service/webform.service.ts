import { webFormRepository } from '../repository/webform.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const webFormService = {
  getWebForms: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.WebFormWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      webFormRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      webFormRepository.count(where),
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

  getWebFormById: async (id: string) => {
    const form = await webFormRepository.findById(id);
    if (!form || form.deletedAt) {
      throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
    }
    return form;
  },

  createWebForm: async (
    data: {
      name: string;
      description?: string | null;
      fields?: any;
      submitLabel?: string;
      successMessage?: string | null;
      redirectUrl?: string | null;
      notificationEmails?: string[];
      assignToId?: string | null;
      sourceId?: string | null;
      statusId?: string | null;
    },
    userId?: string
  ) => {
    if (data.assignToId) {
      const employee = await prisma.employee.findUnique({ where: { id: data.assignToId } });
      if (!employee) {
        throw Object.assign(new Error('Assigned employee not found'), { statusCode: 400 });
      }
    }

    if (data.sourceId) {
      const source = await prisma.leadSource.findUnique({ where: { id: data.sourceId } });
      if (!source) {
        throw Object.assign(new Error('Lead source not found'), { statusCode: 400 });
      }
    }

    if (data.statusId) {
      const status = await prisma.leadStatus.findUnique({ where: { id: data.statusId } });
      if (!status) {
        throw Object.assign(new Error('Lead status not found'), { statusCode: 400 });
      }
    }

    return webFormRepository.create({
      ...data,
      fields: data.fields || [],
      submitLabel: data.submitLabel || 'Submit',
      notificationEmails: data.notificationEmails || [],
      createdBy: userId || null,
    });
  },

  updateWebForm: async (
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      fields: any;
      submitLabel: string;
      successMessage: string | null;
      redirectUrl: string | null;
      notificationEmails: string[];
      assignToId: string | null;
      sourceId: string | null;
      statusId: string | null;
    }>,
    userId?: string
  ) => {
    const existing = await webFormRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
    }

    if (data.assignToId) {
      const employee = await prisma.employee.findUnique({ where: { id: data.assignToId } });
      if (!employee) {
        throw Object.assign(new Error('Assigned employee not found'), { statusCode: 400 });
      }
    }

    return webFormRepository.update(id, {
      ...data,
      updatedBy: userId || null,
    });
  },

  deleteWebForm: async (id: string, userId?: string) => {
    const existing = await webFormRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
    }
    return webFormRepository.softDelete(id, userId);
  },

  activateForm: async (id: string, userId?: string) => {
    const existing = await webFormRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
    }
    return webFormRepository.update(id, { isActive: true, updatedBy: userId || null });
  },

  deactivateForm: async (id: string, userId?: string) => {
    const existing = await webFormRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
    }
    return webFormRepository.update(id, { isActive: false, updatedBy: userId || null });
  },

  getSubmissions: async (formId: string, params: { page?: number; limit?: number }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.WebFormSubmissionWhereInput = { formId };

    const [items, total] = await Promise.all([
      prisma.webFormSubmission.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          convertedToLead: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      prisma.webFormSubmission.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  getEmbedCode: async (id: string) => {
    const existing = await webFormRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
    }
    const embedCode = `<div data-flowcrm-form="${id}"></div><script src="https://forms.flowcrm.ai/embed.js" defer></script>`;
    return { embedCode, form: existing };
  },

  submitPublic: async (formId: string, data: { data: Record<string, any> }, ipAddress?: string, userAgent?: string) => {
    const form = await webFormRepository.findById(formId);
    if (!form || form.deletedAt || !form.isActive) {
      throw Object.assign(new Error('Form not found or inactive'), { statusCode: 404 });
    }

    return prisma.webFormSubmission.create({
      data: {
        formId,
        data: data.data || {},
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  },
};

export default webFormService;
