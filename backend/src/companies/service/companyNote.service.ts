import { companyNoteRepository } from '../repository/companyNote.repository';
import { companyTimelineService } from './companyTimeline.service';

export const companyNoteService = {
  getNotes: async (companyId: string) => {
    return companyNoteRepository.findByCompanyId(companyId);
  },

  createNote: async (companyId: string, data: any, userId?: string) => {
    const note = await companyNoteRepository.create({
      companyId,
      content: data.content,
      title: data.title || null,
      isPinned: data.isPinned || false,
      createdBy: userId || null,
    });

    await companyTimelineService.logEvent({
      companyId,
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
    const existing = await companyNoteRepository.findById(noteId);
    if (!existing) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
    return companyNoteRepository.update(noteId, {
      content: data.content,
      title: data.title || null,
      isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned,
      updatedBy: userId || null,
    });
  },

  deleteNote: async (noteId: string, userId?: string) => {
    const existing = await companyNoteRepository.findById(noteId);
    if (!existing) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
    return companyNoteRepository.softDelete(noteId, userId || null);
  },
};
