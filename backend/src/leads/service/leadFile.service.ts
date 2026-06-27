import { leadFileRepository } from '../repository/leadFile.repository';
import { leadTimelineService } from './leadTimeline.service';
import { config } from '../../config';
import fs from 'fs';
import path from 'path';

export const leadFileService = {
  getFiles: async (leadId: string) => {
    return leadFileRepository.findByLeadId(leadId);
  },

  getStorageSummary: async (leadId: string) => {
    return leadFileRepository.getStorageSummary(leadId);
  },

  createFile: async (leadId: string, fileData: Express.Multer.File, userId?: string) => {
    const file = await leadFileRepository.create({
      leadId,
      name: fileData.originalname,
      path: fileData.filename, // Multer unique disk filename
      mimeType: fileData.mimetype,
      size: fileData.size,
      createdBy: userId || null,
    });

    // Log to timeline
    await leadTimelineService.logEvent({
      leadId,
      type: 'FILE_UPLOADED',
      title: 'File Uploaded',
      description: `Uploaded file: "${fileData.originalname}" (${(fileData.size / 1024).toFixed(1)} KB)`,
      icon: 'Paperclip',
      color: '#10B981',
      createdBy: userId || 'system',
    });

    return file;
  },

  deleteFile: async (fileId: string, userId?: string) => {
    const existing = await leadFileRepository.findById(fileId);
    if (!existing) {
      throw Object.assign(new Error('File not found'), { statusCode: 404 });
    }

    // Soft delete in DB
    const result = await leadFileRepository.softDelete(fileId, userId || null);

    // Physically delete from disk if it exists
    try {
      const filePath = path.join(config.uploadPath, existing.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error deleting physical file from disk', err);
    }

    // Log to timeline
    await leadTimelineService.logEvent({
      leadId: existing.leadId,
      type: 'FILE_DELETED',
      title: 'File Deleted',
      description: `Deleted file: "${existing.name}"`,
      icon: 'Trash2',
      color: '#EF4444',
      createdBy: userId || 'system',
    });

    return result;
  }
};

export default leadFileService;
