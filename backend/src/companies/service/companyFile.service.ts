import { companyFileRepository } from '../repository/companyFile.repository';
import { companyTimelineService } from './companyTimeline.service';
import { config } from '../../config';
import fs from 'fs';
import path from 'path';

export const companyFileService = {
  getFiles: async (companyId: string) => {
    return companyFileRepository.findByCompanyId(companyId);
  },

  getStorageSummary: async (companyId: string) => {
    return companyFileRepository.getStorageSummary(companyId);
  },

  createFile: async (companyId: string, fileData: Express.Multer.File, userId?: string) => {
    const file = await companyFileRepository.create({
      companyId,
      name: fileData.originalname,
      path: fileData.filename,
      mimeType: fileData.mimetype,
      size: fileData.size,
      createdBy: userId || null,
    });

    await companyTimelineService.logEvent({
      companyId,
      type: 'DOCUMENT_UPLOADED',
      title: 'Document Uploaded',
      description: `Uploaded file: "${fileData.originalname}" (${(fileData.size / 1024).toFixed(1)} KB)`,
      icon: 'Paperclip',
      color: '#10B981',
      createdBy: userId || 'system',
    });

    return file;
  },

  deleteFile: async (fileId: string, userId?: string) => {
    const existing = await companyFileRepository.findById(fileId);
    if (!existing) throw Object.assign(new Error('File not found'), { statusCode: 404 });

    const result = await companyFileRepository.softDelete(fileId, userId || null);

    try {
      const filePath = path.join(config.uploadPath, existing.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error deleting physical file from disk', err);
    }

    await companyTimelineService.logEvent({
      companyId: existing.companyId,
      type: 'DOCUMENT_DELETED',
      title: 'Document Deleted',
      description: `Deleted file: "${existing.name}"`,
      icon: 'Trash2',
      color: '#EF4444',
      createdBy: userId || 'system',
    });

    return result;
  },
};
