import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Building2, Globe, Mail, Phone, MapPin,
  Edit2, Trash2, Archive, UserCheck, Star,
  AlertCircle, Clock, FileText,
  CreditCard, Briefcase, Activity, Calendar,
  MessageSquare, FolderOpen, Users, BarChart3,
  History, Plus, Search, Filter, Download,
  FileIcon, Trash as TrashIcon, Pin, PinOff,
  CalendarDays, CheckCircle2, XCircle, Loader2,
  ChevronRight, Sparkles, Zap, User, Link2,
  FileSpreadsheet, FileImage, FileArchive,
  Play, Send, Video, HelpCircle, AlertTriangle,
  CheckSquare, Square, Upload,
} from 'lucide-react';
import { useCompanyStore } from '../../store/companyStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Skeleton } from '../../components/ui/Skeleton';
import type { CompanyNote, CompanyActivity, CompanyFile, CompanyTimelineEvent, CompanyHistoryEntry } from '../../types/company';

export const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    currentCompany, fetchCompany, deleteCompany, updateCompany, clearCurrentCompany,
    loading, error, employees, fetchEmployees,
    timeline, activities, notes, files, history,
    fetchTimeline, fetchActivities, createActivity, updateActivity, deleteActivity,
    fetchNotes, createNote, updateNote, deleteNote,
    fetchFiles, uploadFile, deleteFile, fetchHistory,
  } = useCompanyStore();

  const [selectedTab, setSelectedTab] = useState('overview');

  // Overview sub-tabs
  const [overviewSubTab, setOverviewSubTab] = useState('overview');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetOwnerId, setTargetOwnerId] = useState('');

  // Activity state
  const [newActivityType, setNewActivityType] = useState('Call');
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityDate, setNewActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [newActivityPriority, setNewActivityPriority] = useState('Medium');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');

  // Note state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePinned, setNewNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteSearch, setNoteSearch] = useState('');

  // File state
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('application/pdf');
  const [uploadFileSize, setUploadFileSize] = useState('1.2 MB');
  const [fileSearch, setFileSearch] = useState('');

  // Timeline & History search
  const [timelineSearch, setTimelineSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    if (id) {
      fetchCompany(id);
      fetchEmployees();
    }
    return () => { clearCurrentCompany(); };
  }, [id]);

  useEffect(() => {
    if (currentCompany) {
      setTargetOwnerId(currentCompany.ownerId || '');
    }
  }, [currentCompany]);

  useEffect(() => {
    if (id) {
      switch (selectedTab) {
        case 'timeline': fetchTimeline(id); break;
        case 'activities': fetchActivities(id); break;
        case 'notes': fetchNotes(id); break;
        case 'files': fetchFiles(id); break;
        case 'history': fetchHistory(id); break;
      }
    }
  }, [id, selectedTab]);

  const handleDelete = async () => {
    if (!currentCompany) return;
    if (confirm(`Delete company "${currentCompany.name}"?`)) {
      try {
        await deleteCompany(currentCompany.id);
        toast.success('Company Deleted', `${currentCompany.name} has been deleted.`);
        navigate('/companies');
      } catch {
        toast.error('Delete Failed', 'Failed to delete company.');
      }
    }
  };

  const handleArchive = async () => {
    if (!currentCompany) return;
    try {
      await updateCompany(currentCompany.id, { status: 'Archived' } as any);
      toast.success('Company Archived', 'Status changed to Archived.');
      fetchCompany(currentCompany.id);
    } catch {
      toast.error('Archive Failed', 'Failed to archive company.');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Customer': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Partner': 'bg-blue-50 text-blue-700 border-blue-100',
      'Prospect': 'bg-amber-50 text-amber-700 border-amber-100',
      'Vendor': 'bg-purple-50 text-purple-700 border-purple-100',
      'Supplier': 'bg-teal-50 text-teal-700 border-teal-100',
      'Distributor': 'bg-cyan-50 text-cyan-700 border-cyan-100',
      'Inactive': 'bg-slate-50 text-slate-600 border-slate-200',
      'Archived': 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return map[status] || 'bg-slate-50 text-slate-650 border-slate-200';
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatRevenue = (val?: number) => {
    if (!val) return '-';
    if (val >= 10000000) return `$${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `$${(val / 100000).toFixed(1)}L`;
    return `$${(val / 1000).toFixed(0)}K`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '-';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'Call': return Phone;
      case 'Meeting': return Video;
      case 'Email': return Mail;
      case 'Visit': return MapPin;
      case 'Demo': return Play;
      case 'Presentation': return FileText;
      case 'Support': return HelpCircle;
      default: return Activity;
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('pdf')) return FileText;
    if (mime.includes('image')) return FileImage;
    if (mime.includes('zip') || mime.includes('rar')) return FileArchive;
    if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) return FileSpreadsheet;
    return FileIcon;
  };

  // Notes handlers
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !id) return;
    try {
      if (editingNoteId) {
        await updateNote(id, editingNoteId, { title: newNoteTitle, content: newNoteContent, isPinned: newNotePinned });
        toast.success('Note Updated', 'Note updated successfully.');
        setEditingNoteId(null);
      } else {
        await createNote(id, { title: newNoteTitle, content: newNoteContent, isPinned: newNotePinned });
        toast.success('Note Saved', 'New note created.');
      }
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNotePinned(false);
    } catch {
      toast.error('Notes Error', 'Failed to save note.');
    }
  };

  const handleEditNote = (note: CompanyNote) => {
    setEditingNoteId(note.id);
    setNewNoteTitle(note.title || '');
    setNewNoteContent(note.content);
    setNewNotePinned(note.isPinned);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!id || !confirm('Delete this note?')) return;
    try {
      await deleteNote(id, noteId);
      toast.success('Note Deleted', 'Note deleted successfully.');
    } catch {
      toast.error('Notes Error', 'Failed to delete note.');
    }
  };

  const handleTogglePinNote = async (note: CompanyNote) => {
    if (!id) return;
    try {
      await updateNote(id, note.id, { isPinned: !note.isPinned });
    } catch {
      toast.error('Error', 'Failed to update note pin.');
    }
  };

  // Activity handlers
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim() || !id) return;
    try {
      if (editingActivityId) {
        await updateActivity(id, editingActivityId, {
          type: newActivityType, title: newActivityTitle, description: newActivityDesc,
          activityDate: newActivityDate, priority: newActivityPriority,
        });
        toast.success('Activity Updated', 'Activity updated successfully.');
        setEditingActivityId(null);
      } else {
        await createActivity(id, {
          type: newActivityType, title: newActivityTitle, description: newActivityDesc,
          activityDate: newActivityDate, priority: newActivityPriority, status: 'Open',
        });
        toast.success('Activity Created', 'New activity logged.');
      }
      setNewActivityType('Call');
      setNewActivityTitle('');
      setNewActivityDesc('');
      setNewActivityDate(new Date().toISOString().split('T')[0]);
      setNewActivityPriority('Medium');
    } catch {
      toast.error('Activity Error', 'Failed to save activity.');
    }
  };

  const handleEditActivity = (act: CompanyActivity) => {
    setEditingActivityId(act.id);
    setNewActivityType(act.type);
    setNewActivityTitle(act.title);
    setNewActivityDesc(act.description || '');
    setNewActivityDate(act.activityDate.split('T')[0]);
    setNewActivityPriority(act.priority);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!id || !confirm('Delete this activity?')) return;
    try {
      await deleteActivity(id, activityId);
      toast.success('Activity Deleted', 'Activity removed.');
    } catch {
      toast.error('Activity Error', 'Failed to delete activity.');
    }
  };

  // File handlers
  const handleUploadFile = async () => {
    if (!uploadFileName.trim() || !id) return;
    try {
      const sizeBytes = uploadFileSize === '1.2 MB' ? 1258291 : 314572;
      await uploadFile(id, { name: uploadFileName, path: `/uploads/${uploadFileName}`, mimeType: uploadFileType, size: sizeBytes });
      toast.success('File Uploaded', `${uploadFileName} uploaded successfully.`);
      setShowFileUpload(false);
      setUploadFileName('');
    } catch {
      toast.error('Upload Error', 'Failed to upload file.');
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!id || !confirm(`Delete "${fileName}"?`)) return;
    try {
      await deleteFile(id, fileId);
      toast.success('File Deleted', 'File removed.');
    } catch {
      toast.error('File Error', 'Failed to delete file.');
    }
  };

  // Computed filtered lists
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = !activitySearch || a.title.toLowerCase().includes(activitySearch.toLowerCase());
      const matchesType = !activityTypeFilter || a.type === activityTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [activities, activitySearch, activityTypeFilter]);

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

  const filteredTimeline = useMemo(() => {
    if (!timelineSearch) return timeline;
    return timeline.filter(t =>
      t.title.toLowerCase().includes(timelineSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(timelineSearch.toLowerCase()))
    );
  }, [timeline, timelineSearch]);

  const filteredHistory = useMemo(() => {
    if (!historySearch) return history;
    return history.filter(h =>
      h.action.toLowerCase().includes(historySearch.toLowerCase()) ||
      (h.fieldName && h.fieldName.toLowerCase().includes(historySearch.toLowerCase())) ||
      (h.oldValue && h.oldValue.toLowerCase().includes(historySearch.toLowerCase())) ||
      (h.newValue && h.newValue.toLowerCase().includes(historySearch.toLowerCase()))
    );
  }, [history, historySearch]);

  if (loading && !currentCompany) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><Skeleton className="h-[400px] w-full" /></div>
          <div className="lg:col-span-6"><Skeleton className="h-[500px] w-full" /></div>
          <div className="lg:col-span-3"><Skeleton className="h-[400px] w-full" /></div>
        </div>
      </div>
    );
  }

  if (error || !currentCompany) {
    return (
      <div className="bg-white/80 border border-slate-150 p-12 rounded-3xl text-center shadow-glossy-lg max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Company Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'The requested company was not found.'}</p>
        <Link to="/companies"><Button className="bg-brand-550 text-white font-bold text-xs px-4 py-2 rounded-xl">Back to Companies</Button></Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'activities', label: 'Activities' },
    { id: 'notes', label: 'Notes' },
    { id: 'files', label: 'Files' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'communications', label: 'Communications' },
    { id: 'history', label: 'History' },
  ];

  const overviewTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'business', label: 'Business Info' },
    { id: 'contact', label: 'Contact & Tax' },
    { id: 'address', label: 'Address' },
  ];

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'COMPANY_CREATED': return 'bg-emerald-500';
      case 'COMPANY_UPDATED': return 'bg-blue-500';
      case 'NOTE_ADDED': return 'bg-violet-500';
      case 'ACTIVITY_LOGGED': return 'bg-amber-500';
      case 'DOCUMENT_UPLOADED': return 'bg-cyan-500';
      default: return 'bg-slate-400';
    }
  };

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  const recentTimeline = timeline.slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/companies" className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <Breadcrumb items={[{ label: 'Companies', href: '/companies' }, { label: currentCompany.companyNumber }]} />
          </div>
          <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wide">|</span>
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Sparkles size={12} className="text-brand-500" />
            Company 360° Workspace
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/companies/${currentCompany.id}/edit`)} className="text-xs">
            <Edit2 size={14} /> Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={handleArchive} className="text-xs">
            <Archive size={14} /> Archive
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} className="text-xs">
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ===== LEFT PANEL (25%) ===== */}
        <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-2xl text-brand-650 uppercase shadow-glossy-sm">
                {currentCompany.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight">{currentCompany.displayName || currentCompany.name}</h2>
                {currentCompany.industry && (
                  <p className="text-xs text-slate-450 font-bold mt-0.5 flex items-center justify-center gap-1">
                    <Briefcase size={12} /> {currentCompany.industry}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(currentCompany.status)}`}>
                  {currentCompany.status}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityColor(currentCompany.priority)}`}>
                  {currentCompany.priority}
                </span>
              </div>
            </div>

            <div className="border-t border-b border-slate-100 py-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Code</span>
                <span className="font-mono font-bold text-slate-600">{currentCompany.companyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Owner</span>
                <span className="font-semibold">
                  {currentCompany.owner ? `${currentCompany.owner.firstName} ${currentCompany.owner.lastName}` : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Created</span>
                <span className="font-semibold text-slate-500">{new Date(currentCompany.createdAt).toLocaleDateString()}</span>
              </div>
              {currentCompany.foundedYear && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Founded</span>
                  <span className="font-semibold">{currentCompany.foundedYear}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 select-none">
              <a href={currentCompany.website ? `https://${currentCompany.website}` : '#'}
                target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"
              >
                <Globe size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase">Website</span>
              </a>
              <a href={currentCompany.primaryEmail ? `mailto:${currentCompany.primaryEmail}` : '#'}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"
              >
                <Mail size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase">Email</span>
              </a>
              <a href={currentCompany.primaryPhone ? `tel:${currentCompany.primaryPhone}` : '#'}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"
              >
                <Phone size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase">Call</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(true)} className="w-full justify-center text-xs">
                <UserCheck size={12} /> Assign
              </Button>
              <Link to={`/companies/${currentCompany.id}/edit`}>
                <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                  <Edit2 size={12} /> Edit
                </Button>
              </Link>
            </div>

            {currentCompany.tags && currentCompany.tags.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {currentCompany.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== CENTER PANEL (50%) ===== */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar select-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-2 text-[11px] font-bold transition-all rounded-xl whitespace-nowrap ${
                  selectedTab === tab.id ? 'bg-slate-800 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg min-h-[450px]">

            {/* ===== OVERVIEW TAB ===== */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-150 rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar select-none">
                  {overviewTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOverviewSubTab(tab.id)}
                      className={`px-3 py-2 text-[10px] font-bold transition-all rounded-xl whitespace-nowrap ${
                        overviewSubTab === tab.id ? 'bg-slate-800 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="animate-fade-in">
                  {overviewSubTab === 'overview' && (
                    <div className="space-y-6 text-xs text-slate-700">
                      <div>
                        <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                          <Building2 size={14} /> Company Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Company Name</span>
                            <p className="font-semibold text-slate-750 mt-0.5">{currentCompany.name}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Type</span>
                            <p className="font-semibold mt-0.5">{currentCompany.companyType || '-'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Industry</span>
                            <p className="font-semibold mt-0.5">{currentCompany.industry || '-'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Employees</span>
                            <p className="font-semibold mt-0.5">{currentCompany.employeeCount?.toLocaleString() || '-'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Annual Revenue</span>
                            <p className="font-semibold mt-0.5">{formatRevenue(currentCompany.annualRevenue)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Website</span>
                            <p className="font-semibold mt-0.5">{currentCompany.website ? (
                              <a href={`https://${currentCompany.website}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{currentCompany.website}</a>
                            ) : '-'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Rating</span>
                            <p className="font-semibold mt-0.5 flex items-center gap-1">
                              {currentCompany.rating ? (
                                Array.from({ length: currentCompany.rating }, (_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)
                              ) : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Parent Company</span>
                            <p className="font-semibold mt-0.5">{currentCompany.parentCompany?.name || '-'}</p>
                          </div>
                        </div>
                      </div>
                      {currentCompany.description && (
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Description</h4>
                          <p className="text-slate-600 leading-relaxed">{currentCompany.description}</p>
                        </div>
                      )}
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                          <Clock size={14} /> Audit Trail
                        </h4>
                        <div className="space-y-1 text-[10px] text-slate-400 font-semibold font-mono">
                          <div>UUID: {currentCompany.id}</div>
                          <div>Version: {currentCompany.version}</div>
                          <div>Created By: {currentCompany.createdBy || 'system'}</div>
                          <div>Last Updated: {new Date(currentCompany.updatedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {overviewSubTab === 'business' && (
                    <div className="space-y-5 text-xs text-slate-700">
                      <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                        <Briefcase size={14} /> Business Information
                      </h4>
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Legal Name</span><p className="font-semibold mt-0.5">{currentCompany.legalName || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Display Name</span><p className="font-semibold mt-0.5">{currentCompany.displayName || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Company Type</span><p className="font-semibold mt-0.5">{currentCompany.companyType || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Sub Industry</span><p className="font-semibold mt-0.5">{currentCompany.subIndustry || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Business Category</span><p className="font-semibold mt-0.5">{currentCompany.businessCategory || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Ownership Type</span><p className="font-semibold mt-0.5">{currentCompany.ownershipType || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Founded Year</span><p className="font-semibold mt-0.5">{currentCompany.foundedYear || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Employee Count</span><p className="font-semibold mt-0.5">{currentCompany.employeeCount?.toLocaleString() || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Annual Revenue</span><p className="font-semibold mt-0.5">{formatRevenue(currentCompany.annualRevenue)}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Parent Company</span><p className="font-semibold mt-0.5">{currentCompany.parentCompany?.name || '-'}</p></div>
                      </div>
                    </div>
                  )}

                  {overviewSubTab === 'contact' && (
                    <div className="space-y-5 text-xs text-slate-700">
                      <div>
                        <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                          <Mail size={14} /> Communication Details
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Primary Email</span><p className="font-semibold mt-0.5">{currentCompany.primaryEmail || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Secondary Email</span><p className="font-semibold mt-0.5">{currentCompany.secondaryEmail || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Primary Phone</span><p className="font-semibold mt-0.5">{currentCompany.primaryPhone || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Secondary Phone</span><p className="font-semibold mt-0.5">{currentCompany.secondaryPhone || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp</span><p className="font-semibold mt-0.5">{currentCompany.whatsApp || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Website</span><p className="font-semibold mt-0.5">{currentCompany.website || '-'}</p></div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                          <CreditCard size={14} /> Tax Details
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">GST Number</span><p className="font-semibold mt-0.5">{currentCompany.gstNumber || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Tax Number</span><p className="font-semibold mt-0.5">{currentCompany.taxNumber || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Registration Number</span><p className="font-semibold mt-0.5">{currentCompany.registrationNumber || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">PAN Number</span><p className="font-semibold mt-0.5">{currentCompany.panNumber || '-'}</p></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {overviewSubTab === 'address' && (
                    <div className="space-y-5 text-xs text-slate-700">
                      <div>
                        <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                          <MapPin size={14} /> Registered Address
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Country</span><p className="font-semibold mt-0.5">{currentCompany.country || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">State</span><p className="font-semibold mt-0.5">{currentCompany.state || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">City</span><p className="font-semibold mt-0.5">{currentCompany.city || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Postal Code</span><p className="font-semibold mt-0.5">{currentCompany.postalCode || '-'}</p></div>
                          <div className="col-span-2"><span className="text-[10px] text-slate-400 font-bold uppercase">Address Line 1</span><p className="font-semibold mt-0.5">{currentCompany.addressLine1 || '-'}</p></div>
                          <div className="col-span-2"><span className="text-[10px] text-slate-400 font-bold uppercase">Address Line 2</span><p className="font-semibold mt-0.5">{currentCompany.addressLine2 || '-'}</p></div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                          <FileText size={14} /> Billing & Shipping
                        </h4>
                        <div className="space-y-3">
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Billing Address</span><p className="font-semibold mt-0.5 text-slate-600">{currentCompany.billingAddress || '-'}</p></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase">Shipping Address</span><p className="font-semibold mt-0.5 text-slate-600">{currentCompany.shippingAddress || '-'}</p></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== TIMELINE TAB ===== */}
            {selectedTab === 'timeline' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <Activity size={14} /> Timeline
                  </h4>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search timeline..."
                      value={timelineSearch}
                      onChange={(e) => setTimelineSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50"
                    />
                  </div>
                </div>
                {filteredTimeline.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                    <Clock className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold">No timeline events recorded</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Events will appear as activities are logged</p>
                  </div>
                ) : (
                  <div className="relative pl-5 border-l-2 border-slate-100 space-y-5">
                    {filteredTimeline.map((event, idx) => (
                      <div key={event.id || idx} className="relative animate-fade-in">
                        <div className={`absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-glossy-sm ${getTimelineColor(event.type)}`} />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-800">{event.title}</span>
                            <span className="text-[9px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{event.type}</span>
                          </div>
                          {event.description && <p className="text-[11px] text-slate-500 leading-relaxed">{event.description}</p>}
                          <span className="text-[9px] text-slate-400 font-semibold block">
                            {new Date(event.eventDate || event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== ACTIVITIES TAB ===== */}
            {selectedTab === 'activities' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <CalendarDays size={14} /> Activities
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text" placeholder="Search activities..."
                        value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-40 bg-slate-50/50"
                      />
                    </div>
                    <select
                      value={activityTypeFilter} onChange={(e) => setActivityTypeFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium bg-slate-50/50"
                    >
                      <option value="">All Types</option>
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email</option>
                      <option value="Visit">Visit</option>
                      <option value="Demo">Demo</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>

                {/* Activity Form */}
                <form onSubmit={handleSaveActivity} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <select value={newActivityType} onChange={(e) => setNewActivityType(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white">
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email</option>
                      <option value="Visit">Visit</option>
                      <option value="Demo">Demo</option>
                      <option value="Support">Support</option>
                    </select>
                    <input type="text" placeholder="Activity title..." value={newActivityTitle} onChange={(e) => setNewActivityTitle(e.target.value)}
                      className="col-span-2 px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" required />
                    <input type="date" value={newActivityDate} onChange={(e) => setNewActivityDate(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="Description (optional)" value={newActivityDesc} onChange={(e) => setNewActivityDesc(e.target.value)}
                      className="col-span-2 px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                    <div className="flex gap-2">
                      <select value={newActivityPriority} onChange={(e) => setNewActivityPriority(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl whitespace-nowrap">
                        {editingActivityId ? 'Update' : 'Add'}
                      </Button>
                      {editingActivityId && (
                        <Button type="button" size="sm" variant="secondary" onClick={() => setEditingActivityId(null)} className="text-[10px] rounded-xl">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </form>

                {/* Activity List */}
                {filteredActivities.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                    <CalendarDays className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold">No activities logged</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Use the form above to add activities</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredActivities.map((act) => (
                      <div key={act.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${
                              act.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                              act.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                              {React.createElement(getActivityTypeIcon(act.type), { size: 14 })}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[12px] font-bold text-slate-800">{act.title}</span>
                                <span className="px-2 py-0.5 bg-slate-50 border border-slate-150 text-[9px] font-bold rounded-lg text-slate-500">{act.type}</span>
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getPriorityColor(act.priority)}`}>{act.priority}</span>
                              </div>
                              {act.description && <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>}
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[9px] text-slate-400 font-semibold">{new Date(act.activityDate).toLocaleDateString()}</span>
                                {act.assignedTo && <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><User size={10} /> {act.assignedTo.firstName} {act.assignedTo.lastName}</span>}
                                <span className={`text-[9px] font-bold ${act.isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {act.isCompleted ? 'Completed' : 'Open'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleEditActivity(act)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteActivity(act.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600">
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

            {/* ===== NOTES TAB ===== */}
            {selectedTab === 'notes' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <FileText size={14} /> Notes
                  </h4>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search notes..." value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" />
                  </div>
                </div>

                {/* Note Form */}
                <form onSubmit={handleSaveNote} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Note title (optional)" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-slate-500">
                      <input type="checkbox" checked={newNotePinned} onChange={(e) => setNewNotePinned(e.target.checked)}
                        className="rounded border-slate-350 text-brand-550" />
                      Pin
                    </label>
                  </div>
                  <textarea placeholder="Write note content..." value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] font-medium bg-white min-h-[80px] resize-none" required />
                  <div className="flex gap-2 justify-end">
                    <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-4 rounded-xl">
                      {editingNoteId ? 'Update Note' : 'Add Note'}
                    </Button>
                    {editingNoteId && (
                      <Button type="button" size="sm" variant="secondary" onClick={() => setEditingNoteId(null)} className="text-[10px] rounded-xl">
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>

                {/* Notes List */}
                {sortedNotes.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                    <FileText className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold">No notes recorded</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Use the form above to add notes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {sortedNotes.map((note) => (
                      <div key={note.id} className={`border p-4 rounded-2xl bg-white transition-all ${note.isPinned ? 'border-brand-200 bg-brand-50/20' : 'border-slate-150 hover:shadow-glossy-sm'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {note.isPinned && <Pin size={11} className="text-brand-600 fill-brand-600" />}
                              {note.title && <span className="text-[12px] font-bold text-slate-800">{note.title}</span>}
                              <span className="text-[9px] text-slate-400 font-semibold">{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleTogglePinNote(note)} className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors ${note.isPinned ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                              {note.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
                            </button>
                            <button onClick={() => handleEditNote(note)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600">
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

            {/* ===== FILES TAB ===== */}
            {selectedTab === 'files' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <FolderOpen size={14} /> Files
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Search files..." value={fileSearch} onChange={(e) => setFileSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" />
                    </div>
                    <Button onClick={() => setShowFileUpload(true)} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl">
                      <Upload size={12} /> Upload
                    </Button>
                  </div>
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                    <FolderOpen className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold">No files uploaded</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Upload documents related to this company</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredFiles.map((file) => {
                      const Icon = getFileIcon(file.mimeType);
                      return (
                        <div key={file.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex-shrink-0">
                                <Icon size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-bold text-slate-800 truncate">{file.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[9px] text-slate-400 font-medium">{formatFileSize(file.size)}</span>
                                  <span className="text-[9px] text-slate-400 font-medium">{new Date(file.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <a href={file.path} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                                <Download size={12} />
                              </a>
                              <button onClick={() => handleDeleteFile(file.id, file.name)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===== MEETINGS TAB ===== */}
            {selectedTab === 'meetings' && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <Video size={14} /> Meetings
                </h4>
                <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                  <Calendar className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                  <p className="text-xs font-semibold">Meetings module coming soon</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">This tab will display scheduled meetings and call logs</p>
                </div>
              </div>
            )}

            {/* ===== TASKS TAB ===== */}
            {selectedTab === 'tasks' && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <CheckSquare size={14} /> Tasks
                </h4>
                <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                  <BarChart3 className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                  <p className="text-xs font-semibold">Tasks module coming soon</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">This tab will display tasks linked to this company</p>
                </div>
              </div>
            )}

            {/* ===== COMMUNICATIONS TAB ===== */}
            {selectedTab === 'communications' && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <MessageSquare size={14} /> Communications
                </h4>
                <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                  <Send className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                  <p className="text-xs font-semibold">Communications module coming soon</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">This tab will display email and message history</p>
                </div>
              </div>
            )}

            {/* ===== HISTORY TAB ===== */}
            {selectedTab === 'history' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <History size={14} /> Audit History
                  </h4>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search history..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" />
                  </div>
                </div>
                {filteredHistory.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none">
                    <History className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" />
                    <p className="text-xs font-semibold">No history entries recorded</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Changes to company data will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredHistory.map((entry) => (
                      <div key={entry.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex-shrink-0">
                              <History size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[12px] font-bold text-slate-800">{entry.action}</span>
                                {entry.fieldName && <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{entry.fieldName}</span>}
                              </div>
                              {(entry.oldValue || entry.newValue) && (
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                                  {entry.oldValue && <span className="text-rose-500 line-through">{entry.oldValue}</span>}
                                  {entry.oldValue && entry.newValue && <ChevronRight size={10} className="text-slate-300" />}
                                  {entry.newValue && <span className="text-emerald-600">{entry.newValue}</span>}
                                </div>
                              )}
                              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                                {new Date(entry.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ===== RIGHT PANEL (25%) ===== */}
        <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-4">
          {/* Recent Timeline */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Activity size={12} /> Recent Activity
            </h5>
            {recentTimeline.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-2.5">
                {recentTimeline.map((event, idx) => (
                  <div key={event.id || idx} className="flex items-start gap-2.5 text-xs">
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getTimelineColor(event.type)}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700 leading-tight truncate">{event.title}</p>
                      <span className="text-[9px] text-slate-400">{new Date(event.eventDate || event.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Activities */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CalendarDays size={12} /> Open Activities
            </h5>
            {activities.filter(a => !a.isCompleted).length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">No open activities</p>
            ) : (
              <div className="space-y-2">
                {activities.filter(a => !a.isCompleted).slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-center gap-2.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      act.priority === 'High' ? 'bg-rose-50 text-rose-500' :
                      act.priority === 'Medium' ? 'bg-amber-50 text-amber-500' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      {React.createElement(getActivityTypeIcon(act.type), { size: 11 })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700 truncate">{act.title}</p>
                      <span className="text-[9px] text-slate-400">{new Date(act.activityDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notes */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FileText size={12} /> Recent Notes
            </h5>
            {notes.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">No notes yet</p>
            ) : (
              <div className="space-y-2.5">
                {notes.slice(0, 4).map((note) => (
                  <div key={note.id} className="text-xs border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                    <p className="text-[11px] font-semibold text-slate-700 truncate">{note.title || 'Untitled'}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{note.content}</p>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Files */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-glossy-lg">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FolderOpen size={12} /> Recent Files
            </h5>
            {files.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">No files uploaded</p>
            ) : (
              <div className="space-y-2">
                {files.slice(0, 4).map((file) => {
                  const Icon = getFileIcon(file.mimeType);
                  return (
                    <div key={file.id} className="flex items-center gap-2.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                      <Icon size={12} className="text-slate-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-700 truncate">{file.name}</p>
                        <span className="text-[9px] text-slate-400">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Owner Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Assign Owner</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Reassign company account owner.</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Employee</label>
                <select value={targetOwnerId} onChange={(e) => setTargetOwnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white">
                  <option value="">Select owner...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" onClick={async () => {
                  try {
                    await updateCompany(currentCompany!.id, { ownerId: targetOwnerId } as any);
                    toast.success('Owner Assigned', 'Company owner updated.');
                    setShowAssignModal(false);
                    fetchCompany(currentCompany!.id);
                  } catch {
                    toast.error('Failed', 'Owner assignment failed.');
                  }
                }} disabled={!targetOwnerId} className="text-xs">Assign</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Upload File</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Attach a document to this company.</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">File Name</label>
                <input type="text" value={uploadFileName} onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white" placeholder="e.g., contract.pdf" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                  <select value={uploadFileType} onChange={(e) => setUploadFileType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white">
                    <option value="application/pdf">PDF</option>
                    <option value="image/jpeg">Image</option>
                    <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel</option>
                    <option value="text/csv">CSV</option>
                    <option value="application/zip">Archive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                  <select value={uploadFileSize} onChange={(e) => setUploadFileSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white">
                    <option value="1.2 MB">1.2 MB</option>
                    <option value="300 KB">300 KB</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowFileUpload(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleUploadFile} disabled={!uploadFileName.trim()} className="text-xs">
                  <Upload size={12} /> Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
