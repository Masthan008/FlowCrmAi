import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft,
  Phone,
  Mail,
  MessageSquare,
  Edit2,
  UserCheck,
  Archive,
  Trash2,
  Video,
  Building,
  Contact as ContactIcon,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  Activity,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Loader2,
  Sparkles,
  Search,
  Plus,
  Trash,
  Download,
  FileIcon,
  CheckSquare,
  Square,
  Send,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Heart,
  Play,
  Volume2,
  User,
  Zap,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Award,
  Layers2
} from 'lucide-react';

import { useContactStore } from '../../store/contactStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';

// Validation schemas for inner modals
const activityFormSchema = z.object({
  type: z.enum(['Call', 'Meeting', 'Email', 'SMS', 'WhatsApp', 'Visit', 'Demo', 'Support', 'Custom']),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(1000).optional(),
  activityDate: z.string().min(1, 'Date and time is required'),
  status: z.enum(['Planned', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High']),
  assignedToId: z.string().optional(),
});

type ActivityFormFields = z.infer<typeof activityFormSchema>;

export const ContactProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();
  
  const {
    currentContact,
    timeline,
    activities,
    notes,
    files,
    history,
    relationships,
    journeyEvents,
    communications,
    calls,
    emailsLogs,
    meetingsLogs,
    businessMetrics,
    health,
    engagementScore,
    loading,
    error,
    employees,
    companies,
    leads,
    fetchContact,
    deleteContact,
    updateContact,
    fetchEmployees,
    fetchCompanies,
    fetchLeads,
    clearCurrentContact,
    // 360 Actions
    fetchTimeline,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    fetchFiles,
    uploadFile,
    deleteFile,
    fetchHistory,
    // CRM Intelligence Actions
    fetchRelationships,
    fetchJourney,
    fetchCommunications,
    fetchCalls,
    fetchEmailsLogs,
    fetchMeetingsLogs,
    fetchBusinessMetrics,
    fetchHealth,
    fetchEngagementScore
  } = useContactStore();

  const [selectedTab, setSelectedTab] = useState<string>('overview');
  
  // Tab-specific filters & search states
  const [timelineSearch, setTimelineSearch] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState('');

  // Unified communication search & filter
  const [commTypeFilter, setCommTypeFilter] = useState('');
  const [commSearchQuery, setCommSearchQuery] = useState('');

  // Modals state
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showAssignOwnerModal, setShowAssignOwnerModal] = useState(false);
  const [targetOwnerId, setTargetOwnerId] = useState('');
  
  // Notes state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePinned, setNewNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Activities state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Files upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('application/pdf');
  const [uploadFileSize, setUploadFileSize] = useState('1.2 MB');

  // Tasks mock state (for Tasks tab)
  const [tasksMock, setTasksMock] = useState([
    { id: 't1', title: 'Prepare proposal summary', priority: 'High', dueDate: '2026-07-02', status: 'Pending', assignedTo: 'Alex Mercer', progress: 20 },
    { id: 't2', title: 'Follow up on introductory email', priority: 'Medium', dueDate: '2026-06-29', status: 'Pending', assignedTo: 'Alex Mercer', progress: 0 },
    { id: 't3', title: 'Review company financial report', priority: 'Low', dueDate: '2026-06-25', status: 'Overdue', assignedTo: 'Alex Mercer', progress: 40 },
    { id: 't4', title: 'Schedule qualification demo call', priority: 'High', dueDate: '2026-06-20', status: 'Completed', assignedTo: 'Alex Mercer', progress: 100 }
  ]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // WhatsApp History architecture ready placeholder
  const [whatsappLogsMock, setWhatsappLogsMock] = useState([
    { id: 'w1', direction: 'Received', message: 'Hello! I received your pricing agreement layout. Looks great.', timestamp: '2026-06-27 10:14', status: 'Read' },
    { id: 'w2', direction: 'Sent', message: 'Perfect! Please feel free to add procurement contacts to the review draft.', timestamp: '2026-06-27 10:15', status: 'Read' },
    { id: 'w3', direction: 'Received', message: 'Sure, Sarah Connor will coordinate legal approvals.', timestamp: '2026-06-27 10:20', status: 'Read' }
  ]);

  const {
    register: registerActivity,
    handleSubmit: handleSubmitActivity,
    reset: resetActivity,
    formState: { errors: activityErrors }
  } = useForm<ActivityFormFields>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      status: 'Planned',
      priority: 'Medium'
    }
  });

  // Load Contact and Trigger lazy loading on Tab selection
  useEffect(() => {
    if (id) {
      fetchContact(id);
      fetchEmployees();
      fetchCompanies();
      fetchLeads();
      
      // Load intelligence widgets on mount
      fetchBusinessMetrics(id);
      fetchHealth(id);
      fetchEngagementScore(id);

      lazyLoadTab(id, selectedTab);
    }
    return () => {
      clearCurrentContact();
    };
  }, [id, selectedTab]);

  // Lazy load handler
  const lazyLoadTab = (contactId: string, tab: string) => {
    switch (tab) {
      case 'timeline':
        fetchTimeline(contactId);
        break;
      case 'activities':
        fetchActivities(contactId);
        break;
      case 'notes':
        fetchNotes(contactId);
        break;
      case 'files':
        fetchFiles(contactId);
        break;
      case 'history':
        fetchHistory(contactId);
        break;
      case 'relationships':
        fetchRelationships(contactId);
        break;
      case 'journey':
        fetchJourney(contactId);
        break;
      case 'communications':
        fetchCommunications(contactId);
        break;
      case 'calls':
        fetchCalls(contactId);
        break;
      case 'emails':
        fetchEmailsLogs(contactId);
        break;
      case 'meetings':
        fetchMeetingsLogs(contactId);
        break;
    }
  };

  // Restore notes draft if present
  useEffect(() => {
    if (selectedTab === 'notes' && !editingNoteId) {
      const draft = localStorage.getItem(`flowcrm_note_draft_${id}`);
      if (draft) {
        const { title, content } = JSON.parse(draft);
        setNewNoteTitle(title || '');
        setNewNoteContent(content || '');
      }
    }
  }, [selectedTab, id]);

  // Save notes draft
  useEffect(() => {
    if (selectedTab === 'notes' && !editingNoteId && (newNoteTitle || newNoteContent)) {
      localStorage.setItem(`flowcrm_note_draft_${id}`, JSON.stringify({ title: newNoteTitle, content: newNoteContent }));
    }
  }, [newNoteTitle, newNoteContent, selectedTab, id]);

  // Sync emails recipient
  useEffect(() => {
    if (currentContact) {
      setTargetOwnerId(currentContact.ownerId || '');
    }
  }, [currentContact]);

  if (loading && !currentContact) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-brand-550 w-8 h-8" />
        <p className="text-xs font-semibold">Loading Customer Intelligence workspace...</p>
      </div>
    );
  }

  if (error || !currentContact) {
    return (
      <div className="bg-white/80 border border-slate-150 p-12 rounded-3xl text-center shadow-glossy-lg max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Workspace Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'Requested contact was not found.'}</p>
        <Link to="/contacts">
          <Button className="bg-brand-550 text-white font-bold text-xs px-4 py-2 rounded-xl">Back to Contacts</Button>
        </Link>
      </div>
    );
  }

  // Quick actions
  const handleCall = () => {
    if (currentContact.phone) window.location.href = `tel:${currentContact.phone}`;
    else toast.info('No Phone Number', 'Specify primary phone number under overview.');
  };

  const handleEmail = () => {
    if (currentContact.email) window.location.href = `mailto:${currentContact.email}`;
    else toast.info('No Email Configured', 'Specify primary email under overview.');
  };

  const handleWhatsApp = () => {
    if (currentContact.whatsApp) window.open(`https://wa.me/${currentContact.whatsApp.replace(/\D/g, '')}`, '_blank');
    else toast.info('No WhatsApp Number', 'Specify WhatsApp contact phone.');
  };

  const handleArchive = async () => {
    try {
      await updateContact(currentContact.id, { status: 'Archived' });
      toast.success('Contact Archived', 'Status updated to Archived.');
    } catch (err) {
      toast.error('Archiving Failed', 'Error occurred.');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${currentContact.fullName}?`)) {
      try {
        await deleteContact(currentContact.id);
        toast.success('Contact Deleted', 'Contact soft-deleted successfully.');
        navigate('/contacts');
      } catch (err) {
        toast.error('Deletion Failed', 'Failed to delete contact.');
      }
    }
  };

  // Reassignment
  const handleAssignOwner = async () => {
    try {
      await updateContact(currentContact.id, { ownerId: targetOwnerId });
      toast.success('Owner Updated', 'Reassigned owner successfully.');
      setShowAssignOwnerModal(false);
      fetchContact(currentContact.id);
    } catch (err) {
      toast.error('Reassignment Failed', 'Error occurred.');
    }
  };

  // NOTES OPERATIONS
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    try {
      if (editingNoteId) {
        await updateNote(currentContact.id, editingNoteId, {
          title: newNoteTitle,
          content: newNoteContent,
          isPinned: newNotePinned
        });
        toast.success('Note Updated', 'Note updated successfully.');
        setEditingNoteId(null);
      } else {
        await createNote(currentContact.id, {
          title: newNoteTitle,
          content: newNoteContent,
          isPinned: newNotePinned
        });
        toast.success('Note Saved', 'New note created.');
        localStorage.removeItem(`flowcrm_note_draft_${id}`);
      }
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNotePinned(false);
    } catch (err) {
      toast.error('Notes Error', 'Failed to save note.');
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setNewNoteTitle(note.title || '');
    setNewNoteContent(note.content);
    setNewNotePinned(note.isPinned);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      try {
        await deleteNote(currentContact.id, noteId);
        toast.success('Note Deleted', 'Note deleted successfully.');
      } catch (err) {
        toast.error('Notes Error', 'Failed to delete note.');
      }
    }
  };

  // ACTIVITIES OPERATIONS
  const handleOpenAddActivity = () => {
    setEditingActivityId(null);
    resetActivity({
      type: 'Call',
      title: '',
      description: '',
      activityDate: '',
      status: 'Planned',
      priority: 'Medium',
      assignedToId: currentContact.ownerId || '',
    });
    setShowActivityModal(true);
  };

  const handleOpenEditActivity = (act: any) => {
    setEditingActivityId(act.id);
    resetActivity({
      type: act.type,
      title: act.title,
      description: act.description || '',
      activityDate: new Date(act.activityDate).toISOString().slice(0, 16),
      status: act.status,
      priority: act.priority,
      assignedToId: act.assignedToId || '',
    });
    setShowActivityModal(true);
  };

  const onSubmitActivity = async (data: ActivityFormFields) => {
    try {
      if (editingActivityId) {
        await updateActivity(currentContact.id, editingActivityId, data);
        toast.success('Activity Updated', 'Schedule activity updated.');
      } else {
        await createActivity(currentContact.id, data);
        toast.success('Activity Scheduled', 'New activity added.');
      }
      setShowActivityModal(false);
    } catch (err) {
      toast.error('Activity Error', 'Failed to schedule activity.');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (confirm('Delete this activity scheduled record?')) {
      try {
        await deleteActivity(currentContact.id, activityId);
        toast.success('Activity Deleted', 'Activity removed.');
      } catch (err) {
        toast.error('Activity Error', 'Failed to delete activity.');
      }
    }
  };

  // FILES OPERATIONS
  const handleUploadFile = async () => {
    if (!uploadFileName.trim()) return;
    try {
      const sizeBytes = uploadFileSize === '1.2 MB' ? 1258291 : 314572;
      await uploadFile(currentContact.id, {
        name: uploadFileName,
        path: `/uploads/${uploadFileName}`,
        mimeType: uploadFileType,
        size: sizeBytes
      });
      toast.success('Document Uploaded', `${uploadFileName} uploaded successfully.`);
      setShowUploadModal(false);
      setUploadFileName('');
    } catch (err) {
      toast.error('Upload Error', 'Failed to upload document.');
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (confirm(`Delete document "${fileName}"?`)) {
      try {
        await deleteFile(currentContact.id, fileId);
        toast.success('Document Deleted', 'Document removed.');
      } catch (err) {
        toast.error('Document Error', 'Failed to delete document.');
      }
    }
  };

  // TASKS MOCK ACTIONS
  const handleAddTaskMock = () => {
    if (!newTaskTitle.trim() || !newTaskDueDate) return;
    const newTask = {
      id: `t_${Date.now()}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      status: 'Pending',
      assignedTo: 'Alex Mercer',
      progress: 0
    };
    setTasksMock([newTask, ...tasksMock]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTaskModal(false);
    toast.success('Task Assigned', 'New workspace task assigned successfully.');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasksMock(prev => prev.map(t => {
      if (t.id === taskId) {
        const isDone = t.status === 'Completed';
        return {
          ...t,
          status: isDone ? 'Pending' : 'Completed',
          progress: isDone ? 0 : 100
        };
      }
      return t;
    }));
  };

  // Filters computed lists
  const filteredTimeline = useMemo(() => {
    if (!timelineSearch) return timeline;
    return timeline.filter(t => 
      t.title.toLowerCase().includes(timelineSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(timelineSearch.toLowerCase()))
    );
  }, [timeline, timelineSearch]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = !activitySearch || a.title.toLowerCase().includes(activitySearch.toLowerCase()) || (a.description && a.description.toLowerCase().includes(activitySearch.toLowerCase()));
      const matchesType = !activityTypeFilter || a.type === activityTypeFilter;
      const matchesStatus = !activityStatusFilter || a.status === activityStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [activities, activitySearch, activityTypeFilter, activityStatusFilter]);

  const filteredNotes = useMemo(() => {
    if (!noteSearch) return notes;
    return notes.filter(n =>
      (n.title && n.title.toLowerCase().includes(noteSearch.toLowerCase())) ||
      n.content.toLowerCase().includes(noteSearch.toLowerCase())
    );
  }, [notes, noteSearch]);

  const filteredFiles = useMemo(() => {
    if (!fileSearch) return files;
    return files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));
  }, [files, fileSearch]);

  const filteredCommunications = useMemo(() => {
    return communications.filter(c => {
      const matchesType = !commTypeFilter || c.type === commTypeFilter;
      const matchesSearch = !commSearchQuery || c.title.toLowerCase().includes(commSearchQuery.toLowerCase()) || c.description.toLowerCase().includes(commSearchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [communications, commTypeFilter, commSearchQuery]);

  const filteredCalls = useMemo(() => {
    return calls;
  }, [calls]);

  const filteredEmailsLogs = useMemo(() => {
    return emailsLogs;
  }, [emailsLogs]);

  const filteredMeetingsLogs = useMemo(() => {
    return meetingsLogs;
  }, [meetingsLogs]);

  const filteredHistory = useMemo(() => {
    if (!historySearch) return history;
    return history.filter(h =>
      h.action.toLowerCase().includes(historySearch.toLowerCase()) ||
      (h.fieldName && h.fieldName.toLowerCase().includes(historySearch.toLowerCase())) ||
      (h.oldValue && h.oldValue.toLowerCase().includes(historySearch.toLowerCase())) ||
      (h.newValue && h.newValue.toLowerCase().includes(historySearch.toLowerCase()))
    );
  }, [history, historySearch]);

  // Statistics computes
  const relationshipTenure = useMemo(() => {
    const start = new Date(currentContact.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  }, [currentContact]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Inactive': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'VIP': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  const getHealthBadgeColor = (overall: string) => {
    switch (overall) {
      case 'Green': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Yellow': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Red': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb row */}
      <div className="flex items-center justify-between border-b border-slate-100/50 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/contacts" className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ChevronLeft size={18} />
          </Link>
          <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wide">{currentContact.contactNumber}</span>
          <span className="text-slate-350">|</span>
          <span className="text-xs text-slate-500 font-medium">Enterprise Relationship Mapping Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/contacts')}
            variant="outline"
            className="border-slate-200 text-slate-600 text-[10px] font-bold py-1.5 px-3 rounded-xl hover:bg-slate-50"
          >
            Contacts Directory
          </Button>
        </div>
      </div>

      {/* 3-COLUMN ENTERPRISE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* LEFT PANEL (30%) - lines 12 to 40 relative */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg space-y-5">
            
            {/* Photo, Name, status block */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                {currentContact.profilePhoto ? (
                  <img
                    src={currentContact.profilePhoto}
                    alt={currentContact.fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-100 shadow-glossy"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-xl text-brand-600 uppercase shadow-glossy-sm">
                    {currentContact.firstName.charAt(0)}{currentContact.lastName.charAt(0)}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 border border-white px-2 py-0.5 text-[9px] font-bold rounded-full shadow-glossy-sm ${getStatusBadge(currentContact.status)}`}>
                  {currentContact.status}
                </span>
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">{currentContact.fullName}</h2>
                {currentContact.jobTitle && (
                  <p className="text-xs text-slate-450 font-bold tracking-tight">{currentContact.jobTitle}</p>
                )}
                {currentContact.department && (
                  <p className="text-[10px] text-slate-400 font-semibold">{currentContact.department}</p>
                )}
              </div>
            </div>

            {/* Quick Actions grid */}
            <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-4 select-none">
              <button
                onClick={handleCall}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <Phone size={14} className="text-slate-600" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Call</span>
              </button>

              <button
                onClick={handleEmail}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <Mail size={14} className="text-slate-600" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Email</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <MessageSquare size={14} className="text-slate-600" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTab('activities');
                  handleOpenAddActivity();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <Calendar size={14} className="text-slate-600" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Meeting</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTab('tasks');
                  setShowAddTaskModal(true);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <CheckSquare size={14} className="text-slate-600" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Task</span>
              </button>

              <button
                onClick={() => setShowAssignOwnerModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <UserCheck size={14} className="text-slate-600" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Assign</span>
              </button>
            </div>

            {/* General detailed info block */}
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Primary Phone</span>
                <span className="font-semibold">{currentContact.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Email</span>
                <span className="font-semibold break-all text-right max-w-[180px]">{currentContact.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Company</span>
                <span className="font-semibold text-brand-600">{currentContact.company?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Contact Owner</span>
                <span className="font-bold">
                  {currentContact.owner ? `${currentContact.owner.firstName} ${currentContact.owner.lastName}` : 'Unassigned'}
                </span>
              </div>
              {currentContact.lead && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Lead Source</span>
                  <span className="font-semibold text-slate-500">{currentContact.lead.leadNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Location</span>
                <span className="font-semibold text-right max-w-[180px]">
                  {currentContact.city ? `${currentContact.city}, ${currentContact.country || ''}` : currentContact.country || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Created Date</span>
                <span className="font-semibold text-slate-500">{new Date(currentContact.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Operation actions and Future triggers */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleArchive}
                  variant="outline"
                  className="w-full justify-center border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Archive size={12} />
                  Archive
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="w-full justify-center border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Delete
                </Button>
              </div>

              <button
                disabled
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-50 text-slate-400 flex items-center justify-center gap-2 cursor-not-allowed text-[10px] font-bold"
              >
                <Video size={13} />
                START VIDEO MEETING (FUTURE)
              </button>

              <button
                disabled
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-50 text-slate-400 flex items-center justify-center gap-2 cursor-not-allowed text-[10px] font-bold"
              >
                <Compass size={13} />
                CUSTOMER PORTAL (FUTURE)
              </button>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTER PANEL (45%) - Tab-based Lazy Loaded Workspace */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Scrollable Tabs header */}
          <div className="bg-white border border-slate-150 rounded-2xl p-1.5 flex gap-1 select-none overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'relationships', label: 'Relationships' },
              { id: 'journey', label: 'Journey' },
              { id: 'communications', label: 'Communications' },
              { id: 'calls', label: 'Calls' },
              { id: 'emails', label: 'Emails' },
              { id: 'meetings', label: 'Meetings' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'activities', label: 'Activities' },
              { id: 'notes', label: 'Notes' },
              { id: 'files', label: 'Files' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'history', label: 'History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-2 text-[11px] font-bold transition-all rounded-xl whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'bg-slate-800 text-white shadow-glossy-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab contents window */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg min-h-[450px]">
            
            {/* OVERVIEW TAB */}
            {selectedTab === 'overview' && (
              <div className="space-y-6 animate-fade-in text-slate-700 text-xs">
                
                {/* Basic Details table layout */}
                <div>
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">First Name</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{currentContact.firstName}</p>
                    </div>
                    {currentContact.middleName && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Middle Name</span>
                        <p className="font-semibold text-slate-700 mt-0.5">{currentContact.middleName}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Last Name</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{currentContact.lastName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Gender</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{currentContact.gender || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {currentContact.dateOfBirth ? new Date(currentContact.dateOfBirth).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preferences details */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Communication Preferences</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Language</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{currentContact.preferredLanguage || 'en'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Method</span>
                      <p className="font-bold text-brand-600 mt-0.5">{currentContact.preferredContactMethod || 'Email'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Timezone</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{currentContact.timezone || 'UTC'}</p>
                    </div>
                  </div>
                </div>

                {/* Social Profiles link icons */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Social Profiles</h4>
                  <div className="flex gap-2">
                    {currentContact.linkedin ? (
                      <a href={currentContact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 border border-slate-150 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <Linkedin size={12} className="text-slate-400" /> LinkedIn
                      </a>
                    ) : null}
                    {currentContact.twitter ? (
                      <a href={currentContact.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 border border-slate-150 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <Twitter size={12} className="text-slate-400" /> Twitter
                      </a>
                    ) : null}
                    {currentContact.facebook ? (
                      <a href={currentContact.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 border border-slate-150 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <Facebook size={12} className="text-slate-400" /> Facebook
                      </a>
                    ) : null}
                    {currentContact.instagram ? (
                      <a href={currentContact.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 border border-slate-150 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <Instagram size={12} className="text-slate-400" /> Instagram
                      </a>
                    ) : null}
                    {!currentContact.linkedin && !currentContact.twitter && !currentContact.facebook && !currentContact.instagram && (
                      <span className="text-[10px] text-slate-400 font-semibold italic">No social links configured</span>
                    )}
                  </div>
                </div>

                {/* Auditing logs info */}
                <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-semibold space-y-1">
                  <div>Created By ID: {currentContact.createdBy || 'system'}</div>
                  <div>Updated By ID: {currentContact.updatedBy || 'system'}</div>
                  <div>Last Modified: {new Date(currentContact.updatedAt).toLocaleString()}</div>
                </div>

              </div>
            )}

            {/* RELATIONSHIPS TAB */}
            {selectedTab === 'relationships' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Visual Relationship Tree */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider">Visual Relationship Tree</h4>
                  
                  <div className="space-y-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-brand-550 text-white rounded-2xl shadow-glossy-sm border border-brand-400 text-center w-48 z-10 select-none">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-100">Primary Contact</span>
                        <h5 className="font-black text-xs mt-0.5 truncate">{currentContact.fullName}</h5>
                        <p className="text-[9px] font-semibold text-brand-200 mt-0.5">{currentContact.jobTitle || 'Customer'}</p>
                      </div>
                      <div className="w-0.5 h-6 bg-slate-200 my-0.5" />
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-slate-800 text-white rounded-2xl shadow-glossy-sm border border-slate-700 text-center w-48 z-10 select-none">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Linked Account</span>
                        <h5 className="font-black text-xs mt-0.5 truncate">{currentContact.company?.name || 'Company Account'}</h5>
                      </div>
                      <div className="w-0.5 h-6 bg-slate-200 my-0.5" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 relative justify-center">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-glossy-sm select-none">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Sales Pipeline</span>
                        <h5 className="font-bold text-[10px] text-slate-700 mt-0.5">2 Open Deals</h5>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-glossy-sm select-none">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Commercials</span>
                        <h5 className="font-bold text-[10px] text-slate-700 mt-0.5">4 Invoices</h5>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-glossy-sm col-span-2 md:col-span-1 select-none">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Audit Records</span>
                        <h5 className="font-bold text-[10px] text-slate-700 mt-0.5">{history.length} Logs</h5>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Roles grid */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Account Role Mapping</h4>
                  {relationships.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No roles mapped.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {relationships.map((rel) => (
                        <div key={rel.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                          <div>
                            <span className="px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-700 text-[9px] font-bold rounded-lg uppercase tracking-wide mr-2">
                              {rel.role}
                            </span>
                            <span className="font-bold text-slate-700">{rel.position || 'Corporate Executive'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{rel.department || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* JOURNEY TAB */}
            {selectedTab === 'journey' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider">Customer Lifecycle Journey</h4>
                
                {journeyEvents.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No lifecycle stages registered.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 text-xs text-slate-700">
                    {journeyEvents.map((evt, idx) => (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-white ${
                          evt.completed ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}>
                          {evt.completed ? <CheckCircle2 size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span className={`uppercase tracking-tight ${evt.completed ? 'text-slate-800' : 'text-slate-400'}`}>{evt.stage}</span>
                            <span>{evt.date ? new Date(evt.date).toLocaleDateString() : 'Planned'}</span>
                          </div>
                          <p className="text-slate-500 font-medium mt-0.5">{evt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COMMUNICATIONS TAB */}
            {selectedTab === 'communications' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-700">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={commSearchQuery}
                    onChange={(e) => setCommSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl"
                  />
                  <select
                    value={commTypeFilter}
                    onChange={(e) => setCommTypeFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-slate-600 font-bold"
                  >
                    <option value="">All Logs</option>
                    <option value="Call">Calls</option>
                    <option value="Email">Emails</option>
                    <option value="Meeting">Meetings</option>
                    <option value="Note">Notes</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {filteredCommunications.map((comm, idx) => (
                    <div key={idx} className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-shadow">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1.5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg uppercase">{comm.type}</span>
                        <span>{new Date(comm.date).toLocaleString()}</span>
                      </div>
                      <h5 className="font-bold text-slate-850 text-xs mb-1">{comm.title}</h5>
                      <p className="text-slate-500 font-medium leading-relaxed">{comm.description}</p>
                      <span className="text-[9px] text-slate-400 font-bold block pt-1.5 border-t border-slate-50 mt-2 uppercase tracking-wide">
                        LOGGED BY {comm.user}
                      </span>
                    </div>
                  ))}
                  {filteredCommunications.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto opacity-40 mb-2" />
                      <p className="text-xs font-medium">No communication timeline records found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CALLS TAB */}
            {selectedTab === 'calls' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-700">
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 uppercase tracking-wider">Enterprise Call Logs</h4>
                
                {filteredCalls.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Phone className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No phone calls logged.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCalls.map((call) => (
                      <div key={call.id} className="border border-slate-150 p-4 rounded-2xl bg-white space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg border uppercase ${
                              call.direction === 'Incoming' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {call.direction}
                            </span>
                            <span className="font-bold text-slate-800 text-xs">Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s</span>
                          </div>
                          <span className="text-[10px] text-slate-450 font-semibold">{new Date(call.createdAt).toLocaleString()}</span>
                        </div>
                        {call.notes && <p className="text-slate-500 font-medium">{call.notes}</p>}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-50">
                          <span>OUTCOME: <span className="text-slate-700">{call.outcome}</span></span>
                          {call.recordingPath && (
                            <div className="flex items-center gap-1.5 text-brand-650 cursor-pointer hover:underline" onClick={() => toast.success('Play Voice Recording', 'Simulated playing audio track.')}>
                              <Volume2 size={12} />
                              <span>Listen Playback</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EMAILS TAB */}
            {selectedTab === 'emails' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-700">
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 uppercase tracking-wider">Email History Logs</h4>
                
                {filteredEmailsLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Mail className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No emails logged.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEmailsLogs.map((log) => (
                      <div key={log.id} className="border border-slate-150 p-4 rounded-2xl bg-white space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-850 text-xs flex items-center gap-2">
                              {log.subject}
                              {log.hasAttachments && <span className="text-[9px] px-1 bg-slate-100 text-slate-500 rounded">Clip</span>}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">From: {log.sender}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                        {log.body && <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed">{log.body}</p>}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-[10px] font-bold uppercase select-none">
                          <span className="text-slate-400">Status: <span className="text-emerald-700">{log.status}</span></span>
                          <span className="text-brand-600">Opened Tracker</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MEETINGS TAB */}
            {selectedTab === 'meetings' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-700">
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 uppercase tracking-wider">Meeting Minutes & Outcomes</h4>
                
                {filteredMeetingsLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No scheduled meetings.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMeetingsLogs.map((m) => (
                      <div key={m.id} className="border border-slate-150 p-4 rounded-2xl bg-white space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-850 text-xs">{m.title}</h5>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Scheduled: {new Date(m.meetingDate).toLocaleString()}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9px] font-bold">{m.status}</span>
                        </div>
                        {m.agenda && (
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Agenda</span>
                            <p className="text-slate-500 font-medium mt-0.5">{m.agenda}</p>
                          </div>
                        )}
                        {m.minutes && (
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Meeting Minutes</span>
                            <p className="text-slate-600 font-semibold mt-0.5 leading-relaxed">{m.minutes}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-50 mt-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Attendees:</span>
                          {m.participants.map(p => (
                            <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">{p}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WHATSAPP TAB */}
            {selectedTab === 'whatsapp' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-700">
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 uppercase tracking-wider">WhatsApp Interaction Architecture</h4>
                
                <div className="space-y-3">
                  {whatsappLogsMock.map((log) => (
                    <div key={log.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span className={`uppercase ${log.direction === 'Sent' ? 'text-blue-600' : 'text-slate-600'}`}>Direction: {log.direction}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-slate-650 font-medium leading-relaxed">{log.message}</p>
                      <div className="text-[9px] text-slate-400 font-bold text-right uppercase tracking-wide">
                        DELIVERY STATUS: {log.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {selectedTab === 'timeline' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Search timeline..."
                    value={timelineSearch}
                    onChange={(e) => setTimelineSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>

                {filteredTimeline.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Clock className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No timeline events found.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-slate-100 space-y-6">
                    {filteredTimeline.map((item) => (
                      <div key={item.id} className="relative">
                        <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full border-2 border-white bg-slate-350 shadow-glossy-sm flex items-center justify-center text-white" style={{ backgroundColor: item.color || '#9CA3AF' }} />
                        <div className="bg-slate-50/70 border border-slate-100/50 p-3 rounded-2xl shadow-glossy-sm space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                            <span className="text-slate-800 uppercase tracking-tight">{item.title}</span>
                            <span>{new Date(item.eventDate).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-650 font-medium">{item.description}</p>
                          <span className="text-[9px] text-slate-400 font-semibold block pt-0.5">By {item.createdBy || 'system'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITIES TAB */}
            {selectedTab === 'activities' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Search & filter activity */}
                <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 bg-slate-50/50 rounded-xl"
                  />
                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white"
                  >
                    <option value="">All Types</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                  <Button
                    onClick={handleOpenAddActivity}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-glossy"
                  >
                    <Plus size={12} /> Schedule
                  </Button>
                </div>

                {filteredActivities.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No scheduled activities found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActivities.map((act) => (
                      <div key={act.id} className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-shadow flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold rounded-md uppercase">
                              {act.type}
                            </span>
                            <span className="font-bold text-slate-800 text-xs">{act.title}</span>
                          </div>
                          {act.description && <p className="text-slate-500 text-xs font-medium">{act.description}</p>}
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 font-semibold">
                            <span className="flex items-center gap-1"><Clock size={11} /> {new Date(act.activityDate).toLocaleString()}</span>
                            <span>Priority: <span className="font-bold text-slate-600">{act.priority}</span></span>
                            <span>Status: <span className="font-bold text-slate-600">{act.status}</span></span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleOpenEditActivity(act)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTES TAB */}
            {selectedTab === 'notes' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Note create form */}
                <form onSubmit={handleSaveNote} className="space-y-2.5 p-3 border border-slate-150 rounded-2xl bg-slate-50/30">
                  <input
                    type="text"
                    placeholder="Note Title (optional)..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-150 rounded-xl bg-white focus:outline-none font-semibold text-slate-700"
                  />
                  <textarea
                    placeholder="Write note content support Markdown..."
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-150 rounded-xl bg-white focus:outline-none font-medium text-slate-650"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 font-semibold">
                      <input
                        type="checkbox"
                        checked={newNotePinned}
                        onChange={(e) => setNewNotePinned(e.target.checked)}
                        className="rounded border-slate-300 text-brand-550 focus:ring-brand-500"
                      />
                      Pin this note to the top
                    </label>
                    <div className="flex gap-1.5">
                      {editingNoteId && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditingNoteId(null);
                            setNewNoteTitle('');
                            setNewNoteContent('');
                            setNewNotePinned(false);
                            localStorage.removeItem(`flowcrm_note_draft_${id}`);
                          }}
                          className="text-xs py-1 rounded-xl text-slate-500"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={!newNoteContent.trim()}
                        className="bg-brand-550 hover:bg-brand-600 text-white font-bold text-xs py-1.5 px-3 rounded-xl disabled:opacity-50"
                      >
                        {editingNoteId ? 'Update Note' : 'Save Note'}
                      </Button>
                    </div>
                  </div>
                </form>

                <div className="relative border-b border-slate-100 my-4" />

                {/* Search notes */}
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />

                {filteredNotes.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No notes configured.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotes.map((note) => (
                      <div key={note.id} className={`border p-4 rounded-2xl transition-all ${note.isPinned ? 'border-brand-200 bg-brand-50/20' : 'border-slate-150 bg-white'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            {note.title && <h5 className="font-bold text-slate-800 text-xs mb-1">{note.title}</h5>}
                            <p className="text-slate-650 text-xs font-medium whitespace-pre-line leading-relaxed">{note.content}</p>
                            <span className="text-[9px] text-slate-400 font-semibold block pt-2">
                              Updated {new Date(note.updatedAt).toLocaleString()} by {note.createdBy || 'system'}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleEditNote(note)}
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FILES TAB */}
            {selectedTab === 'files' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Search & Upload */}
                <div className="flex justify-between items-center gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                  />
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1"
                  >
                    <Plus size={12} /> Upload
                  </Button>
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Layers className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No documents attached.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredFiles.map((file) => (
                      <div key={file.id} className="border border-slate-150 p-3 rounded-2xl bg-white hover:shadow-glossy-sm transition-shadow flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-500 flex-shrink-0">
                            <FileIcon size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <h5 className="font-bold text-slate-800 text-xs truncate leading-tight">{file.name}</h5>
                            <span className="text-[9px] text-slate-400 font-semibold">
                              {(file.size / 1024 / 1024).toFixed(1)} MB • {file.mimeType.split('/').pop()?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toast.success('Download Initiated', `Downloading document "${file.name}"`)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                            title="Download"
                          >
                            <Download size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-650"
                            title="Delete"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TASKS TAB */}
            {selectedTab === 'tasks' && (
              <div className="space-y-4 animate-fade-in text-slate-700 text-xs">
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><CheckSquare size={14} /> Contact Tasks</h4>
                  <Button
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-slate-800 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-glossy"
                  >
                    Quick Add Task
                  </Button>
                </div>

                <div className="space-y-3">
                  {tasksMock.map((task) => (
                    <div key={task.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white flex items-center justify-between gap-4">
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id)}
                          className="mt-0.5 text-slate-400 focus:outline-none flex-shrink-0"
                        >
                          {task.status === 'Completed' ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} />}
                        </button>
                        <div className="overflow-hidden">
                          <h5 className={`font-bold text-xs truncate leading-tight ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </h5>
                          <div className="flex gap-3 text-[10px] text-slate-400 font-semibold pt-1">
                            <span>Due: <span className="text-slate-600">{task.dueDate}</span></span>
                            <span>Priority: <span className="text-slate-600">{task.priority}</span></span>
                            <span>Assigned: <span className="text-slate-600">{task.assignedTo}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-20 hidden md:block">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : 'bg-brand-550'}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold text-right block mt-0.5">{task.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {selectedTab === 'history' && (
              <div className="space-y-4 animate-fade-in text-slate-700 text-xs">
                <input
                  type="text"
                  placeholder="Search history logs..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs mb-3"
                />

                {filteredHistory.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No history log entries found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                          <th className="px-4 py-2.5">Action</th>
                          <th className="px-4 py-2.5">Field</th>
                          <th className="px-4 py-2.5">Old Value</th>
                          <th className="px-4 py-2.5">New Value</th>
                          <th className="px-4 py-2.5">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                        {filteredHistory.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50/30">
                            <td className="px-4 py-3 font-bold text-slate-800">{h.action}</td>
                            <td className="px-4 py-3 text-slate-500 font-semibold">{h.fieldName || '-'}</td>
                            <td className="px-4 py-3 truncate max-w-[120px]" title={h.oldValue || ''}>{h.oldValue || 'Empty'}</td>
                            <td className="px-4 py-3 truncate max-w-[120px]" title={h.newValue || ''}>{h.newValue || 'Empty'}</td>
                            <td className="px-4 py-3 text-slate-400 font-semibold">{new Date(h.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL (25%) - Smart Information & Relationship summary */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6 select-none">
          
          {/* Smart Score & Health badge card */}
          {health && engagementScore && (
            <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <TrendingUp size={13} className="text-brand-550" /> Relationship Health
              </h4>
              <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-2xl space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Engagement Index</span>
                    <span className="text-brand-600 font-black">{engagementScore.overallScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-brand-550 h-1.5 rounded-full" style={{ width: `${engagementScore.overallScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Customer Health Status</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] border font-black ${getHealthBadgeColor(health.overallHealth)}`}>
                      {health.overallHealth.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500 font-semibold">
                    <div>Response Time: <span className="font-bold text-slate-700">{health.responseTime}m</span></div>
                    <div>Meeting Score: <span className="font-bold text-slate-700">{health.meetingFreq}%</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Metrics Summary Card */}
          {businessMetrics && (
            <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <DollarSign size={13} className="text-emerald-600" /> Business metrics
              </h4>
              <div className="space-y-3 text-slate-700">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">Total Value</span>
                    <span className="text-xs font-black text-slate-800">${Number(businessMetrics.lifetimeValue).toLocaleString()}</span>
                  </div>
                  <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">Deals won</span>
                    <span className="text-xs font-black text-slate-800">{businessMetrics.dealsClosed}</span>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase px-1">
                  <span>Revenue generated</span>
                  <span className="text-slate-800 font-black">${Number(businessMetrics.totalRevenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase px-1">
                  <span>Avg Deal Size</span>
                  <span className="text-slate-800 font-black">${Number(businessMetrics.averageDealSize).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase px-1">
                  <span>Opportunities</span>
                  <span className="text-brand-600 font-black">${Number(businessMetrics.currentOpportunityVal).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Relationship summary stats */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg space-y-3">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide">Relationship Summary</h4>
            <div className="space-y-2.5 text-[10px] text-slate-500 font-bold uppercase">
              <div className="flex justify-between">
                <span>Total Tenure</span>
                <span className="text-slate-700 font-black">{relationshipTenure}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks</span>
                <span className="text-slate-700 font-black">{tasksMock.filter(t => t.status === 'Completed').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Logged activities</span>
                <span className="text-slate-700 font-black">{activities.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Attached files</span>
                <span className="text-slate-700 font-black">{files.length}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: ASSIGN OWNER */}
      {showAssignOwnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg select-none">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Assign Contact Owner</h3>
            <p className="text-[10px] text-slate-450 font-medium mb-4">Select the executive to own this contact record.</p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Owner</label>
                <select
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                >
                  <option value="">Select Owner</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignOwnerModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignOwner}
                  disabled={!targetOwnerId}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl disabled:opacity-50"
                >
                  Reassign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ACTIVITY */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1 select-none">
              {editingActivityId ? 'Edit Activity Schedule' : 'Schedule New Activity'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4 select-none">Configure type, timing, priority, and assignees details.</p>

            <form onSubmit={handleSubmitActivity(onSubmitActivity)} className="space-y-3.5 text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Activity Type</label>
                  <select
                    {...registerActivity('type')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-semibold"
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Visit">Visit</option>
                    <option value="Demo">Demo</option>
                    <option value="Support">Support</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Title *</label>
                  <input
                    type="text"
                    {...registerActivity('title')}
                    className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 ${activityErrors.title ? 'border-rose-350' : 'border-slate-200'}`}
                  />
                  {activityErrors.title && <span className="text-[10px] text-rose-500 font-bold">{activityErrors.title.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Priority</label>
                  <select
                    {...registerActivity('priority')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <select
                    {...registerActivity('status')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-semibold"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Activity Date & Time *</label>
                <input
                  type="datetime-local"
                  {...registerActivity('activityDate')}
                  className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 ${activityErrors.activityDate ? 'border-rose-350' : 'border-slate-200'}`}
                />
                {activityErrors.activityDate && <span className="text-[10px] text-rose-500 font-bold">{activityErrors.activityDate.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Assignee Owner (Employee)</label>
                <select
                  {...registerActivity('assignedToId')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-semibold text-slate-650"
                >
                  <option value="">Select Assignee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description / Notes</label>
                <textarea
                  rows={3}
                  {...registerActivity('description')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end mt-4 select-none">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowActivityModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  {editingActivityId ? 'Save Changes' : 'Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MOCK UPLOAD FILE */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg select-none">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Attach Corporate Document</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Simulate file upload. Enter file details metadata.</p>

            <div className="space-y-3.5 text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">File Name *</label>
                <input
                  type="text"
                  placeholder="e.g. sales_proposal_draft.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mime Type</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="application/pdf">PDF Document</option>
                    <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (.docx)</option>
                    <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel (.xlsx)</option>
                    <option value="image/png">Image (.png)</option>
                    <option value="application/zip">ZIP Archive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">File Size</label>
                  <select
                    value={uploadFileSize}
                    onChange={(e) => setUploadFileSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="1.2 MB">1.2 MB</option>
                    <option value="4.5 MB">4.5 MB</option>
                    <option value="15.8 MB">15.8 MB</option>
                    <option value="315 KB">315 KB</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadFile}
                  disabled={!uploadFileName.trim()}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl disabled:opacity-50"
                >
                  Confirm Attach
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MOCK ADD TASK */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg select-none">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Create Workspace Task</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Quickly assign a task related to this contact.</p>

            <div className="space-y-3.5 text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Send updated pricing details"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Due Date *</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddTaskModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTaskMock}
                  disabled={!newTaskTitle.trim() || !newTaskDueDate}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl disabled:opacity-50"
                >
                  Assign Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContactProfile;
