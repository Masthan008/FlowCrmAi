import { leadNoteRepository } from '../repository/leadNote.repository';
import { leadTimelineService } from './leadTimeline.service';

export const leadNoteService = {
  getNotes: async (leadId: string) => {
    return leadNoteRepository.findByLeadId(leadId);
  },

  createNote: async (leadId: string, data: any, userId?: string) => {
    const note = await leadNoteRepository.create({
      leadId,
      content: data.content,
      title: data.title || null,
      isPinned: data.isPinned || false,
      createdBy: userId || null,
    });

    // Log to timeline
    await leadTimelineService.logEvent({
      leadId,
      type: 'NOTE_ADDED',
      title: 'Note Added',
      description: data.title ? `Added note: "${data.title}"` : 'Added a new note',
      icon: 'FileText',
      color: '#F59E0B',
      createdBy: userId || 'system',
    });

    return note;
  },

  updateNote: async (noteId: string, data: any, userId?: string) => {
    const existing = await leadNoteRepository.findById(noteId);
    if (!existing) {
      throw Object.assign(new Error('Note not found'), { statusCode: 404 });
    }

    return leadNoteRepository.update(noteId, {
      content: data.content,
      title: data.title || null,
      isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned,
      updatedBy: userId || null,
    });
  },

  deleteNote: async (noteId: string, userId?: string) => {
    const existing = await leadNoteRepository.findById(noteId);
    if (!existing) {
      throw Object.assign(new Error('Note not found'), { statusCode: 404 });
    }
    return leadNoteRepository.softDelete(noteId, userId || null);
  }
};

export default leadNoteService;
