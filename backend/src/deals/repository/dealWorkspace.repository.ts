import { prisma } from '../../database/db';

export const dealWorkspaceRepository = {
  // NOTES
  findNotesByDealId: async (dealId: string, search?: string) => {
    return prisma.dealNote.findMany({
      where: {
        dealId,
        deletedAt: null,
        ...(search && {
          OR: [
            { content: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  },

  findNoteById: async (id: string) => {
    return prisma.dealNote.findFirst({
      where: { id, deletedAt: null }
    });
  },

  createNote: async (data: { dealId: string; title?: string; content: string; createdBy?: string }) => {
    return prisma.dealNote.create({ data });
  },

  updateNote: async (id: string, data: { title?: string; content?: string; isPinned?: boolean; updatedBy?: string }) => {
    return prisma.dealNote.update({
      where: { id },
      data,
    });
  },

  deleteNote: async (id: string, deletedBy?: string) => {
    return prisma.dealNote.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },

  // ACTIVITIES
  findActivitiesByDealId: async (dealId: string, filters: { type?: string; priority?: string; status?: string; search?: string }) => {
    const { type, priority, status, search } = filters;
    return prisma.dealActivity.findMany({
      where: {
        dealId,
        deletedAt: null,
        ...(type && { type }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { activityDate: 'desc' },
    });
  },

  findActivityById: async (id: string) => {
    return prisma.dealActivity.findFirst({
      where: { id, deletedAt: null }
    });
  },

  createActivity: async (data: any) => {
    return prisma.dealActivity.create({
      data,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  updateActivity: async (id: string, data: any) => {
    return prisma.dealActivity.update({
      where: { id },
      data,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  deleteActivity: async (id: string, deletedBy?: string) => {
    return prisma.dealActivity.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },

  // FILES
  findFilesByDealId: async (dealId: string, search?: string) => {
    return prisma.dealFile.findMany({
      where: {
        dealId,
        deletedAt: null,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findFileById: async (id: string) => {
    return prisma.dealFile.findFirst({
      where: { id, deletedAt: null }
    });
  },

  createFile: async (data: { dealId: string; name: string; path: string; mimeType: string; size: number; createdBy?: string }) => {
    return prisma.dealFile.create({ data });
  },

  deleteFile: async (id: string, deletedBy?: string) => {
    return prisma.dealFile.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },

  // TIMELINE
  findTimelineByDealId: async (dealId: string, search?: string) => {
    return prisma.dealTimeline.findMany({
      where: {
        dealId,
        deletedAt: null,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { eventDate: 'desc' },
    });
  },

  createTimelineEntry: async (data: { dealId: string; type: string; title: string; description?: string; icon?: string; color?: string; createdBy?: string }) => {
    return prisma.dealTimeline.create({ data });
  },

  // HISTORY
  findHistoryByDealId: async (dealId: string, search?: string) => {
    return prisma.dealHistory.findMany({
      where: {
        dealId,
        deletedAt: null,
        ...(search && {
          OR: [
            { action: { contains: search, mode: 'insensitive' } },
            { fieldName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  createHistoryEntry: async (data: { dealId: string; action: string; fieldName?: string; oldValue?: string; newValue?: string; userId?: string; createdBy?: string }) => {
    return prisma.dealHistory.create({ data });
  },

  // PRODUCTS
  findProductsByDealId: async (dealId: string, search?: string) => {
    const items = await prisma.dealProduct.findMany({
      where: {
        dealId,
        deletedAt: null,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Seed dummy products for MVP if empty to display dynamic layout
    if (items.length === 0 && !search) {
      await prisma.dealProduct.createMany({
        data: [
          { dealId, name: 'Enterprise CRM License', sku: 'CRM-ENT-101', quantity: 25, unitPrice: 120.00, discount: 500.00, tax: 200.00, subtotal: 3000.00, total: 2700.00, createdBy: 'system' },
          { dealId, name: 'AI Prediction Module Integration', sku: 'CRM-AI-440', quantity: 1, unitPrice: 1500.00, discount: 0.00, tax: 150.00, subtotal: 1500.00, total: 1650.00, createdBy: 'system' }
        ]
      });
      return prisma.dealProduct.findMany({ where: { dealId, deletedAt: null } });
    }
    return items;
  },

  // QUOTES
  findQuotesByDealId: async (dealId: string, search?: string) => {
    const items = await prisma.dealQuote.findMany({
      where: {
        dealId,
        deletedAt: null,
        ...(search && { quoteNumber: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Seed dummy quotes for MVP if empty to display dynamic layout
    if (items.length === 0 && !search) {
      await prisma.dealQuote.create({
        data: {
          dealId,
          quoteNumber: `QT-DEAL-${dealId.substring(0, 4).toUpperCase()}-01`,
          version: '1.0',
          status: 'sent',
          amount: 4350.00,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdBy: 'system'
        }
      });
      return prisma.dealQuote.findMany({ where: { dealId, deletedAt: null } });
    }
    return items;
  },
};
