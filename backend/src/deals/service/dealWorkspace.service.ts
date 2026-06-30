import { dealWorkspaceRepository } from '../repository/dealWorkspace.repository';
import { dealRepository } from '../repository/deal.repository';
import { prisma } from '../../database/db';

export const dealWorkspaceService = {
  // PROFILE DETAILS
  getProfile: async (dealId: string) => {
    const deal = await dealRepository.findByIdWithRelations(dealId);
    if (!deal) {
      throw { statusCode: 404, message: 'Deal opportunity not found.' };
    }
    return deal;
  },

  // TIMELINE
  getTimeline: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findTimelineByDealId(dealId, search);
  },

  // NOTES
  getNotes: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findNotesByDealId(dealId, search);
  },

  createNote: async (dealId: string, data: { title?: string; content: string; createdBy?: string }) => {
    const note = await dealWorkspaceRepository.createNote({ dealId, ...data });
    
    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId,
      type: 'NOTE_ADDED',
      title: 'New note compiled',
      description: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
      icon: 'FileText',
      color: 'amber',
      createdBy: data.createdBy
    });

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId,
      action: 'Note Added',
      fieldName: 'deal_notes',
      newValue: data.content.substring(0, 100),
      userId: note.id,
      createdBy: data.createdBy
    });

    return note;
  },

  updateNote: async (noteId: string, data: { title?: string; content?: string; isPinned?: boolean; updatedBy?: string }) => {
    const existing = await dealWorkspaceRepository.findNoteById(noteId);
    if (!existing) throw { statusCode: 404, message: 'Note not found.' };

    const updated = await dealWorkspaceRepository.updateNote(noteId, data);

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId: existing.dealId,
      action: 'Note Edited',
      fieldName: 'deal_notes',
      oldValue: existing.content.substring(0, 50),
      newValue: data.content?.substring(0, 50),
      userId: noteId,
      createdBy: data.updatedBy
    });

    return updated;
  },

  deleteNote: async (noteId: string, deletedBy?: string) => {
    const existing = await dealWorkspaceRepository.findNoteById(noteId);
    if (!existing) throw { statusCode: 404, message: 'Note not found.' };

    await dealWorkspaceRepository.deleteNote(noteId, deletedBy);

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId: existing.dealId,
      action: 'Note Deleted',
      fieldName: 'deal_notes',
      oldValue: existing.content.substring(0, 50),
      userId: noteId,
      createdBy: deletedBy
    });
  },

  // ACTIVITIES
  getActivities: async (dealId: string, filters: { type?: string; priority?: string; status?: string; search?: string }) => {
    return dealWorkspaceRepository.findActivitiesByDealId(dealId, filters);
  },

  createActivity: async (dealId: string, data: any, createdBy?: string) => {
    const activity = await dealWorkspaceRepository.createActivity({ ...data, dealId, createdBy });

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId,
      type: 'ACTIVITY_CREATED',
      title: `Activity scheduled: ${data.title}`,
      description: data.description || `Type: ${data.type}`,
      icon: 'Calendar',
      color: 'indigo',
      createdBy
    });

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId,
      action: 'Activity Created',
      fieldName: 'deal_activities',
      newValue: data.title,
      userId: activity.id,
      createdBy
    });

    return activity;
  },

  updateActivity: async (activityId: string, data: any, updatedBy?: string) => {
    const existing = await dealWorkspaceRepository.findActivityById(activityId);
    if (!existing) throw { statusCode: 404, message: 'Activity not found.' };

    const updated = await dealWorkspaceRepository.updateActivity(activityId, { ...data, updatedBy });

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId: existing.dealId,
      action: 'Activity Updated',
      fieldName: 'deal_activities',
      oldValue: existing.title,
      newValue: data.title,
      userId: activityId,
      createdBy: updatedBy
    });

    return updated;
  },

  deleteActivity: async (activityId: string, deletedBy?: string) => {
    const existing = await dealWorkspaceRepository.findActivityById(activityId);
    if (!existing) throw { statusCode: 404, message: 'Activity not found.' };

    await dealWorkspaceRepository.deleteActivity(activityId, deletedBy);

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId: existing.dealId,
      action: 'Activity Deleted',
      fieldName: 'deal_activities',
      oldValue: existing.title,
      userId: activityId,
      createdBy: deletedBy
    });
  },

  // FILES
  getFiles: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findFilesByDealId(dealId, search);
  },

  createFile: async (dealId: string, fileData: { name: string; path: string; mimeType: string; size: number }, createdBy?: string) => {
    const file = await dealWorkspaceRepository.createFile({ dealId, ...fileData, createdBy });

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId,
      type: 'FILE_UPLOADED',
      title: `File attached: ${fileData.name}`,
      description: `Format: ${fileData.mimeType} (${Math.round(fileData.size / 1024)} KB)`,
      icon: 'Paperclip',
      color: 'blue',
      createdBy
    });

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId,
      action: 'File Attached',
      fieldName: 'deal_files',
      newValue: fileData.name,
      userId: file.id,
      createdBy
    });

    return file;
  },

  deleteFile: async (fileId: string, deletedBy?: string) => {
    const existing = await dealWorkspaceRepository.findFileById(fileId);
    if (!existing) throw { statusCode: 404, message: 'Attachment not found.' };

    await dealWorkspaceRepository.deleteFile(fileId, deletedBy);

    // Log history
    await dealWorkspaceRepository.createHistoryEntry({
      dealId: existing.dealId,
      action: 'File Detached',
      fieldName: 'deal_files',
      oldValue: existing.name,
      userId: fileId,
      createdBy: deletedBy
    });
  },

  // HISTORY
  getHistory: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findHistoryByDealId(dealId, search);
  },

  // PRODUCTS
  getProducts: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findProductsByDealId(dealId, search);
  },

  addProductLine: async (dealId: string, data: any, createdBy?: string) => {
    // Pricing engine calculations
    const subtotal = data.unitPrice * data.quantity;
    const total = subtotal - (data.discount || 0) + (data.tax || 0);

    const prod = await dealWorkspaceRepository.addProductLine({
      dealId,
      name: data.name,
      sku: data.sku,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discount: data.discount || 0,
      tax: data.tax || 0,
      subtotal,
      total,
      createdBy
    });

    // Recalculate Deal Total Value
    await recalculateDealValue(dealId);

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId,
      type: 'PRODUCT_ADDED',
      title: `Product mapped: ${data.name}`,
      description: `SKU: ${data.sku || '-'} (Qty: ${data.quantity} × $${data.unitPrice.toFixed(2)})`,
      icon: 'Sparkles',
      color: 'emerald',
      createdBy
    });

    return prod;
  },

  updateProductLine: async (productId: string, data: any, updatedBy?: string) => {
    const existing = await dealWorkspaceRepository.findProductById(productId);
    if (!existing) throw { statusCode: 404, message: 'Product line not found.' };

    const qty = data.quantity !== undefined ? data.quantity : existing.quantity;
    const unitPrice = data.unitPrice !== undefined ? data.unitPrice : existing.unitPrice;
    const discount = data.discount !== undefined ? data.discount : existing.discount;
    const tax = data.tax !== undefined ? data.tax : existing.tax;

    const subtotal = unitPrice * qty;
    const total = subtotal - discount + tax;

    const updated = await dealWorkspaceRepository.updateProductLine(productId, {
      quantity: qty,
      unitPrice,
      discount,
      tax,
      subtotal,
      total,
      updatedBy
    });

    // Recalculate Deal Total Value
    await recalculateDealValue(existing.dealId);

    return updated;
  },

  deleteProductLine: async (productId: string, deletedBy?: string) => {
    const existing = await dealWorkspaceRepository.findProductById(productId);
    if (!existing) throw { statusCode: 404, message: 'Product line not found.' };

    await dealWorkspaceRepository.deleteProductLine(productId, deletedBy);

    // Recalculate Deal Total Value
    await recalculateDealValue(existing.dealId);

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId: existing.dealId,
      type: 'PRODUCT_REMOVED',
      title: `Product removed: ${existing.name}`,
      icon: 'Trash2',
      color: 'red',
      createdBy: deletedBy
    });
  },

  // QUOTES
  getQuotes: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findQuotesByDealId(dealId, search);
  },

  createQuote: async (dealId: string, data: any, createdBy?: string) => {
    const quote = await dealWorkspaceRepository.createQuote({
      dealId,
      quoteNumber: data.quoteNumber,
      version: data.version || '1.0',
      status: data.status || 'draft',
      amount: data.amount || 0.0,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      createdBy
    });

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId,
      type: 'QUOTE_CREATED',
      title: `New quote prepared: ${data.quoteNumber}`,
      description: `Amount: $${(data.amount || 0).toLocaleString()} (v${data.version || '1.0'})`,
      icon: 'DollarSign',
      color: 'indigo',
      createdBy
    });

    return quote;
  },

  updateQuote: async (quoteId: string, data: any, updatedBy?: string) => {
    const updated = await dealWorkspaceRepository.updateQuote(quoteId, {
      ...data,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      updatedBy
    });
    return updated;
  },

  approveQuote: async (quoteId: string, updatedBy?: string) => {
    const existing = await dealWorkspaceRepository.findQuoteById(quoteId);
    if (!existing) throw { statusCode: 404, message: 'Quote not found.' };

    const approved = await dealWorkspaceRepository.approveQuote(quoteId, updatedBy);

    // Create Approval record
    await prisma.dealApproval.create({
      data: {
        dealId: existing.dealId,
        type: 'Quote Approval',
        status: 'Approved',
        approverId: updatedBy,
        comments: 'Approved instantly via commercial center.',
        approvedAt: new Date()
      }
    });

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId: existing.dealId,
      type: 'QUOTE_APPROVED',
      title: `Quote approved: ${existing.quoteNumber}`,
      icon: 'CheckCircle2',
      color: 'emerald',
      createdBy: updatedBy
    });

    return approved;
  },

  rejectQuote: async (quoteId: string, updatedBy?: string) => {
    const existing = await dealWorkspaceRepository.findQuoteById(quoteId);
    if (!existing) throw { statusCode: 404, message: 'Quote not found.' };

    const rejected = await dealWorkspaceRepository.rejectQuote(quoteId, updatedBy);

    // Create Approval record
    await prisma.dealApproval.create({
      data: {
        dealId: existing.dealId,
        type: 'Quote Approval',
        status: 'Rejected',
        approverId: updatedBy,
        comments: 'Rejected via commercial center.'
      }
    });

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId: existing.dealId,
      type: 'QUOTE_REJECTED',
      title: `Quote rejected: ${existing.quoteNumber}`,
      icon: 'XCircle',
      color: 'red',
      createdBy: updatedBy
    });

    return rejected;
  },

  // COMPETITORS
  getCompetitors: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findCompetitorsByDealId(dealId, search);
  },

  createCompetitor: async (dealId: string, data: any, createdBy?: string) => {
    const comp = await dealWorkspaceRepository.createCompetitor({
      dealId,
      name: data.name,
      product: data.product,
      pricing: data.pricing ? parseFloat(data.pricing) : undefined,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      status: data.status || 'Active',
      marketPosition: data.marketPosition,
      website: data.website,
      notes: data.notes,
      createdBy
    });

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId,
      type: 'COMPETITOR_ADDED',
      title: `Competitor tracked: ${data.name}`,
      description: `Product: ${data.product || '-'} &bull; Status: ${data.status || 'Active'}`,
      icon: 'ShieldAlert',
      color: 'orange',
      createdBy
    });

    return comp;
  },

  // COLLABORATION COMMENTS
  getCollaboration: async (dealId: string) => {
    const comments = await dealWorkspaceRepository.findCommentsByDealId(dealId);
    const team = await dealWorkspaceRepository.findTeamMembersByDealId(dealId);
    return { comments, team };
  },

  createComment: async (dealId: string, data: any, createdBy?: string) => {
    const comment = await dealWorkspaceRepository.createComment({
      dealId,
      comment: data.comment,
      employeeId: data.employeeId,
      parentId: data.parentId,
      isPinned: data.isPinned || false,
      emoji: data.emoji,
      createdBy
    });
    return comment;
  },

  // CHECKLIST
  getChecklist: async (dealId: string) => {
    return dealWorkspaceRepository.findChecklistByDealId(dealId);
  },

  updateChecklistItem: async (itemId: string, isCompleted: boolean, completedBy?: string) => {
    const existing = await dealWorkspaceRepository.findChecklistItemById(itemId);
    if (!existing) throw { statusCode: 404, message: 'Checklist item not found.' };

    const updated = await dealWorkspaceRepository.updateChecklistItem(itemId, isCompleted, completedBy);

    // Log timeline
    if (isCompleted) {
      await dealWorkspaceRepository.createTimelineEntry({
        dealId: existing.dealId,
        type: 'CHECKLIST_COMPLETED',
        title: `Task completed: ${existing.name}`,
        icon: 'CheckCircle2',
        color: 'emerald',
        createdBy: completedBy
      });
    }

    return updated;
  },

  // NEGOTIATIONS
  getNegotiations: async (dealId: string) => {
    return dealWorkspaceRepository.findNegotiationsByDealId(dealId);
  },

  createNegotiation: async (dealId: string, data: any, createdBy?: string) => {
    const round = await dealWorkspaceRepository.createNegotiation({
      dealId,
      round: data.round,
      currentOffer: data.currentOffer,
      counterOffer: data.counterOffer,
      discountPercent: data.discountPercent,
      requestedChanges: data.requestedChanges,
      notes: data.notes,
      nextMeeting: data.nextMeeting ? new Date(data.nextMeeting) : undefined,
      status: data.status || 'Active',
      createdBy
    });

    // Log timeline
    await dealWorkspaceRepository.createTimelineEntry({
      dealId,
      type: 'NEGOTIATION_ROUND',
      title: `Negotiation Round ${data.round} logged`,
      description: `Offer: $${data.currentOffer} &bull; Counter: $${data.counterOffer || '-'}`,
      icon: 'Clock',
      color: 'blue',
      createdBy
    });

    return round;
  },
};

// RECAlCULATE DEAL VALUE HELPER
async function recalculateDealValue(dealId: string) {
  const products = await prisma.dealProduct.findMany({
    where: { dealId, deletedAt: null }
  });
  const grandTotal = products.reduce((sum: number, p: any) => sum + p.total, 0);
  await prisma.deal.update({
    where: { id: dealId },
    data: { value: grandTotal, expectedRevenue: grandTotal }
  });
}

