"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealWorkspaceService = void 0;
const dealWorkspace_repository_1 = require("../repository/dealWorkspace.repository");
const deal_repository_1 = require("../repository/deal.repository");
const db_1 = require("../../database/db");
exports.dealWorkspaceService = {
    // PROFILE DETAILS
    getProfile: async (dealId) => {
        const deal = await deal_repository_1.dealRepository.findByIdWithRelations(dealId);
        if (!deal) {
            throw { statusCode: 404, message: 'Deal opportunity not found.' };
        }
        return deal;
    },
    // TIMELINE
    getTimeline: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findTimelineByDealId(dealId, search);
    },
    // NOTES
    getNotes: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findNotesByDealId(dealId, search);
    },
    createNote: async (dealId, data) => {
        const note = await dealWorkspace_repository_1.dealWorkspaceRepository.createNote({ dealId, ...data });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId,
            type: 'NOTE_ADDED',
            title: 'New note compiled',
            description: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
            icon: 'FileText',
            color: 'amber',
            createdBy: data.createdBy
        });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId,
            action: 'Note Added',
            fieldName: 'deal_notes',
            newValue: data.content.substring(0, 100),
            userId: note.id,
            createdBy: data.createdBy
        });
        return note;
    },
    updateNote: async (noteId, data) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findNoteById(noteId);
        if (!existing)
            throw { statusCode: 404, message: 'Note not found.' };
        const updated = await dealWorkspace_repository_1.dealWorkspaceRepository.updateNote(noteId, data);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
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
    deleteNote: async (noteId, deletedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findNoteById(noteId);
        if (!existing)
            throw { statusCode: 404, message: 'Note not found.' };
        await dealWorkspace_repository_1.dealWorkspaceRepository.deleteNote(noteId, deletedBy);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'Note Deleted',
            fieldName: 'deal_notes',
            oldValue: existing.content.substring(0, 50),
            userId: noteId,
            createdBy: deletedBy
        });
    },
    // ACTIVITIES
    getActivities: async (dealId, filters) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findActivitiesByDealId(dealId, filters);
    },
    createActivity: async (dealId, data, createdBy) => {
        const activity = await dealWorkspace_repository_1.dealWorkspaceRepository.createActivity({ ...data, dealId, createdBy });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId,
            type: 'ACTIVITY_CREATED',
            title: `Activity scheduled: ${data.title}`,
            description: data.description || `Type: ${data.type}`,
            icon: 'Calendar',
            color: 'indigo',
            createdBy
        });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId,
            action: 'Activity Created',
            fieldName: 'deal_activities',
            newValue: data.title,
            userId: activity.id,
            createdBy
        });
        return activity;
    },
    updateActivity: async (activityId, data, updatedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findActivityById(activityId);
        if (!existing)
            throw { statusCode: 404, message: 'Activity not found.' };
        const updated = await dealWorkspace_repository_1.dealWorkspaceRepository.updateActivity(activityId, { ...data, updatedBy });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
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
    deleteActivity: async (activityId, deletedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findActivityById(activityId);
        if (!existing)
            throw { statusCode: 404, message: 'Activity not found.' };
        await dealWorkspace_repository_1.dealWorkspaceRepository.deleteActivity(activityId, deletedBy);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'Activity Deleted',
            fieldName: 'deal_activities',
            oldValue: existing.title,
            userId: activityId,
            createdBy: deletedBy
        });
    },
    // FILES
    getFiles: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findFilesByDealId(dealId, search);
    },
    createFile: async (dealId, fileData, createdBy) => {
        const file = await dealWorkspace_repository_1.dealWorkspaceRepository.createFile({ dealId, ...fileData, createdBy });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId,
            type: 'FILE_UPLOADED',
            title: `File attached: ${fileData.name}`,
            description: `Format: ${fileData.mimeType} (${Math.round(fileData.size / 1024)} KB)`,
            icon: 'Paperclip',
            color: 'blue',
            createdBy
        });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId,
            action: 'File Attached',
            fieldName: 'deal_files',
            newValue: fileData.name,
            userId: file.id,
            createdBy
        });
        return file;
    },
    deleteFile: async (fileId, deletedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findFileById(fileId);
        if (!existing)
            throw { statusCode: 404, message: 'Attachment not found.' };
        await dealWorkspace_repository_1.dealWorkspaceRepository.deleteFile(fileId, deletedBy);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'File Detached',
            fieldName: 'deal_files',
            oldValue: existing.name,
            userId: fileId,
            createdBy: deletedBy
        });
    },
    // HISTORY
    getHistory: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findHistoryByDealId(dealId, search);
    },
    // PRODUCTS
    getProducts: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findProductsByDealId(dealId, search);
    },
    addProductLine: async (dealId, data, createdBy) => {
        // Pricing engine calculations
        const subtotal = data.unitPrice * data.quantity;
        const total = subtotal - (data.discount || 0) + (data.tax || 0);
        const prod = await dealWorkspace_repository_1.dealWorkspaceRepository.addProductLine({
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
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
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
    updateProductLine: async (productId, data, updatedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findProductById(productId);
        if (!existing)
            throw { statusCode: 404, message: 'Product line not found.' };
        const qty = data.quantity !== undefined ? data.quantity : existing.quantity;
        const unitPrice = data.unitPrice !== undefined ? data.unitPrice : existing.unitPrice;
        const discount = data.discount !== undefined ? data.discount : existing.discount;
        const tax = data.tax !== undefined ? data.tax : existing.tax;
        const subtotal = unitPrice * qty;
        const total = subtotal - discount + tax;
        const updated = await dealWorkspace_repository_1.dealWorkspaceRepository.updateProductLine(productId, {
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
    deleteProductLine: async (productId, deletedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findProductById(productId);
        if (!existing)
            throw { statusCode: 404, message: 'Product line not found.' };
        await dealWorkspace_repository_1.dealWorkspaceRepository.deleteProductLine(productId, deletedBy);
        // Recalculate Deal Total Value
        await recalculateDealValue(existing.dealId);
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId: existing.dealId,
            type: 'PRODUCT_REMOVED',
            title: `Product removed: ${existing.name}`,
            icon: 'Trash2',
            color: 'red',
            createdBy: deletedBy
        });
    },
    // QUOTES
    getQuotes: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findQuotesByDealId(dealId, search);
    },
    createQuote: async (dealId, data, createdBy) => {
        const quote = await dealWorkspace_repository_1.dealWorkspaceRepository.createQuote({
            dealId,
            quoteNumber: data.quoteNumber,
            version: data.version || '1.0',
            status: data.status || 'draft',
            amount: data.amount || 0.0,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            createdBy
        });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
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
    updateQuote: async (quoteId, data, updatedBy) => {
        const updated = await dealWorkspace_repository_1.dealWorkspaceRepository.updateQuote(quoteId, {
            ...data,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            updatedBy
        });
        return updated;
    },
    approveQuote: async (quoteId, updatedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findQuoteById(quoteId);
        if (!existing)
            throw { statusCode: 404, message: 'Quote not found.' };
        const approved = await dealWorkspace_repository_1.dealWorkspaceRepository.approveQuote(quoteId, updatedBy);
        // Create Approval record
        await db_1.prisma.dealApproval.create({
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
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId: existing.dealId,
            type: 'QUOTE_APPROVED',
            title: `Quote approved: ${existing.quoteNumber}`,
            icon: 'CheckCircle2',
            color: 'emerald',
            createdBy: updatedBy
        });
        return approved;
    },
    rejectQuote: async (quoteId, updatedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findQuoteById(quoteId);
        if (!existing)
            throw { statusCode: 404, message: 'Quote not found.' };
        const rejected = await dealWorkspace_repository_1.dealWorkspaceRepository.rejectQuote(quoteId, updatedBy);
        // Create Approval record
        await db_1.prisma.dealApproval.create({
            data: {
                dealId: existing.dealId,
                type: 'Quote Approval',
                status: 'Rejected',
                approverId: updatedBy,
                comments: 'Rejected via commercial center.'
            }
        });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
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
    getCompetitors: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findCompetitorsByDealId(dealId, search);
    },
    createCompetitor: async (dealId, data, createdBy) => {
        const comp = await dealWorkspace_repository_1.dealWorkspaceRepository.createCompetitor({
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
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
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
    getCollaboration: async (dealId) => {
        const comments = await dealWorkspace_repository_1.dealWorkspaceRepository.findCommentsByDealId(dealId);
        const team = await dealWorkspace_repository_1.dealWorkspaceRepository.findTeamMembersByDealId(dealId);
        return { comments, team };
    },
    createComment: async (dealId, data, createdBy) => {
        const comment = await dealWorkspace_repository_1.dealWorkspaceRepository.createComment({
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
    getChecklist: async (dealId) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findChecklistByDealId(dealId);
    },
    updateChecklistItem: async (itemId, isCompleted, completedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findChecklistItemById(itemId);
        if (!existing)
            throw { statusCode: 404, message: 'Checklist item not found.' };
        const updated = await dealWorkspace_repository_1.dealWorkspaceRepository.updateChecklistItem(itemId, isCompleted, completedBy);
        // Log timeline
        if (isCompleted) {
            await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
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
    getNegotiations: async (dealId) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findNegotiationsByDealId(dealId);
    },
    createNegotiation: async (dealId, data, createdBy) => {
        const round = await dealWorkspace_repository_1.dealWorkspaceRepository.createNegotiation({
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
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
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
async function recalculateDealValue(dealId) {
    const products = await db_1.prisma.dealProduct.findMany({
        where: { dealId, deletedAt: null }
    });
    const grandTotal = products.reduce((sum, p) => sum + p.total, 0);
    await db_1.prisma.deal.update({
        where: { id: dealId },
        data: { value: grandTotal, expectedRevenue: grandTotal }
    });
}
