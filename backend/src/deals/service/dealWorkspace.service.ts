import { dealWorkspaceRepository } from '../repository/dealWorkspace.repository';
import { dealRepository } from '../repository/deal.repository';

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

  // QUOTES
  getQuotes: async (dealId: string, search?: string) => {
    return dealWorkspaceRepository.findQuotesByDealId(dealId, search);
  },
};
