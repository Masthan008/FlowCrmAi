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
  Layers2,
  Filter,
  Sliders,
  Settings,
  HelpCircle,
  Clock3,
  CalendarDays,
  ActivitySquare,
  Sparkle
} from 'lucide-react';

import { useContactStore } from '../../store/contactStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';

// Validation schema for scheduling follow-ups
const followupFormSchema = z.object({
  type: z.enum(['Call', 'Email', 'Meeting', 'Visit', 'Demo', 'Support Call', 'Renewal Reminder', 'Custom']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  reminderActive: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

type FollowUpFormFields = z.infer<typeof followupFormSchema>;

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
    // Automation States
    lifecycle,
    stageHistory,
    preferences,
    segmentsList,
    tagsList,
    workflowsList,
    followups,
    score,
    risk,
    recommendations,
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
    fetchRelationships,
    fetchJourney,
    fetchCommunications,
    fetchCalls,
    fetchEmailsLogs,
    fetchMeetingsLogs,
    fetchBusinessMetrics,
    fetchHealth,
    fetchEngagementScore,
    // Automation Actions
    fetchLifecycle,
    updateLifecycle,
    fetchPreferences,
    updatePreferences,
    fetchSegments,
    fetchScore,
    fetchRisk,
    fetchRecommendations,
    fetchFollowups,
    createFollowup,
    assignOwner,
    createTag,
    fetchSegmentsList,
    createWorkflow
  } = useContactStore();

  const [selectedTab, setSelectedTab] = useState<string>('overview');
  
  // Tab-specific filters & search states
  const [timelineSearch, setTimelineSearch] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');

  // Unified communication search & filter
  const [commTypeFilter, setCommTypeFilter] = useState('');
  const [commSearchQuery, setCommSearchQuery] = useState('');

  // Modals state
  const [showAssignOwnerModal, setShowAssignOwnerModal] = useState(false);
  const [targetOwnerId, setTargetOwnerId] = useState('');
  const [transferReason, setTransferReason] = useState('Direct assignment update');
  
  // Notes state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePinned, setNewNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Files upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('application/pdf');
  const [uploadFileSize, setUploadFileSize] = useState('1.2 MB');

  // Follow-up Scheduler Modal
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  
  // Segment Builder state
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentDesc, setNewSegmentDesc] = useState('');
  const [segmentRules, setSegmentRules] = useState<{ field: string; operator: string; value: string }[]>([
    { field: 'industry', operator: 'equals', value: 'Technology' }
  ]);

  // Tag Manager state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1');
  const [newTagType, setNewTagType] = useState('Business');

  // Workflow builder state
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState('LIFECYCLE_CHANGED');
  const [workflowActionType, setWorkflowActionType] = useState('Create Task');
  const [workflowActionValue, setWorkflowActionValue] = useState('Prepare discovery draft');

  // React Hook Form for scheduler
  const {
    register: registerFollowup,
    handleSubmit: handleSubmitFollowup,
    reset: resetFollowup,
    formState: { errors: followupErrors }
  } = useForm<FollowUpFormFields>({
    resolver: zodResolver(followupFormSchema),
    defaultValues: {
      type: 'Call',
      priority: 'Medium',
      reminderActive: false
    }
  });

  // Load core details on mount and tab changes
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
      fetchScore(id);
      fetchRisk(id);
      fetchRecommendations(id);
      fetchLifecycle(id);

      lazyLoadTab(id, selectedTab);
    }
    return () => {
      clearCurrentContact();
    };
  }, [id, selectedTab]);

  // Sync assignment variables
  useEffect(() => {
    if (currentContact) {
      setTargetOwnerId(currentContact.ownerId || '');
    }
  }, [currentContact]);

  // Lazy loading
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
      case 'preferences':
        fetchPreferences(contactId);
        break;
      case 'followups':
        fetchFollowups(contactId);
        break;
      case 'segments':
        fetchSegments(contactId);
        fetchSegmentsList();
        break;
    }
  };

  if (loading && !currentContact) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-450 gap-3">
        <Loader2 className="animate-spin text-brand-550 w-8 h-8" />
        <p className="text-xs font-bold font-mono">LOADING AUTOMATION WORKSPACE...</p>
      </div>
    );
  }

  if (error || !currentContact) {
    return (
      <div className="bg-white/80 border border-slate-150 p-12 rounded-3xl text-center shadow-glossy-lg max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Workspace Error</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'Requested contact was not found.'}</p>
        <Link to="/contacts">
          <Button className="bg-brand-550 text-white font-bold text-xs px-4 py-2 rounded-xl">Back to Contacts</Button>
        </Link>
      </div>
    );
  }

  // Quick Action triggers
  const handleCall = () => {
    if (currentContact.phone) window.location.href = `tel:${currentContact.phone}`;
    else toast.info('No Phone Number', 'Specify primary phone number under overview.');
  };

  const handleEmail = () => {
    if (currentContact.email) window.location.href = `mailto:${currentContact.email}`;
    else toast.info('No Email Configured', 'Specify primary email under overview.');
  };

  const handleArchive = async () => {
    try {
      await updateContact(currentContact.id, { status: 'Archived' });
      // Update lifecycle status to archived also
      await updateLifecycle(currentContact.id, 'Archived', 'Contact archived via profile actions.');
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

  // Reassign owner
  const handleAssignOwner = async () => {
    try {
      await assignOwner(currentContact.id, targetOwnerId, transferReason);
      toast.success('Owner Assigned', 'Reassigned owner & updated timeline log.');
      setShowAssignOwnerModal(false);
    } catch (err) {
      toast.error('Reassignment Failed', 'Failed to reassign owner.');
    }
  };

  // Lifecycle updates
  const handleStageUpdate = async (stage: string) => {
    try {
      await updateLifecycle(currentContact.id, stage, 'Manual stage progression update');
      toast.success('Lifecycle Stage Changed', `Contact progressed to ${stage}.`);
    } catch (err) {
      toast.error('Update Failed', 'Failed to update lifecycle stage.');
    }
  };

  // Preferences save
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    try {
      await updatePreferences(currentContact.id, preferences);
      toast.success('Preferences Saved', 'Marketing & communication preferences updated.');
    } catch (err) {
      toast.error('Failed to Save', 'Failed to update contact preferences.');
    }
  };

  // Tag assign mapping
  const handleCreateTagMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await createTag({
        name: newTagName,
        color: newTagColor,
        type: newTagType
      });
      toast.success('Tag Registered', `Tag "${newTagName}" added to CRM.`);
      setNewTagName('');
    } catch (err) {
      toast.error('Failed to Create Tag', 'Tag mapping creation failed.');
    }
  };

  // Dynamic Segment mapping
  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegmentName.trim()) return;
    try {
      // Mock workflow segment setup
      toast.success('Segment Registered', `Dynamic segment "${newSegmentName}" configured successfully.`);
      setShowSegmentModal(false);
      setNewSegmentName('');
      setNewSegmentDesc('');
    } catch (err) {
      toast.error('Segment Error', 'Failed to configure segment rules.');
    }
  };

  // Automation workflow builder
  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    try {
      await createWorkflow({
        name: newWorkflowName,
        triggerType: newWorkflowTrigger,
        conditions: { status: 'VIP' },
        actions: { type: workflowActionType, value: workflowActionValue },
        isActive: true
      });
      toast.success('Workflow Added', `Workflow automation rule "${newWorkflowName}" registered.`);
      setShowWorkflowModal(false);
      setNewWorkflowName('');
    } catch (err) {
      toast.error('Workflow Error', 'Failed to build automation workflow trigger.');
    }
  };

  // Follow-up scheduling
  const onSubmitFollowup = async (data: FollowUpFormFields) => {
    try {
      await createFollowup(currentContact.id, {
        ...data,
        status: 'Pending',
        ownerId: currentContact.ownerId || user?.id
      });
      toast.success('Follow-up Scheduled', `${data.type} set for ${data.date}.`);
      setShowFollowUpModal(false);
      resetFollowup();
    } catch (err) {
      toast.error('Scheduler Error', 'Failed to schedule followup reminder.');
    }
  };

  // Notes operations
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

  // Files operations
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
      toast.success('Document Attached', `${uploadFileName} uploaded successfully.`);
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

  // Filtered lists computed
  const filteredTimeline = useMemo(() => {
    if (!timelineSearch) return timeline;
    return timeline.filter(t => 
      t.title.toLowerCase().includes(timelineSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(timelineSearch.toLowerCase()))
    );
  }, [timeline, timelineSearch]);

  const filteredCommunications = useMemo(() => {
    return communications.filter(c => {
      const matchesType = !commTypeFilter || c.type === commTypeFilter;
      const matchesSearch = !commSearchQuery || c.title.toLowerCase().includes(commSearchQuery.toLowerCase()) || c.description.toLowerCase().includes(commSearchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [communications, commTypeFilter, commSearchQuery]);

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

  const getHealthColor = (overall: string) => {
    switch (overall) {
      case 'Green': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Yellow': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Red': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  // Rule-based Lifecycle Next Stage suggestion
  const getNextRecommendedStage = (currentStage: string) => {
    switch (currentStage) {
      case 'Prospect': return { stage: 'Qualified', rationale: 'Schedule introductory discovery call to verify budget & timelines.' };
      case 'Qualified': return { stage: 'Customer', rationale: 'Finalize enterprise contract negotiations and trigger pricing.' };
      case 'Customer': return { stage: 'VIP Customer', rationale: 'Cross sell premium add-on feature kits to hit VIP revenue thresholds.' };
      default: return { stage: 'None', rationale: 'N/A' };
    }
  };

  const recommendedStage = getNextRecommendedStage(lifecycle?.currentStage || 'Prospect');

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-100/50 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/contacts" className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ChevronLeft size={18} />
          </Link>
          <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wide">{currentContact.contactNumber}</span>
          <span className="text-slate-350">|</span>
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Zap size={12} className="text-amber-500 animate-pulse" />
            CRM Lifecycle & Workflow Automation Workspace
          </span>
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
        {/* LEFT PANEL (30%) - Contact Profile Summary */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg space-y-5">
            
            {/* Identity details */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                {currentContact.profilePhoto ? (
                  <img
                    src={currentContact.profilePhoto}
                    alt={currentContact.fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-100 shadow-glossy"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-xl text-brand-650 uppercase shadow-glossy-sm">
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

            {/* Stage indicator badge */}
            <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl text-center select-none">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Automation Stage</span>
              <span className="text-xs font-black text-slate-800 uppercase mt-0.5 inline-block px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-full border border-brand-100">
                {lifecycle?.currentStage || 'Prospect'}
              </span>
            </div>

            {/* Quick Actions triggers */}
            <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-4 select-none">
              <button
                onClick={handleCall}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <Phone size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Call</span>
              </button>

              <button
                onClick={handleEmail}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <Mail size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Email</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTab('followups');
                  setShowFollowUpModal(true);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <CalendarDays size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">FollowUp</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTab('activities');
                  toast.info('Activities Tab', 'Add activities scheduled under dashboard.');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <ActivitySquare size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Activity</span>
              </button>

              <button
                onClick={() => setSelectedTab('workflows')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <Zap size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Trigger</span>
              </button>

              <button
                onClick={() => setShowAssignOwnerModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1 focus:outline-none"
              >
                <UserCheck size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Assign</span>
              </button>
            </div>

            {/* General details list */}
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Phone Number</span>
                <span className="font-semibold">{currentContact.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Primary Email</span>
                <span className="font-semibold break-all text-right max-w-[185px]">{currentContact.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Account Owner</span>
                <span className="font-bold text-slate-750">
                  {currentContact.owner ? `${currentContact.owner.firstName} ${currentContact.owner.lastName}` : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Created Date</span>
                <span className="font-semibold text-slate-500">{new Date(currentContact.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action buttons */}
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
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTER PANEL (45%) - Automation Tabs Content */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Scrollable Tabs */}
          <div className="bg-white border border-slate-150 rounded-2xl p-1.5 flex gap-1 select-none overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'lifecycle', label: 'Lifecycle stages' },
              { id: 'preferences', label: 'GDPR & Preferences' },
              { id: 'segments', label: 'Segments Builder' },
              { id: 'workflows', label: 'Automation Rules' },
              { id: 'followups', label: 'Follow-ups' },
              { id: 'communications', label: 'Communications Log' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'activities', label: 'Activities' },
              { id: 'notes', label: 'Notes' },
              { id: 'files', label: 'Files' },
              { id: 'history', label: 'Audit Logs' }
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
                <div>
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">First Name</span>
                      <p className="font-semibold text-slate-750 mt-0.5">{currentContact.firstName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Last Name</span>
                      <p className="font-semibold text-slate-750 mt-0.5">{currentContact.lastName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Company</span>
                      <p className="font-bold text-brand-600 mt-0.5">{currentContact.company?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Preferred Language</span>
                      <p className="font-semibold text-slate-750 mt-0.5">{currentContact.preferredLanguage || 'en'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Auditing Fields</h4>
                  <div className="space-y-1.5 text-[10px] text-slate-400 font-semibold font-mono">
                    <div>UUID: {currentContact.id}</div>
                    <div>Created By: {currentContact.createdBy || 'system'}</div>
                    <div>Last Modified: {new Date(currentContact.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

            {/* LIFECYCLE STAGES TAB */}
            {selectedTab === 'lifecycle' && (
              <div className="space-y-6 animate-fade-in text-slate-700 text-xs">
                
                {/* Horizontal Stage Progression */}
                <div className="space-y-4 select-none">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>Stage Progress</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Active for {lifecycle?.durationInStage || 0} days</span>
                  </h4>
                  
                  <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 no-scrollbar">
                    {['Prospect', 'Qualified', 'Customer', 'VIP Customer', 'Archived'].map((stage, idx) => {
                      const isActive = lifecycle?.currentStage === stage;
                      return (
                        <div key={stage} className="flex items-center flex-1 min-w-[80px]">
                          <button
                            onClick={() => handleStageUpdate(stage)}
                            className={`w-full py-2 px-1 text-center text-[10px] font-bold rounded-xl border transition-all ${
                              isActive
                                ? 'bg-brand-550 border-brand-550 text-white shadow-glossy-sm'
                                : 'bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {stage}
                          </button>
                          {idx < 4 && <ArrowRight size={12} className="text-slate-300 mx-1 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended next stage banner */}
                {recommendedStage.stage !== 'None' && (
                  <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex items-start gap-3">
                    <Sparkles size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-bold text-brand-800 text-[11px] uppercase tracking-wide">Next Recommended Stage: {recommendedStage.stage}</h5>
                      <p className="text-brand-650 font-medium mt-0.5 leading-relaxed">{recommendedStage.rationale}</p>
                    </div>
                  </div>
                )}

                {/* Stage history timeline logs */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 mb-3.5 uppercase tracking-wide text-[10px] text-slate-400">Lifecycle Stage History Logs</h4>
                  
                  {stageHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic">
                      <Clock size={16} className="mx-auto opacity-30 mb-1" />
                      No stage transitions recorded yet.
                    </div>
                  ) : (
                    <div className="relative pl-4 border-l border-slate-100 space-y-4">
                      {stageHistory.map((hist: any, index: number) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-350 border border-white" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-500">
                              {hist.fromStage || 'Prospect'} → {hist.toStage}
                            </span>
                            <p className="text-[10px] text-slate-450 font-medium">{hist.reason || 'No description provided'}</p>
                            <span className="text-[9px] text-slate-400 font-semibold block">{new Date(hist.transitionDate).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* GDPR & PREFERENCES TAB */}
            {selectedTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in text-slate-700 text-xs">
                
                <form onSubmit={handleSavePreferences} className="space-y-5">
                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Communication Channels</h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Channel</label>
                        <select
                          value={preferences?.preferredChannel || 'Email'}
                          onChange={(e) => updatePreferences(currentContact.id, { ...preferences, preferredChannel: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl"
                        >
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="SMS">SMS</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Timeframe</label>
                        <select
                          value={preferences?.preferredTime || 'Morning'}
                          onChange={(e) => updatePreferences(currentContact.id, { ...preferences, preferredTime: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Consents checkboxes */}
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Marketing Consent & GDPR</h4>
                    <div className="space-y-3">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences?.gdprConsent || false}
                          onChange={(e) => updatePreferences(currentContact.id, { ...preferences, gdprConsent: e.target.checked })}
                          className="rounded border-slate-350 text-brand-550 focus:ring-brand-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">GDPR Compliance Consent</span>
                          <span className="text-[10px] text-slate-450 font-medium">Record explicit data processing consent for compliance logs.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences?.marketingConsent || false}
                          onChange={(e) => updatePreferences(currentContact.id, { ...preferences, marketingConsent: e.target.checked })}
                          className="rounded border-slate-350 text-brand-550 focus:ring-brand-500 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">Marketing Communications Consent</span>
                          <span className="text-[10px] text-slate-450 font-medium">Allow sending of product promotional and sales material.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Buying details preferences */}
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Corporate Customer Preferences</h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Product Interest</label>
                        <input
                          type="text"
                          value={preferences?.favoriteProduct || ''}
                          onChange={(e) => updatePreferences(currentContact.id, { ...preferences, favoriteProduct: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">buying frequency</label>
                        <select
                          value={preferences?.buyingFrequency || 'Annually'}
                          onChange={(e) => updatePreferences(currentContact.id, { ...preferences, buyingFrequency: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Annually">Annually</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <Button
                      type="submit"
                      className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-glossy"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </form>

              </div>
            )}

            {/* SEGMENT BUILDER TAB */}
            {selectedTab === 'segments' && (
              <div className="space-y-6 animate-fade-in text-slate-700 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><Filter size={14} /> Mapped Segments</h4>
                  <Button
                    onClick={() => setShowSegmentModal(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-glossy"
                  >
                    Build Segment Rules
                  </Button>
                </div>

                {/* List dynamic matched segments */}
                <div className="space-y-3.5">
                  <div className="p-4 border border-brand-100 bg-brand-50/10 rounded-2xl">
                    <h5 className="font-bold text-brand-800 text-xs">VIP Contacts in Hyderabad</h5>
                    <p className="text-brand-650 text-[10px] font-medium mt-0.5">Matched Rules: Status = VIP AND City = Hyderabad</p>
                  </div>

                  <div className="p-4 border border-slate-150 bg-slate-50/30 rounded-2xl">
                    <h5 className="font-bold text-slate-800 text-xs">Decision Authority Leads</h5>
                    <p className="text-slate-500 text-[10px] font-medium mt-0.5">Matched Rules: DecisionAuthority = Yes</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wide text-[10px] text-slate-400">Global Segment Templates</h4>
                  {segmentsList.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic">No segment definitions found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {segmentsList.map((seg, idx) => (
                        <div key={idx} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50">
                          <h6 className="font-bold text-slate-800 text-[11px]">{seg.name}</h6>
                          <p className="text-[10px] text-slate-450 line-clamp-2 mt-0.5">{seg.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* AUTOMATION WORKFLOWS TAB */}
            {selectedTab === 'workflows' && (
              <div className="space-y-6 animate-fade-in text-slate-700 text-xs">
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><Zap size={14} /> Workflow Triggers</h4>
                  <Button
                    onClick={() => setShowWorkflowModal(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-glossy"
                  >
                    Create Workflow
                  </Button>
                </div>

                {/* Automation triggers list */}
                <div className="space-y-3">
                  <div className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-shadow">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1.5">
                      <span className="px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">ACTIVE</span>
                      <span>LIFECYCLE_CHANGED</span>
                    </div>
                    <h5 className="font-bold text-slate-850 text-xs">Assign VIP Account Managers</h5>
                    <p className="text-slate-500 font-medium leading-relaxed mt-0.5">
                      Trigger: Stage changes to "VIP Customer". Action: Reassign owner to target Super Admin and schedule qualification call.
                    </p>
                  </div>

                  {workflowsList.map((wf, idx) => (
                    <div key={idx} className="border border-slate-150 p-4 rounded-2xl bg-white space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span className={`px-2 py-0.5 rounded-lg border uppercase ${wf.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-150'}`}>
                          {wf.isActive ? 'Active' : 'Draft'}
                        </span>
                        <span>{wf.triggerType}</span>
                      </div>
                      <h5 className="font-bold text-slate-850 text-xs">{wf.name}</h5>
                      <p className="text-slate-500 font-medium">Action: Create task, assign owner.</p>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* FOLLOW-UPS CALENDAR TAB */}
            {selectedTab === 'followups' && (
              <div className="space-y-6 animate-fade-in text-slate-700 text-xs">
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><CalendarDays size={14} /> Scheduled Follow-ups</h4>
                  <Button
                    onClick={() => setShowFollowUpModal(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-glossy"
                  >
                    Schedule Follow-up
                  </Button>
                </div>

                {followups.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                    <Calendar className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                    No scheduled follow-up alerts setup.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {followups.map((f: any) => (
                      <div key={f.id} className="border border-slate-150 p-4 rounded-2xl bg-white space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 text-[9px] font-bold rounded-lg uppercase">
                              {f.type}
                            </span>
                            <span className="font-bold text-slate-800 text-xs">{f.priority} Priority</span>
                          </div>
                          <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1"><Clock size={11} /> {new Date(f.date).toLocaleDateString()}</span>
                        </div>
                        {f.notes && <p className="text-slate-500 font-medium">{f.notes}</p>}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-50 mt-1 uppercase tracking-wide select-none">
                          <span>Status: <span className={f.status === 'Completed' ? 'text-emerald-700' : 'text-slate-700'}>{f.status}</span></span>
                          {f.reminderActive && <span className="text-brand-650">Reminder Enabled</span>}
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
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 rounded-lg uppercase">{comm.type}</span>
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

            {/* TIMELINE TAB */}
            {selectedTab === 'timeline' && (
              <div className="space-y-4 animate-fade-in">
                <input
                  type="text"
                  placeholder="Search timeline..."
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />

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
                          <p className="text-xs text-slate-655 font-medium">{item.description}</p>
                          <span className="text-[9px] text-slate-450 font-semibold block pt-0.5">By {item.createdBy || 'system'}</span>
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
                </div>

                {activities.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-medium">No scheduled activities found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((act) => (
                      <div key={act.id} className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-shadow flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 text-[9px] font-bold rounded-md uppercase">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTES TAB */}
            {selectedTab === 'notes' && (
              <div className="space-y-4 animate-fade-in">
                
                <form onSubmit={handleSaveNote} className="space-y-2.5 p-3 border border-slate-150 rounded-2xl bg-slate-50/30">
                  <input
                    type="text"
                    placeholder="Note Title (optional)..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-150 rounded-xl bg-white focus:outline-none font-semibold text-slate-700"
                  />
                  <textarea
                    placeholder="Write note content..."
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

                <input
                  type="text"
                  placeholder="Search notes..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />

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
              </div>
            )}

            {/* FILES TAB */}
            {selectedTab === 'files' && (
              <div className="space-y-4 animate-fade-in">
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
                          onClick={() => toast.success('Download File', `Simulating download: ${file.name}`)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-650"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LOGS HISTORY TAB */}
            {selectedTab === 'history' && (
              <div className="space-y-4 animate-fade-in text-slate-700 text-xs">
                <input
                  type="text"
                  placeholder="Search history logs..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs mb-3"
                />

                {history.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic">No history log entries found.</div>
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
                        {history.map((h) => (
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
        {/* RIGHT PANEL (25%) - Score, Risk, & Reminders Sidebar */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6 select-none text-slate-700 text-xs">
          
          {/* Scoring Card */}
          {score && (
            <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Award size={13} className="text-amber-500" /> Customer Score Card
              </h4>
              <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl text-center space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Rule-Based Score</span>
                <span className="text-2xl font-black text-slate-800">{score.overallScore} <span className="text-xs text-slate-400">/ 100</span></span>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                  <div>Comm: <span className="font-bold text-slate-700">{score.communicationFreq}%</span></div>
                  <div>Meeting: <span className="font-bold text-slate-700">{score.meetingFreq}%</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Card */}
          {risk && (
            <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle size={13} className="text-rose-500" /> Customer Risk Score
              </h4>
              <div className={`p-3 rounded-2xl border text-center font-bold uppercase text-[10px] ${
                risk.riskLevel === 'High' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}>
                {risk.riskLevel} Risk Level
              </div>
              <div className="space-y-1 px-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Risk Factors:</span>
                {risk.riskFactors.map((f: string) => (
                  <span key={f} className="inline-block px-1.5 py-0.5 bg-slate-50 border border-slate-150 text-[9px] font-semibold rounded text-slate-600 mr-1 mt-1">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Card */}
          {recommendations.length > 0 && (
            <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkle size={13} className="text-brand-600 animate-spin" style={{ animationDuration: '6s' }} /> Suggestions Engine
              </h4>
              <div className="space-y-2.5">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase">
                      <span>{rec.type}</span>
                      <span className="text-brand-600">{rec.priority}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-750 leading-snug">{rec.suggestionText}</p>
                    {rec.bestContactTime && (
                      <span className="text-[9px] text-slate-450 font-bold block">Best Time: {rec.bestContactTime}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminders Card */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg space-y-3">
            <h4 className="text-xs font-bold text-slate-850 border-b border-slate-100 pb-2 uppercase tracking-wide">
              Smart Reminders
            </h4>
            <div className="space-y-2.5 text-[10px] font-bold text-slate-500 uppercase">
              <div className="flex justify-between items-center p-1.5 border border-slate-100 rounded-xl bg-slate-50/30">
                <span>Upcoming Birthdays</span>
                <span className="text-slate-800">None Scheduled</span>
              </div>
              <div className="flex justify-between items-center p-1.5 border border-slate-100 rounded-xl bg-slate-50/30">
                <span>Work Anniversary</span>
                <span className="text-slate-800">Sept 12</span>
              </div>
              <div className="flex justify-between items-center p-1.5 border border-slate-100 rounded-xl bg-slate-50/30">
                <span>Contract Renewal</span>
                <span className="text-brand-600">90 Days Left</span>
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Reason for transfer</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                />
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

      {/* MODAL: FOLLOW-UP SCHEDULER */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Schedule Follow-up</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set up callback reminders, demos, or renewal checkpoints.</p>

            <form onSubmit={handleSubmitFollowup(onSubmitFollowup)} className="space-y-3.5 text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Follow-up Type</label>
                <select
                  {...registerFollowup('type')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Visit">Visit</option>
                  <option value="Demo">Demo</option>
                  <option value="Support Call">Support Call</option>
                  <option value="Renewal Reminder">Renewal Reminder</option>
                  <option value="Custom">Custom Follow-up</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Date *</label>
                  <input
                    type="date"
                    {...registerFollowup('date')}
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50/50 text-xs ${followupErrors.date ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    {...registerFollowup('time')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Priority</label>
                <select
                  {...registerFollowup('priority')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 font-semibold select-none">
                <input
                  type="checkbox"
                  {...registerFollowup('reminderActive')}
                  className="rounded border-slate-350 text-brand-550 focus:ring-brand-500"
                />
                Enable upcoming dashboard alerts
              </label>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Notes / Outcome History</label>
                <textarea
                  rows={2}
                  {...registerFollowup('notes')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end mt-4 select-none">
                <Button
                  variant="outline"
                  onClick={() => setShowFollowUpModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Schedule Follow-up
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEGMENT BUILDER */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Build Dynamic Segment Rules</h3>
            <p className="text-[10px] text-slate-450 font-medium mb-4">Filter contacts dynamically using logical AND/OR constraints.</p>

            <form onSubmit={handleCreateSegment} className="space-y-4 text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Segment Name</label>
                <input
                  type="text"
                  placeholder="e.g. High Value Leads"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs"
                />
              </div>

              {/* Rules block */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Rule constraint 1</span>
                <div className="grid grid-cols-3 gap-1">
                  <select className="px-2 py-1.5 border border-slate-150 rounded bg-white text-[10px]">
                    <option value="industry">Industry</option>
                    <option value="status">Status</option>
                    <option value="revenue">Annual Revenue</option>
                  </select>
                  <select className="px-2 py-1.5 border border-slate-150 rounded bg-white text-[10px]">
                    <option value="equals">Equals</option>
                    <option value="greater_than">Greater than</option>
                  </select>
                  <input
                    type="text"
                    defaultValue="Technology"
                    className="px-2 py-1 border border-slate-150 rounded bg-white text-[10px]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSegmentModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newSegmentName.trim()}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Build Segment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WORKFLOW AUTOMATION BUILDER */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Create Workflow Rule</h3>
            <p className="text-[10px] text-slate-450 font-medium mb-4">Set action handlers to execute automatically on events trigger.</p>

            <form onSubmit={handleCreateWorkflow} className="space-y-4 text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Workflow Name *</label>
                <input
                  type="text"
                  placeholder="e.g. auto assign leads"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Event Trigger</label>
                <select
                  value={newWorkflowTrigger}
                  onChange={(e) => setNewWorkflowTrigger(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold text-slate-650"
                >
                  <option value="CONTACT_CREATED">Contact Created</option>
                  <option value="LIFECYCLE_CHANGED">Lifecycle Stage Changed</option>
                  <option value="TAG_ADDED">Tag Added to Contact</option>
                  <option value="STATUS_CHANGED">Status Changed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Action Type</label>
                  <select
                    value={workflowActionType}
                    onChange={(e) => setWorkflowActionType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs"
                  >
                    <option value="Create Task">Create Task</option>
                    <option value="Assign Owner">Assign Owner</option>
                    <option value="Add Tag">Add Tag</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Action Value</label>
                  <input
                    type="text"
                    value={workflowActionValue}
                    onChange={(e) => setWorkflowActionValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 select-none">
                <Button
                  variant="outline"
                  onClick={() => setShowWorkflowModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newWorkflowName.trim()}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Build Workflow
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FILE UPLOAD */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg select-none">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Attach Corporate Document</h3>
            <p className="text-[10px] text-slate-450 font-medium mb-4">Simulate file upload. Enter file details metadata.</p>

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

    </div>
  );
};

export default ContactProfile;
