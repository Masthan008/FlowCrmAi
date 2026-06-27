import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import {
  Paperclip,
  Trash2,
  Download,
  Eye,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  Image as ImageIcon,
  HardDrive,
  CloudLightning,
  AlertCircle,
} from 'lucide-react';
import type { LeadFile } from '../../../types/lead';
import useLeadStore from '../../../store/leadStore';

interface FilesTabProps {
  leadId: string;
}

const getFileIcon = (mime: string) => {
  if (mime.includes('image')) return <ImageIcon size={18} className="text-emerald-500" />;
  if (mime.includes('pdf')) return <FileText size={18} className="text-rose-500" />;
  if (mime.includes('word') || mime.includes('officedocument.wordprocessingml')) return <FileText size={18} className="text-blue-500" />;
  if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('csv')) return <FileSpreadsheet size={18} className="text-green-500" />;
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('compressed')) return <FileArchive size={18} className="text-amber-500" />;
  return <FileCode size={18} className="text-slate-500" />;
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const FilesTab: React.FC<FilesTabProps> = ({ leadId }) => {
  const { files, storageSummary, fetchFiles, fetchStorageSummary, uploadFile, deleteFile, tabLoading } = useLeadStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<LeadFile | null>(null);

  // Delete Modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const loading = tabLoading.Files;

  useEffect(() => {
    fetchFiles(leadId);
    fetchStorageSummary(leadId);
  }, [leadId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadFile(leadId, formData);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteInit = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete) {
      await deleteFile(leadId, fileToDelete);
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    }
  };

  const handlePreview = (file: LeadFile) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const totalStorageLimit = 100 * 1024 * 1024; // 100MB virtual limit for showcase
  const usedSize = storageSummary?.totalSize || 0;
  const usedPercentage = Math.min((usedSize / totalStorageLimit) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Storage Information Bar */}
      <Card className="p-4 bg-white/70 border border-slate-200/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <HardDrive size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Document Repository Quota</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Using <span className="font-bold text-slate-700">{formatBytes(usedSize)}</span> of {formatBytes(totalStorageLimit)} allocated
            </p>
          </div>
        </div>

        {/* Progress Bar & Cloud Status */}
        <div className="flex-1 max-w-xs space-y-1">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${usedPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Local Filesystem Storage</span>
            <span>{usedPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Architecture Ready Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-100 bg-blue-50/30 text-blue-700">
          <CloudLightning size={14} className="animate-pulse" />
          <div className="text-[10px] font-bold uppercase tracking-wider">
            Cloud Sync Ready
          </div>
        </div>
      </Card>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-blue-500 bg-blue-50/20 scale-[0.99]'
            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/30 bg-white/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.csv,.xlsx,.zip"
        />
        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm mb-3 text-slate-400 group-hover:scale-110 transition-transform duration-200">
          <UploadCloud size={24} className="text-blue-500" />
        </div>
        <p className="text-xs font-bold text-slate-700">
          {uploading ? 'Uploading attachment...' : 'Drag and drop files here, or click to browse'}
        </p>
        <p className="text-[10px] text-slate-400 font-semibold mt-1.5 uppercase tracking-wide">
          Supported: PDF, Word, Excel, JPG, PNG, ZIP (Max 10MB)
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Files List Table */}
      <Card className="overflow-hidden border border-slate-200/50 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4" colSpan={5}>
                      <Skeleton className="h-6 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : files.length > 0 ? (
                files.map((file) => (
                  <tr key={file.id} className="hover:bg-white/80 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-slate-700 flex items-center gap-2.5 min-w-0 max-w-xs sm:max-w-md">
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex-shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <span className="truncate" title={file.name}>
                        {file.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {formatBytes(file.size)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-bold">
                      {file.createdBy || 'System'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium font-mono">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePreview(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-transparent"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <a
                          href={`http://localhost:5000/uploads/${file.path}`}
                          download={file.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-transparent inline-block"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => handleDeleteInit(file.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                        <Paperclip size={20} />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No Documents Found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Drag files above to attach proposals, specs, or contracts.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Preview: ${previewFile?.name}`}
        size="lg"
      >
        <div className="flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden p-6 max-h-[500px]">
          {previewFile?.mimeType.includes('image') ? (
            <img
              src={`http://localhost:5000/uploads/${previewFile.path}`}
              alt={previewFile.name}
              className="max-w-full max-h-[400px] object-contain rounded-lg"
            />
          ) : previewFile?.mimeType.includes('pdf') ? (
            <iframe
              src={`http://localhost:5000/uploads/${previewFile.path}`}
              title={previewFile.name}
              className="w-full h-[400px] border-none rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white py-12 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 text-white">
                {previewFile && getFileIcon(previewFile.mimeType)}
              </div>
              <h4 className="font-bold text-sm">{previewFile?.name}</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Preview is not supported for this file format ({previewFile?.mimeType}).
              </p>
              <a
                href={`http://localhost:5000/uploads/${previewFile?.path}`}
                download={previewFile?.name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <Download size={14} />
                Download to View
              </a>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete File Attachment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete this document attachment? This will free up quota storage.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm text-xs"
            >
              <Trash2 size={14} />
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
