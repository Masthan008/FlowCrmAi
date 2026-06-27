import { contactNoteRepository } from '../repository/contactNote.repository';
import { contactTimelineService } from './contactTimeline.service';

export const contactNoteService = {
  getNotes: async (contactId: string, search?: string) => {
    return contactNoteRepository.findByContactId(contactId, search);
  },

  createNote: async (contactId: string, data: any, userId?: string) => {
    const note = await contactNoteRepository.create({
      contactId,
      content: data.content,
      title: data.title || null,
      isPinned: data.isPinned || false,
      createdBy: userId || null,
    });

    // Log to timeline
    await contactTimelineService.logEvent({
      contactId,
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
    const existing = await contactNoteRepository.findById(noteId);
    if (!existing) {
      throw Object.assign(new Error('Note not found'), { statusCode: 404 });
    }

    return contactNoteRepository.update(noteId, {
      content: data.content,
      title: data.title || null,
      isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned,
      updatedBy: userId || null,
    });
  },

  deleteNote: async (noteId: string, userId?: string) => {
    const existing = await contactNoteRepository.findById(noteId);
    if (!existing) {
      throw Object.assign(new Error('Note not found'), { statusCode: 404 });
    }
    await contactNoteRepository.softDelete(noteId, userId || null);
    
    // Log to timeline
    await contactTimelineService.logEvent({
      contactId: existing.contactId,
      type: 'NOTE_DELETED',
      title: 'Note Deleted',
      description: existing.title ? `Deleted note: "${existing.title}"` : 'Deleted a note',
      icon: 'Trash2',
      color: '#EF4444',
      createdBy: userId || 'system',
    });

    return { success: true };
  }
};

export default contactNoteService;
