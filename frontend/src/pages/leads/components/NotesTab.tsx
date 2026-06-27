import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import {
  Pin,
  Search,
  Plus,
  Trash2,
  Edit2,
  FileText,
  PinOff,
  User,
  Clock,
  Save,
  Trash,
  Sparkles,
} from 'lucide-react';
import type { LeadNote } from '../../../types/lead';
import useLeadStore from '../../../store/leadStore';

interface NotesTabProps {
  leadId: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ leadId }) => {
  const { notes, fetchNotes, createNote, updateNote, deleteNote, tabLoading } = useLeadStore();
  const [search, setSearch] = useState('');
  
  // Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const loading = tabLoading.Notes;
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Restore Draft on mount / leadId change
  useEffect(() => {
    fetchNotes(leadId);
    
    const draftTitle = localStorage.getItem(`note_draft_title_${leadId}`);
    const draftContent = localStorage.getItem(`note_draft_content_${leadId}`);
    if (draftContent || draftTitle) {
      setTitle(draftTitle || '');
      setContent(draftContent || '');
      setDraftSaved(true);
    } else {
      setTitle('');
      setContent('');
      setDraftSaved(false);
    }
  }, [leadId]);

  // Draft Auto-save trigger
  const handleContentChange = (val: string) => {
    setContent(val);
    setDraftSaved(false);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem(`note_draft_content_${leadId}`, val);
      localStorage.setItem(`note_draft_title_${leadId}`, title);
      setDraftSaved(true);
    }, 1000);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setDraftSaved(false);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem(`note_draft_content_${leadId}`, content);
      localStorage.setItem(`note_draft_title_${leadId}`, val);
      setDraftSaved(true);
    }, 1000);
  };

  // Clear drafts
  const clearDraft = () => {
    localStorage.removeItem(`note_draft_title_${leadId}`);
    localStorage.removeItem(`note_draft_content_${leadId}`);
    setDraftSaved(false);
  };

  // Save Note Action
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      if (isEditing && selectedNoteId) {
        await updateNote(leadId, selectedNoteId, { title, content, isPinned });
      } else {
        await createNote(leadId, { title, content, isPinned });
      }
      
      // Reset form
      setTitle('');
      setContent('');
      setIsPinned(false);
      setIsEditing(false);
      setSelectedNoteId(null);
      setFormOpen(false);
      clearDraft();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Trigger
  const handleEditInit = (note: LeadNote) => {
    setTitle(note.title || '');
    setContent(note.content);
    setIsPinned(note.isPinned);
    setIsEditing(true);
    setSelectedNoteId(note.id);
    setFormOpen(true);
  };

  // Delete Action
  const handleDeleteInit = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (noteToDelete) {
      await deleteNote(leadId, noteToDelete);
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
    }
  };

  // Pin Toggle Action
  const handlePinToggle = async (note: LeadNote) => {
    await updateNote(leadId, note.id, {
      title: note.title || '',
      content: note.content,
      isPinned: !note.isPinned,
    });
  };

  // Filter notes on search
  const filteredNotes = notes.filter(
    (n) =>
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.title && n.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex gap-2 justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes content..."
            className="pl-9 pr-4 rounded-xl border-slate-200/80 focus:border-blue-400 bg-white/70"
          />
        </div>
        <Button
          onClick={() => {
            setIsEditing(false);
            setSelectedNoteId(null);
            setFormOpen(true);
          }}
          className="rounded-xl flex items-center gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          <Plus size={16} />
          Create Note
        </Button>
      </div>

      {/* Grid of Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={`p-5 bg-white/75 backdrop-blur-sm border transition-all duration-300 rounded-2xl flex flex-col justify-between hover:shadow-md ${
                note.isPinned ? 'border-amber-200 shadow-amber-50/50 shadow-sm' : 'border-slate-200/60 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <h4 className="font-bold text-slate-800 tracking-tight text-sm">
                    {note.title || <span className="text-slate-400 italic">Untitled Note</span>}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePinToggle(note)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        note.isPinned
                          ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100'
                          : 'border-transparent text-slate-400 hover:bg-slate-100'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin size={12} className={note.isPinned ? 'fill-amber-500' : ''} />
                    </button>
                    <button
                      onClick={() => handleEditInit(note)}
                      className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteInit(note.id)}
                      className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {/* Note Content (Simple Markdown support - line breaks & spacing) */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap break-words">
                  {note.content}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <User size={10} className="text-slate-300" />
                  {note.createdBy || 'Unknown'}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock size={10} className="text-slate-300" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 py-12 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-2xl border border-dashed border-slate-200/80 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <FileText size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Notes Logged</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              Log a note or attachment to details about this lead. Pinned notes appear with highlights.
            </p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={isEditing ? 'Edit Note' : 'Create Note'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Title</label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Key Requirements Meeting Notes"
              className="rounded-xl border-slate-200/80 focus:border-blue-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Content (Markdown supported)</label>
              {draftSaved && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Draft Saved Automatically
                </span>
              )}
            </div>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start typing note details here..."
              rows={6}
              required
              className="w-full text-sm font-medium border border-slate-200/80 focus:border-blue-400 focus:outline-none rounded-xl p-3 bg-white"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pin_note_check"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-200 focus:ring-blue-400"
              />
              <label htmlFor="pin_note_check" className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none cursor-pointer flex items-center gap-1">
                <Pin size={12} />
                Pin this Note to top
              </label>
            </div>
            {content.length > 0 && (
              <Button
                variant="glass"
                size="sm"
                type="button"
                onClick={clearDraft}
                className="text-red-500 border-red-100 hover:bg-red-50 text-[10px]"
              >
                Clear Draft
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="glass"
              type="button"
              onClick={() => {
                setFormOpen(false);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Save size={16} />
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Note"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete this note? This action can be undone later as the item is archived.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm text-xs"
            >
              <Trash size={14} />
              Delete Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
