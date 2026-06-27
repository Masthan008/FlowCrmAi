import { contactFileRepository } from '../repository/contactFile.repository';
import { contactTimelineService } from './contactTimeline.service';

export const contactFileService = {
  getFiles: async (contactId: string, search?: string) => {
    return contactFileRepository.findByContactId(contactId, search);
  },

  createFile: async (contactId: string, data: any, userId?: string) => {
    const file = await contactFileRepository.create({
      contactId,
      name: data.name,
      path: data.path || `/uploads/${data.name}`,
      mimeType: data.mimeType || 'application/pdf',
      size: data.size || 1024 * 1024,
      createdBy: userId || null,
    });

    // Log to timeline
    await contactTimelineService.logEvent({
      contactId,
      type: 'DOCUMENT_UPLOADED',
      title: 'Document Uploaded',
      description: `Uploaded document: "${data.name}"`,
      icon: 'FileText',
      color: '#10B981',
      createdBy: userId || 'system',
    });

    return file;
  },

  deleteFile: async (fileId: string, userId?: string) => {
    const existing = await contactFileRepository.findById(fileId);
    if (!existing) {
      throw Object.assign(new Error('File not found'), { statusCode: 404 });
    }
    await contactFileRepository.softDelete(fileId, userId || null);

    // Log to timeline
    await contactTimelineService.logEvent({
      contactId: existing.contactId,
      type: 'DOCUMENT_DELETED',
      title: 'Document Deleted',
      description: `Deleted document: "${existing.name}"`,
      icon: 'Trash2',
      color: '#EF4444',
      createdBy: userId || 'system',
    });

    return { success: true };
  }
};

export default contactFileService;
