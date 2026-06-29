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
  ChevronRight, Sparkles, Zap, User,
  FileSpreadsheet, FileImage, FileArchive,
  Play, Send, Video, HelpCircle,
  CheckSquare, Square, Upload, DollarSign,
  TrendingUp, ShieldCheck, AlertTriangle,
  Award, Layers, Layers2, Compass,
  Share2, GitBranch, Map as MapIcon,
} from 'lucide-react';
import { useCompanyStore } from '../../store/companyStore';
import LifecycleTab from './components/LifecycleTab';
import HealthTab from './components/HealthTab';
import RiskTab from './components/RiskTab';
import ScoreTab from './components/ScoreTab';
import SegmentsTab from './components/SegmentsTab';
import TagsTab from './components/TagsTab';
import WorkflowsTab from './components/WorkflowsTab';
import RecommendationsTab from './components/RecommendationsTab';
import FollowupsTab from './components/FollowupsTab';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Skeleton } from '../../components/ui/Skeleton';

export const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    currentCompany, fetchCompany, deleteCompany, updateCompany, clearCurrentCompany,
    loading, error, employees, fetchEmployees,
    timeline, activities, notes, files, history,
    hierarchy, branches, departments, contacts, leads, deals, quotes, invoices, payments,
    revenue, revenueSummary, revenueDashboard, businessNetwork, businessNetworkGrouped, journey,
    fetchTimeline, fetchActivities, createActivity, updateActivity, deleteActivity,
    fetchNotes, createNote, updateNote, deleteNote,
    fetchFiles, uploadFile, deleteFile, fetchHistory,
    fetchHierarchy, createHierarchyEntry, deleteHierarchyEntry,
    fetchBranches, createBranch, updateBranch, deleteBranch,
    fetchDepartments, createDepartment, updateDepartment, deleteDepartment,
    fetchContacts, fetchLeads, fetchDeals, fetchQuotes, fetchInvoices, fetchPayments,
    fetchRevenue, fetchRevenueSummary, fetchRevenueDashboard, createRevenueEntry, deleteRevenueEntry,
    fetchBusinessNetwork, fetchBusinessNetworkGrouped, createBusinessNetworkEntry, updateBusinessNetworkEntry, deleteBusinessNetworkEntry,
    fetchJourney, createJourneyEntry, deleteJourneyEntry,
    lifecycle, score, health, risk, segments, tags, companyTags,
    workflows, recommendations, followups,
    fetchLifecycle, fetchScore, fetchHealth, fetchRisk,
    fetchSegments, fetchTags, fetchCompanyTags,
    fetchWorkflows, fetchRecommendations, fetchFollowups,
    fetchInsights, fetchAnalytics,
  } = useCompanyStore();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [overviewSubTab, setOverviewSubTab] = useState('overview');
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

  // Branch state
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchForm, setBranchForm] = useState<any>({ name: '', branchType: 'Branch Office', status: 'Active' });
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  // Department state
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptForm, setDeptForm] = useState<any>({ name: '', type: 'Custom', status: 'Active' });
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  // Revenue state
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [revenueForm, setRevenueForm] = useState<any>({ period: 'Monthly', amount: 0, type: 'Revenue' });

  // Business Network state
  const [showNetworkForm, setShowNetworkForm] = useState(false);
  const [networkForm, setNetworkForm] = useState<any>({ name: '', relationshipType: 'Partner', status: 'Active' });
  const [editingNetworkId, setEditingNetworkId] = useState<string | null>(null);

  // Journey state
  const [showJourneyForm, setShowJourneyForm] = useState(false);
  const [journeyForm, setJourneyForm] = useState<any>({ type: 'Relationship Milestone', title: '' });

  // Search states
  const [branchSearch, setBranchSearch] = useState('');
  const [deptSearch, setDeptSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [journeySearch, setJourneySearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [dealSearch, setDealSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  useEffect(() => {
    if (id) { fetchCompany(id); fetchEmployees(); }
    return () => { clearCurrentCompany(); };
  }, [id]);

  useEffect(() => {
    if (currentCompany) setTargetOwnerId(currentCompany.ownerId || '');
  }, [currentCompany]);

  useEffect(() => {
    if (!id) return;
    switch (selectedTab) {
      case 'timeline': fetchTimeline(id); break;
      case 'activities': fetchActivities(id); break;
      case 'notes': fetchNotes(id); break;
      case 'files': fetchFiles(id); break;
      case 'history': fetchHistory(id); break;
      case 'hierarchy': fetchHierarchy(id); break;
      case 'branches': fetchBranches(id); break;
      case 'departments': fetchDepartments(id); break;
      case 'contacts': fetchContacts(id); break;
      case 'leads': fetchLeads(id); break;
      case 'deals': fetchDeals(id); break;
      case 'quotes': fetchQuotes(id); break;
      case 'invoices': fetchInvoices(id); break;
      case 'payments': fetchPayments(id); break;
      case 'revenue': fetchRevenue(id); fetchRevenueSummary(id); fetchRevenueDashboard(id); break;
      case 'business-network': fetchBusinessNetwork(id); fetchBusinessNetworkGrouped(id); break;
      case 'journey': fetchJourney(id); break;
      case 'lifecycle': fetchLifecycle(id); break;
      case 'score': fetchScore(id); break;
      case 'health': fetchHealth(id); break;
      case 'risk': fetchRisk(id); break;
      case 'segments': fetchSegments(); break;
      case 'tags': fetchTags(); fetchCompanyTags(id); break;
      case 'workflows': fetchWorkflows(); break;
      case 'recommendations': fetchRecommendations(id); break;
      case 'followups': fetchFollowups(id); break;
    }
  }, [id, selectedTab]);

  const handleDelete = async () => {
    if (!currentCompany) return;
    if (confirm(`Delete company "${currentCompany.name}"?`)) {
      try { await deleteCompany(currentCompany.id); toast.success('Company Deleted', `${currentCompany.name} has been deleted.`); navigate('/companies'); }
      catch { toast.error('Delete Failed', 'Failed to delete company.'); }
    }
  };

  const handleArchive = async () => {
    if (!currentCompany) return;
    try { await updateCompany(currentCompany.id, { status: 'Archived' } as any); toast.success('Company Archived', 'Status changed to Archived.'); fetchCompany(currentCompany.id); }
    catch { toast.error('Archive Failed', 'Failed to archive company.'); }
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
        toast.success('Note Updated', 'Note updated successfully.'); setEditingNoteId(null);
      } else {
        await createNote(id, { title: newNoteTitle, content: newNoteContent, isPinned: newNotePinned });
        toast.success('Note Saved', 'New note created.');
      }
      setNewNoteTitle(''); setNewNoteContent(''); setNewNotePinned(false);
    } catch { toast.error('Notes Error', 'Failed to save note.'); }
  };

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id); setNewNoteTitle(note.title || ''); setNewNoteContent(note.content); setNewNotePinned(note.isPinned);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!id || !confirm('Delete this note?')) return;
    try { await deleteNote(id, noteId); toast.success('Note Deleted', 'Note deleted successfully.'); }
    catch { toast.error('Notes Error', 'Failed to delete note.'); }
  };

  const handleTogglePinNote = async (note: any) => {
    if (!id) return;
    try { await updateNote(id, note.id, { isPinned: !note.isPinned }); } catch {}
  };

  // Activity handlers
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim() || !id) return;
    try {
      if (editingActivityId) {
        await updateActivity(id, editingActivityId, { type: newActivityType, title: newActivityTitle, description: newActivityDesc, activityDate: newActivityDate, priority: newActivityPriority });
        toast.success('Activity Updated', 'Activity updated successfully.'); setEditingActivityId(null);
      } else {
        await createActivity(id, { type: newActivityType, title: newActivityTitle, description: newActivityDesc, activityDate: newActivityDate, priority: newActivityPriority, status: 'Open' });
        toast.success('Activity Created', 'New activity logged.');
      }
      setNewActivityType('Call'); setNewActivityTitle(''); setNewActivityDesc(''); setNewActivityDate(new Date().toISOString().split('T')[0]); setNewActivityPriority('Medium');
    } catch { toast.error('Activity Error', 'Failed to save activity.'); }
  };

  const handleEditActivity = (act: any) => {
    setEditingActivityId(act.id); setNewActivityType(act.type); setNewActivityTitle(act.title); setNewActivityDesc(act.description || ''); setNewActivityDate(act.activityDate.split('T')[0]); setNewActivityPriority(act.priority);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!id || !confirm('Delete this activity?')) return;
    try { await deleteActivity(id, activityId); toast.success('Activity Deleted', 'Activity removed.'); }
    catch { toast.error('Activity Error', 'Failed to delete activity.'); }
  };

  // File handlers
  const handleUploadFile = async () => {
    if (!uploadFileName.trim() || !id) return;
    try {
      const sizeBytes = uploadFileSize === '1.2 MB' ? 1258291 : 314572;
      await uploadFile(id, { name: uploadFileName, path: `/uploads/${uploadFileName}`, mimeType: uploadFileType, size: sizeBytes });
      toast.success('File Uploaded', `${uploadFileName} uploaded successfully.`); setShowFileUpload(false); setUploadFileName('');
    } catch { toast.error('Upload Error', 'Failed to upload file.'); }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!id || !confirm(`Delete "${fileName}"?`)) return;
    try { await deleteFile(id, fileId); toast.success('File Deleted', 'File removed.'); }
    catch { toast.error('File Error', 'Failed to delete file.'); }
  };

  // Branch handlers
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !id) return;
    try {
      if (editingBranchId) {
        await updateBranch(id, editingBranchId, branchForm);
        toast.success('Branch Updated', `${branchForm.name} updated.`); setEditingBranchId(null);
      } else {
        await createBranch(id, branchForm);
        toast.success('Branch Created', `${branchForm.name} created.`);
      }
      setShowBranchForm(false); setBranchForm({ name: '', branchType: 'Branch Office', status: 'Active' });
    } catch { toast.error('Error', 'Failed to save branch.'); }
  };

  const handleEditBranch = (b: any) => { setEditingBranchId(b.id); setBranchForm(b); setShowBranchForm(true); };

  const handleDeleteBranch = async (branchId: string, name: string) => {
    if (!id || !confirm(`Delete branch "${name}"?`)) return;
    try { await deleteBranch(id, branchId); toast.success('Branch Deleted', `${name} deleted.`); }
    catch { toast.error('Error', 'Failed to delete branch.'); }
  };

  // Department handlers
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !id) return;
    try {
      if (editingDeptId) {
        await updateDepartment(id, editingDeptId, deptForm);
        toast.success('Department Updated', `${deptForm.name} updated.`); setEditingDeptId(null);
      } else {
        await createDepartment(id, deptForm);
        toast.success('Department Created', `${deptForm.name} created.`);
      }
      setShowDeptForm(false); setDeptForm({ name: '', type: 'Custom', status: 'Active' });
    } catch { toast.error('Error', 'Failed to save department.'); }
  };

  const handleEditDept = (d: any) => { setEditingDeptId(d.id); setDeptForm(d); setShowDeptForm(true); };

  const handleDeleteDept = async (deptId: string, name: string) => {
    if (!id || !confirm(`Delete department "${name}"?`)) return;
    try { await deleteDepartment(id, deptId); toast.success('Department Deleted', `${name} deleted.`); }
    catch { toast.error('Error', 'Failed to delete department.'); }
  };

  // Revenue handlers
  const handleSaveRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createRevenueEntry(id, revenueForm);
      toast.success('Revenue Entry Added', 'Revenue entry recorded.');
      setShowRevenueForm(false); setRevenueForm({ period: 'Monthly', amount: 0, type: 'Revenue' });
    } catch { toast.error('Error', 'Failed to add revenue entry.'); }
  };

  // Network handlers
  const handleSaveNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!networkForm.name || !id) return;
    try {
      if (editingNetworkId) {
        await updateBusinessNetworkEntry(id, editingNetworkId, networkForm);
        toast.success('Network Updated', `${networkForm.name} updated.`); setEditingNetworkId(null);
      } else {
        await createBusinessNetworkEntry(id, networkForm);
        toast.success('Network Entry Created', `${networkForm.name} added.`);
      }
      setShowNetworkForm(false); setNetworkForm({ name: '', relationshipType: 'Partner', status: 'Active' });
    } catch { toast.error('Error', 'Failed to save network entry.'); }
  };

  const handleEditNetwork = (n: any) => { setEditingNetworkId(n.id); setNetworkForm(n); setShowNetworkForm(true); };

  const handleDeleteNetwork = async (entryId: string, name: string) => {
    if (!id || !confirm(`Remove "${name}" from network?`)) return;
    try { await deleteBusinessNetworkEntry(id, entryId); toast.success('Network Entry Removed', `${name} removed.`); }
    catch { toast.error('Error', 'Failed to remove network entry.'); }
  };

  // Journey handlers
  const handleSaveJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journeyForm.title || !id) return;
    try {
      await createJourneyEntry(id, journeyForm);
      toast.success('Journey Milestone Added', `${journeyForm.title} recorded.`);
      setShowJourneyForm(false); setJourneyForm({ type: 'Relationship Milestone', title: '' });
    } catch { toast.error('Error', 'Failed to add journey milestone.'); }
  };

  const handleDeleteJourney = async (entryId: string, title: string) => {
    if (!id || !confirm(`Delete milestone "${title}"?`)) return;
    try { await deleteJourneyEntry(id, entryId); toast.success('Milestone Deleted', `${title} removed.`); }
    catch { toast.error('Error', 'Failed to delete milestone.'); }
  };

  // Computed filtered lists
  const filteredActivities = useMemo(() => activities.filter(a => {
    const matchesSearch = !activitySearch || a.title.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesType = !activityTypeFilter || a.type === activityTypeFilter;
    return matchesSearch && matchesType;
  }), [activities, activitySearch, activityTypeFilter]);

  const filteredNotes = useMemo(() => {
    if (!noteSearch) return notes;
    return notes.filter(n => (n.title && n.title.toLowerCase().includes(noteSearch.toLowerCase())) || n.content.toLowerCase().includes(noteSearch.toLowerCase()));
  }, [notes, noteSearch]);

  const filteredFiles = useMemo(() => {
    if (!fileSearch) return files;
    return files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));
  }, [files, fileSearch]);

  const filteredTimeline = useMemo(() => {
    if (!timelineSearch) return timeline;
    return timeline.filter(t => t.title.toLowerCase().includes(timelineSearch.toLowerCase()) || (t.description && t.description.toLowerCase().includes(timelineSearch.toLowerCase())));
  }, [timeline, timelineSearch]);

  const filteredHistory = useMemo(() => {
    if (!historySearch) return history;
    return history.filter(h => h.action.toLowerCase().includes(historySearch.toLowerCase()) || (h.fieldName && h.fieldName.toLowerCase().includes(historySearch.toLowerCase())));
  }, [history, historySearch]);

  const filteredBranches = useMemo(() => {
    if (!branchSearch) return branches;
    return branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()) || (b.city && b.city.toLowerCase().includes(branchSearch.toLowerCase())));
  }, [branches, branchSearch]);

  const filteredDepts = useMemo(() => {
    if (!deptSearch) return departments;
    return departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase()) || d.type.toLowerCase().includes(deptSearch.toLowerCase()));
  }, [departments, deptSearch]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch) return contacts;
    return contacts.filter((c: any) => c.fullName?.toLowerCase().includes(contactSearch.toLowerCase()) || c.email?.toLowerCase().includes(contactSearch.toLowerCase()));
  }, [contacts, contactSearch]);

  const filteredNetwork = useMemo(() => {
    if (!networkSearch) return businessNetwork;
    return businessNetwork.filter(n => n.name.toLowerCase().includes(networkSearch.toLowerCase()) || n.relationshipType.toLowerCase().includes(networkSearch.toLowerCase()));
  }, [businessNetwork, networkSearch]);

  const filteredJourney = useMemo(() => {
    if (!journeySearch) return journey;
    return journey.filter(j => j.title.toLowerCase().includes(journeySearch.toLowerCase()) || j.type.toLowerCase().includes(journeySearch.toLowerCase()));
  }, [journey, journeySearch]);

  const filteredLeads = useMemo(() => {
    if (!leadSearch) return leads;
    return leads.filter((l: any) => l.fullName?.toLowerCase().includes(leadSearch.toLowerCase()) || l.companyName?.toLowerCase().includes(leadSearch.toLowerCase()));
  }, [leads, leadSearch]);

  const filteredDeals = useMemo(() => {
    if (!dealSearch) return deals;
    return deals.filter((d: any) => d.name?.toLowerCase().includes(dealSearch.toLowerCase()));
  }, [deals, dealSearch]);

  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch) return invoices;
    return invoices.filter((i: any) => i.number?.toLowerCase().includes(invoiceSearch.toLowerCase()));
  }, [invoices, invoiceSearch]);

  const pinnedNotes = filteredNotes.filter((n: any) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n: any) => !n.isPinned);

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'COMPANY_CREATED': return 'bg-emerald-500'; case 'NOTE_ADDED': return 'bg-violet-500';
      case 'ACTIVITY_LOGGED': return 'bg-amber-500'; case 'DOCUMENT_UPLOADED': return 'bg-cyan-500';
      default: return 'bg-blue-500';
    }
  };

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
    { id: 'branches', label: 'Branches' },
    { id: 'departments', label: 'Departments' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'leads', label: 'Leads' },
    { id: 'deals', label: 'Deals' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'payments', label: 'Payments' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'business-network', label: 'Network' },
    { id: 'journey', label: 'Journey' },
    { id: 'hierarchy', label: 'Org Tree' },
    { id: 'history', label: 'History' },
    { id: 'lifecycle', label: 'Lifecycle' },
    { id: 'health', label: 'Health' },
    { id: 'risk', label: 'Risk' },
    { id: 'score', label: 'Score' },
    { id: 'segments', label: 'Segments' },
    { id: 'tags', label: 'Tags' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'recommendations', label: 'Recommend' },
    { id: 'followups', label: 'Follow-ups' },
  ];

  const overviewTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'business', label: 'Business Info' },
    { id: 'contact', label: 'Contact & Tax' },
    { id: 'address', label: 'Address' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/companies" className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ChevronLeft size={18} />
          </Link>
          <div><Breadcrumb items={[{ label: 'Companies', href: '/companies' }, { label: currentCompany.companyNumber }]} /></div>
          <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wide">|</span>
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Sparkles size={12} className="text-brand-500" /> Enterprise Company 360
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/companies/${currentCompany.id}/edit`)} className="text-xs"><Edit2 size={14} /> Edit</Button>
          <Button variant="secondary" size="sm" onClick={handleArchive} className="text-xs"><Archive size={14} /> Archive</Button>
          <Button variant="danger" size="sm" onClick={handleDelete} className="text-xs"><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL */}
        <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-2xl text-brand-650 uppercase shadow-glossy-sm">
                {currentCompany.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight">{currentCompany.displayName || currentCompany.name}</h2>
                {currentCompany.industry && <p className="text-xs text-slate-450 font-bold mt-0.5 flex items-center justify-center gap-1"><Briefcase size={12} /> {currentCompany.industry}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(currentCompany.status)}`}>{currentCompany.status}</span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityColor(currentCompany.priority)}`}>{currentCompany.priority}</span>
              </div>
            </div>
            <div className="border-t border-b border-slate-100 py-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Code</span><span className="font-mono font-bold text-slate-600">{currentCompany.companyNumber}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Owner</span><span className="font-semibold">{currentCompany.owner ? `${currentCompany.owner.firstName} ${currentCompany.owner.lastName}` : 'Unassigned'}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Created</span><span className="font-semibold text-slate-500">{new Date(currentCompany.createdAt).toLocaleDateString()}</span></div>
              {currentCompany.foundedYear && <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Founded</span><span className="font-semibold">{currentCompany.foundedYear}</span></div>}
            </div>
            <div className="grid grid-cols-3 gap-2 select-none">
              <a href={currentCompany.website ? `https://${currentCompany.website}` : '#'} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"><Globe size={14} className="text-slate-650" /><span className="text-[8px] font-bold text-slate-500 uppercase">Website</span></a>
              <a href={currentCompany.primaryEmail ? `mailto:${currentCompany.primaryEmail}` : '#'} className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"><Mail size={14} className="text-slate-650" /><span className="text-[8px] font-bold text-slate-500 uppercase">Email</span></a>
              <a href={currentCompany.primaryPhone ? `tel:${currentCompany.primaryPhone}` : '#'} className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"><Phone size={14} className="text-slate-650" /><span className="text-[8px] font-bold text-slate-500 uppercase">Call</span></a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(true)} className="w-full justify-center text-xs"><UserCheck size={12} /> Assign</Button>
              <Link to={`/companies/${currentCompany.id}/edit`}><Button variant="secondary" size="sm" className="w-full justify-center text-xs"><Edit2 size={12} /> Edit</Button></Link>
            </div>
            {currentCompany.tags && currentCompany.tags.length > 0 && (
              <div className="border-t border-slate-100 pt-3"><div className="flex flex-wrap gap-1.5">{currentCompany.tags.map((tag: string) => (<span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-[10px] font-bold">{tag}</span>))}</div></div>
            )}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar select-none">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-2 text-[11px] font-bold transition-all rounded-xl whitespace-nowrap ${selectedTab === tab.id ? 'bg-slate-800 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg min-h-[450px]">
            {/* OVERVIEW TAB */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-150 rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar select-none">
                  {overviewTabs.map((tab) => (
                    <button key={tab.id} onClick={() => setOverviewSubTab(tab.id)}
                      className={`px-3 py-2 text-[10px] font-bold transition-all rounded-xl whitespace-nowrap ${overviewSubTab === tab.id ? 'bg-slate-800 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}>{tab.label}</button>
                  ))}
                </div>
                {overviewSubTab === 'overview' && (
                  <div className="space-y-6 text-xs text-slate-700 animate-fade-in">
                    <div>
                      <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5"><Building2 size={14} /> Company Summary</h4>
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Company Name</span><p className="font-semibold text-slate-750 mt-0.5">{currentCompany.name}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Type</span><p className="font-semibold mt-0.5">{currentCompany.companyType || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Industry</span><p className="font-semibold mt-0.5">{currentCompany.industry || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Employees</span><p className="font-semibold mt-0.5">{currentCompany.employeeCount?.toLocaleString() || '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Annual Revenue</span><p className="font-semibold mt-0.5">{formatRevenue(currentCompany.annualRevenue)}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Website</span><p className="font-semibold mt-0.5">{currentCompany.website ? <a href={`https://${currentCompany.website}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{currentCompany.website}</a> : '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Rating</span><p className="font-semibold mt-0.5 flex items-center gap-1">{currentCompany.rating ? Array.from({ length: currentCompany.rating }, (_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />) : '-'}</p></div>
                        <div><span className="text-[10px] text-slate-400 font-bold uppercase">Parent Company</span><p className="font-semibold mt-0.5">{currentCompany.parentCompany?.name || '-'}</p></div>
                      </div>
                    </div>
                    {currentCompany.description && (<div className="border-t border-slate-100 pt-4"><h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Description</h4><p className="text-slate-600 leading-relaxed">{currentCompany.description}</p></div>)}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5"><Clock size={14} /> Audit Trail</h4>
                      <div className="space-y-1 text-[10px] text-slate-400 font-semibold font-mono"><div>UUID: {currentCompany.id}</div><div>Version: {currentCompany.version}</div><div>Created By: {currentCompany.createdBy || 'system'}</div><div>Last Updated: {new Date(currentCompany.updatedAt).toLocaleString()}</div></div>
                    </div>
                  </div>
                )}
                {overviewSubTab === 'business' && (
                  <div className="space-y-5 text-xs text-slate-700 animate-fade-in">
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5"><Briefcase size={14} /> Business Information</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                      {[{ label: 'Legal Name', val: currentCompany.legalName }, { label: 'Display Name', val: currentCompany.displayName }, { label: 'Company Type', val: currentCompany.companyType }, { label: 'Sub Industry', val: currentCompany.subIndustry }, { label: 'Business Category', val: currentCompany.businessCategory }, { label: 'Ownership Type', val: currentCompany.ownershipType }, { label: 'Founded Year', val: currentCompany.foundedYear?.toString() }, { label: 'Employee Count', val: currentCompany.employeeCount?.toLocaleString() }, { label: 'Annual Revenue', val: formatRevenue(currentCompany.annualRevenue) }, { label: 'Parent Company', val: currentCompany.parentCompany?.name }].map(({ label, val }) => (
                        <div key={label}><span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span><p className="font-semibold mt-0.5">{val || '-'}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {overviewSubTab === 'contact' && (
                  <div className="space-y-5 text-xs text-slate-700 animate-fade-in">
                    <div><h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5"><Mail size={14} /> Communication Details</h4>
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                        {[{ label: 'Primary Email', val: currentCompany.primaryEmail }, { label: 'Secondary Email', val: currentCompany.secondaryEmail }, { label: 'Primary Phone', val: currentCompany.primaryPhone }, { label: 'Secondary Phone', val: currentCompany.secondaryPhone }, { label: 'WhatsApp', val: currentCompany.whatsApp }, { label: 'Website', val: currentCompany.website }].map(({ label, val }) => (
                          <div key={label}><span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span><p className="font-semibold mt-0.5">{val || '-'}</p></div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4"><h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5"><CreditCard size={14} /> Tax Details</h4>
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                        {[{ label: 'GST Number', val: currentCompany.gstNumber }, { label: 'Tax Number', val: currentCompany.taxNumber }, { label: 'Registration Number', val: currentCompany.registrationNumber }, { label: 'PAN Number', val: currentCompany.panNumber }].map(({ label, val }) => (
                          <div key={label}><span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span><p className="font-semibold mt-0.5">{val || '-'}</p></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {overviewSubTab === 'address' && (
                  <div className="space-y-5 text-xs text-slate-700 animate-fade-in">
                    <div><h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5"><MapPin size={14} /> Registered Address</h4>
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                        {[{ label: 'Country', val: currentCompany.country }, { label: 'State', val: currentCompany.state }, { label: 'City', val: currentCompany.city }, { label: 'Postal Code', val: currentCompany.postalCode }].map(({ label, val }) => (
                          <div key={label}><span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span><p className="font-semibold mt-0.5">{val || '-'}</p></div>
                        ))}
                        <div className="col-span-2"><span className="text-[10px] text-slate-400 font-bold uppercase">Address Line 1</span><p className="font-semibold mt-0.5">{currentCompany.addressLine1 || '-'}</p></div>
                        <div className="col-span-2"><span className="text-[10px] text-slate-400 font-bold uppercase">Address Line 2</span><p className="font-semibold mt-0.5">{currentCompany.addressLine2 || '-'}</p></div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4"><h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5"><FileText size={14} /> Billing & Shipping</h4>
                      <div className="space-y-3"><div><span className="text-[10px] text-slate-400 font-bold uppercase">Billing Address</span><p className="font-semibold mt-0.5 text-slate-600">{currentCompany.billingAddress || '-'}</p></div><div><span className="text-[10px] text-slate-400 font-bold uppercase">Shipping Address</span><p className="font-semibold mt-0.5 text-slate-600">{currentCompany.shippingAddress || '-'}</p></div></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TIMELINE TAB */}
            {selectedTab === 'timeline' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Activity size={14} /> Timeline</h4>
                  <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search timeline..." value={timelineSearch} onChange={(e) => setTimelineSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                </div>
                {filteredTimeline.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><Clock className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No timeline events recorded</p></div>
                ) : (
                  <div className="relative pl-5 border-l-2 border-slate-100 space-y-5">
                    {filteredTimeline.map((event, idx) => (
                      <div key={event.id || idx} className="relative animate-fade-in">
                        <div className={`absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-glossy-sm ${getTimelineColor(event.type)}`} />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2"><span className="text-[11px] font-bold text-slate-800">{event.title}</span><span className="text-[9px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{event.type}</span></div>
                          {event.description && <p className="text-[11px] text-slate-500 leading-relaxed">{event.description}</p>}
                          <span className="text-[9px] text-slate-400 font-semibold block">{new Date(event.eventDate || event.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITIES TAB */}
            {selectedTab === 'activities' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><CalendarDays size={14} /> Activities</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search..." value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-36 bg-slate-50/50" /></div>
                    <select value={activityTypeFilter} onChange={(e) => setActivityTypeFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium bg-slate-50/50"><option value="">All</option><option value="Call">Call</option><option value="Meeting">Meeting</option><option value="Email">Email</option><option value="Visit">Visit</option><option value="Demo">Demo</option><option value="Support">Support</option></select>
                  </div>
                </div>
                <form onSubmit={handleSaveActivity} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <select value={newActivityType} onChange={(e) => setNewActivityType(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white"><option value="Call">Call</option><option value="Meeting">Meeting</option><option value="Email">Email</option><option value="Visit">Visit</option><option value="Demo">Demo</option><option value="Support">Support</option></select>
                    <input type="text" placeholder="Activity title..." value={newActivityTitle} onChange={(e) => setNewActivityTitle(e.target.value)} className="col-span-2 px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" required />
                    <input type="date" value={newActivityDate} onChange={(e) => setNewActivityDate(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="Description (optional)" value={newActivityDesc} onChange={(e) => setNewActivityDesc(e.target.value)} className="col-span-2 px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                    <div className="flex gap-2">
                      <select value={newActivityPriority} onChange={(e) => setNewActivityPriority(e.target.value)} className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select>
                      <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl whitespace-nowrap">{editingActivityId ? 'Update' : 'Add'}</Button>
                      {editingActivityId && <Button type="button" size="sm" variant="secondary" onClick={() => setEditingActivityId(null)} className="text-[10px] rounded-xl">Cancel</Button>}
                    </div>
                  </div>
                </form>
                {filteredActivities.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><CalendarDays className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No activities logged</p></div>
                ) : (
                  <div className="space-y-2">
                    {filteredActivities.map((act) => (
                      <div key={act.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${act.priority === 'High' ? 'bg-rose-50 text-rose-600' : act.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                              {React.createElement(getActivityTypeIcon(act.type), { size: 14 })}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap"><span className="text-[12px] font-bold text-slate-800">{act.title}</span><span className="px-2 py-0.5 bg-slate-50 border border-slate-150 text-[9px] font-bold rounded-lg text-slate-500">{act.type}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getPriorityColor(act.priority)}`}>{act.priority}</span></div>
                              {act.description && <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>}
                              <div className="flex items-center gap-3 mt-1"><span className="text-[9px] text-slate-400 font-semibold">{new Date(act.activityDate).toLocaleDateString()}</span><span className={`text-[9px] font-bold ${act.isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>{act.isCompleted ? 'Completed' : 'Open'}</span></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleEditActivity(act)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteActivity(act.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
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
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><FileText size={14} /> Notes</h4>
                  <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search notes..." value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                </div>
                <form onSubmit={handleSaveNote} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2"><input type="text" placeholder="Note title (optional)" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-slate-500"><input type="checkbox" checked={newNotePinned} onChange={(e) => setNewNotePinned(e.target.checked)} className="rounded border-slate-350 text-brand-550" /> Pin</label>
                  </div>
                  <textarea placeholder="Write note content..." value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] font-medium bg-white min-h-[80px] resize-none" required />
                  <div className="flex gap-2 justify-end">
                    <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-4 rounded-xl">{editingNoteId ? 'Update Note' : 'Add Note'}</Button>
                    {editingNoteId && <Button type="button" size="sm" variant="secondary" onClick={() => setEditingNoteId(null)} className="text-[10px] rounded-xl">Cancel</Button>}
                  </div>
                </form>
                {notes.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><FileText className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No notes recorded</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {[...pinnedNotes, ...unpinnedNotes].map((note: any) => (
                      <div key={note.id} className={`border p-4 rounded-2xl bg-white transition-all ${note.isPinned ? 'border-brand-200 bg-brand-50/20' : 'border-slate-150 hover:shadow-glossy-sm'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">{note.isPinned && <Pin size={11} className="text-brand-600 fill-brand-600" />}{note.title && <span className="text-[12px] font-bold text-slate-800">{note.title}</span>}<span className="text-[9px] text-slate-400 font-semibold">{new Date(note.createdAt).toLocaleString()}</span></div>
                            <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleTogglePinNote(note)} className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors ${note.isPinned ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>{note.isPinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
                            <button onClick={() => handleEditNote(note)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
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
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><FolderOpen size={14} /> Files</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search files..." value={fileSearch} onChange={(e) => setFileSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                    <Button onClick={() => setShowFileUpload(true)} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl"><Upload size={12} /> Upload</Button>
                  </div>
                </div>
                {filteredFiles.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><FolderOpen className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No files uploaded</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredFiles.map((file) => { const Icon = getFileIcon(file.mimeType); return (
                      <div key={file.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0"><div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex-shrink-0"><Icon size={16} /></div>
                            <div className="min-w-0"><p className="text-[12px] font-bold text-slate-800 truncate">{file.name}</p><div className="flex items-center gap-3 mt-0.5"><span className="text-[9px] text-slate-400 font-medium">{formatFileSize(file.size)}</span><span className="text-[9px] text-slate-400 font-medium">{new Date(file.createdAt).toLocaleDateString()}</span></div></div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <a href={file.path} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Download size={12} /></a>
                            <button onClick={() => handleDeleteFile(file.id, file.name)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    );})}
                  </div>
                )}
              </div>
            )}

            {/* BRANCHES TAB */}
            {selectedTab === 'branches' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Building2 size={14} /> Branches</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search branches..." value={branchSearch} onChange={(e) => setBranchSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                    <Button onClick={() => { setShowBranchForm(true); setEditingBranchId(null); setBranchForm({ name: '', branchType: 'Branch Office', status: 'Active' }); }} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl"><Plus size={12} /> Add Branch</Button>
                  </div>
                </div>
                {showBranchForm && (
                  <form onSubmit={handleSaveBranch} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Branch name *" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" required />
                      <select value={branchForm.branchType} onChange={(e) => setBranchForm({ ...branchForm, branchType: e.target.value })} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white"><option value="Head Office">Head Office</option><option value="Regional Office">Regional Office</option><option value="Branch Office">Branch Office</option><option value="Franchise">Franchise</option><option value="Business Unit">Business Unit</option></select>
                      <input type="text" placeholder="Branch code" value={branchForm.branchCode || ''} onChange={(e) => setBranchForm({ ...branchForm, branchCode: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Phone" value={branchForm.phone || ''} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                      <input type="email" placeholder="Email" value={branchForm.email || ''} onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                      <input type="text" placeholder="City" value={branchForm.city || ''} onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-4 rounded-xl">{editingBranchId ? 'Update' : 'Create'} Branch</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => { setShowBranchForm(false); setEditingBranchId(null); }} className="text-[10px] rounded-xl">Cancel</Button>
                    </div>
                  </form>
                )}
                {filteredBranches.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><Building2 className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No branches added yet</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredBranches.map((b) => (
                      <div key={b.id} className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap"><span className="text-[12px] font-bold text-slate-800">{b.name}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(b.status)}`}>{b.status}</span></div>
                            {b.branchType && <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 mt-1 inline-block">{b.branchType}</span>}
                            <div className="mt-2 space-y-1 text-[10px] text-slate-500">
                              {b.city && <p>📍 {b.city}{b.state ? `, ${b.state}` : ''}{b.country ? `, ${b.country}` : ''}</p>}
                              {b.phone && <p>📞 {b.phone}</p>}
                              {b.email && <p>✉️ {b.email}</p>}
                              {b.branchCode && <p className="font-mono text-slate-400">Code: {b.branchCode}</p>}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-slate-400"><span>👥 {b.employeeCount} employees</span><span>💰 {formatRevenue(b.revenue)}</span></div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleEditBranch(b)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteBranch(b.id, b.name)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DEPARTMENTS TAB */}
            {selectedTab === 'departments' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Layers size={14} /> Departments</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search departments..." value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                    <Button onClick={() => { setShowDeptForm(true); setEditingDeptId(null); setDeptForm({ name: '', type: 'Custom', status: 'Active' }); }} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl"><Plus size={12} /> Add Department</Button>
                  </div>
                </div>
                {showDeptForm && (
                  <form onSubmit={handleSaveDepartment} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Department name *" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" required />
                      <select value={deptForm.type} onChange={(e) => setDeptForm({ ...deptForm, type: e.target.value })} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white"><option value="Sales">Sales</option><option value="Marketing">Marketing</option><option value="Finance">Finance</option><option value="HR">HR</option><option value="Support">Support</option><option value="IT">IT</option><option value="Operations">Operations</option><option value="Legal">Legal</option><option value="Custom">Custom</option></select>
                      <select value={deptForm.status} onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-4 rounded-xl">{editingDeptId ? 'Update' : 'Create'} Department</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => { setShowDeptForm(false); setEditingDeptId(null); }} className="text-[10px] rounded-xl">Cancel</Button>
                    </div>
                  </form>
                )}
                {filteredDepts.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><Layers className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No departments configured</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredDepts.map((d) => (
                      <div key={d.id} className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-slate-800">{d.name}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(d.status)}`}>{d.status}</span></div>
                            <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 mt-1 inline-block">{d.type}</span>
                            <div className="mt-2 space-y-1 text-[10px] text-slate-500"><p>👥 {d.employeeCount} employees</p><p>💰 {formatRevenue(d.revenue)}</p></div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleEditDept(d)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteDept(d.id, d.name)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONTACTS TAB */}
            {selectedTab === 'contacts' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Users size={14} /> Contact Directory</h4>
                  <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search contacts..." value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                </div>
                {filteredContacts.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><Users className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No contacts linked to this company</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredContacts.map((c: any) => (
                      <div key={c.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-sm text-brand-650 uppercase flex-shrink-0">{c.firstName?.charAt(0)}{c.lastName?.charAt(0)}</div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap"><span className="text-[12px] font-bold text-slate-800">{c.fullName}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(c.status)}`}>{c.status}</span></div>
                              {c.jobTitle && <p className="text-[10px] text-slate-500 font-medium">{c.jobTitle}{c.department ? ` · ${c.department}` : ''}</p>}
                              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400"><span>{c.email}</span>{c.phone && <span>| {c.phone}</span>}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <a href={`mailto:${c.email}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Mail size={12} /></a>
                            <a href={`tel:${c.phone}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"><Phone size={12} /></a>
                            {c.owner && <span className="text-[9px] text-slate-400 font-medium px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">{c.owner.firstName}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LEADS TAB */}
            {selectedTab === 'leads' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Play size={14} /> Related Leads</h4>
                  <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search leads..." value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                </div>
                {filteredLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><Play className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No leads associated with this company</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredLeads.map((l: any) => (
                      <div key={l.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0"><Play size={14} /></div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap"><span className="text-[12px] font-bold text-slate-800">{l.fullName}</span><span className="text-[10px] text-slate-500">{l.companyName}</span></div>
                              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">{l.email && <span>✉️ {l.email}</span>}{l.phone && <span>📞 {l.phone}</span>}<span>💰 ${l.value?.toLocaleString()}</span></div>
                              {l.assignedTo && <span className="text-[9px] text-slate-400 font-medium">Owner: {l.assignedTo.firstName} {l.assignedTo.lastName}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DEALS TAB */}
            {selectedTab === 'deals' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><DollarSign size={14} /> Related Deals</h4>
                  <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search deals..." value={dealSearch} onChange={(e) => setDealSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                </div>
                {filteredDeals.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><DollarSign className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No deals associated with this company</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredDeals.map((d: any) => (
                      <div key={d.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex-shrink-0"><DollarSign size={14} /></div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap"><span className="text-[12px] font-bold text-slate-800">{d.name}</span><span className="text-[10px] text-slate-500">💰 ${d.value?.toLocaleString()}</span></div>
                              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">{d.stage && <span className="px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">{d.stage.name}</span>}{d.closeDate && <span>Close: {new Date(d.closeDate).toLocaleDateString()}</span>}{d.assignedTo && <span>Owner: {d.assignedTo.firstName}</span>}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QUOTES TAB */}
            {selectedTab === 'quotes' && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><FileText size={14} /> Related Quotes</h4>
                {quotes.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><FileText className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No quotes for this company</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {quotes.map((q: any) => (
                      <div key={q.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-slate-800">{q.number}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(q.status)}`}>{q.status}</span></div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400"><span>💰 ${q.total?.toLocaleString()}</span><span>Valid until: {new Date(q.validUntil).toLocaleDateString()}</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* INVOICES TAB */}
            {selectedTab === 'invoices' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><CreditCard size={14} /> Related Invoices</h4>
                  <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search invoices..." value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                </div>
                {filteredInvoices.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><CreditCard className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No invoices for this company</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredInvoices.map((inv: any) => (
                      <div key={inv.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-slate-800">{inv.number}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : inv.status === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{inv.status}</span></div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400"><span>💰 ${inv.total?.toLocaleString()}</span><span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>{inv.payments?.length > 0 && <span>💳 {inv.payments.length} payment(s)</span>}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {selectedTab === 'payments' && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><DollarSign size={14} /> Payment History</h4>
                {payments.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><DollarSign className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No payment records found</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {payments.map((p: any) => (
                      <div key={p.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-slate-800">${p.amount?.toLocaleString()}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : p.status === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{p.status}</span></div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVENUE TAB */}
            {selectedTab === 'revenue' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><TrendingUp size={14} /> Revenue Dashboard</h4>
                  <Button onClick={() => setShowRevenueForm(true)} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl"><Plus size={12} /> Add Revenue</Button>
                </div>

                {/* Revenue Dashboard Cards */}
                {revenueDashboard && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Total Sales</span><p className="text-lg font-black text-slate-800 mt-1">{formatRevenue(revenueDashboard.totalSales)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Avg Deal Value</span><p className="text-lg font-black text-slate-800 mt-1">{formatRevenue(revenueDashboard.averageDealValue)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Paid Amount</span><p className="text-lg font-black text-emerald-600 mt-1">{formatRevenue(revenueDashboard.paidAmount)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Outstanding</span><p className="text-lg font-black text-rose-600 mt-1">{formatRevenue(revenueDashboard.outstandingAmount)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Pipeline Value</span><p className="text-lg font-black text-slate-800 mt-1">{formatRevenue(revenueDashboard.pipelineValue)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Deal Count</span><p className="text-lg font-black text-slate-800 mt-1">{revenueDashboard.dealCount}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Invoices</span><p className="text-lg font-black text-slate-800 mt-1">{revenueDashboard.invoiceCount}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-white"><span className="text-[10px] text-slate-400 font-bold uppercase">Payments</span><p className="text-lg font-black text-slate-800 mt-1">{revenueDashboard.paymentCount}</p></div>
                  </div>
                )}

                {revenueSummary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border border-slate-150 p-4 rounded-2xl bg-brand-50/30"><span className="text-[10px] text-slate-400 font-bold uppercase">Annual Revenue</span><p className="text-lg font-black text-slate-800 mt-1">{formatRevenue(revenueSummary.annualRevenue)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-brand-50/30"><span className="text-[10px] text-slate-400 font-bold uppercase">Quarterly Revenue</span><p className="text-lg font-black text-slate-800 mt-1">{formatRevenue(revenueSummary.quarterlyRevenue)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-brand-50/30"><span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Revenue</span><p className="text-lg font-black text-slate-800 mt-1">{formatRevenue(revenueSummary.monthlyRevenue)}</p></div>
                    <div className="border border-slate-150 p-4 rounded-2xl bg-brand-50/30"><span className="text-[10px] text-slate-400 font-bold uppercase">Total Revenue</span><p className="text-lg font-black text-slate-800 mt-1">{formatRevenue(revenueSummary.totalRevenue)}</p></div>
                  </div>
                )}

                {!revenueDashboard && !revenueSummary && revenue.length === 0 && (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><TrendingUp className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No revenue data recorded</p></div>
                )}

                {revenue.length > 0 && (
                  <div><h5 className="font-bold text-slate-500 text-[10px] uppercase tracking-wide mb-2">Revenue History</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {revenue.map((r) => (
                        <div key={r.id} className="border border-slate-150 p-3 rounded-2xl bg-white flex items-center justify-between">
                          <div className="flex items-center gap-3"><div className="p-1.5 rounded-lg bg-slate-50 text-slate-500"><TrendingUp size={12} /></div><div><span className="text-[11px] font-bold text-slate-800">{r.type} ({r.period})</span><span className="text-[10px] text-slate-400 ml-2">{r.year}{r.month ? `-${r.month}` : ''}</span></div></div>
                          <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-slate-800">{formatRevenue(r.amount)}</span>
                            <button onClick={() => { if (confirm('Delete revenue entry?')) deleteRevenueEntry(id!, r.id); }} className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={11} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BUSINESS NETWORK TAB */}
            {selectedTab === 'business-network' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><Share2 size={14} /> Business Network</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search network..." value={networkSearch} onChange={(e) => setNetworkSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                    <Button onClick={() => { setShowNetworkForm(true); setEditingNetworkId(null); setNetworkForm({ name: '', relationshipType: 'Partner', status: 'Active' }); }} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl"><Plus size={12} /> Add</Button>
                  </div>
                </div>
                {showNetworkForm && (
                  <form onSubmit={handleSaveNetwork} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Organization name *" value={networkForm.name} onChange={(e) => setNetworkForm({ ...networkForm, name: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" required />
                      <select value={networkForm.relationshipType} onChange={(e) => setNetworkForm({ ...networkForm, relationshipType: e.target.value })} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white"><option value="Partner">Partner</option><option value="Supplier">Supplier</option><option value="Distributor">Distributor</option><option value="Reseller">Reseller</option><option value="Affiliate">Affiliate</option><option value="Strategic Alliance">Strategic Alliance</option><option value="Linked Company">Linked Company</option></select>
                      <input type="text" placeholder="Website" value={networkForm.website || ''} onChange={(e) => setNetworkForm({ ...networkForm, website: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-4 rounded-xl">{editingNetworkId ? 'Update' : 'Add'} Entry</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => { setShowNetworkForm(false); setEditingNetworkId(null); }} className="text-[10px] rounded-xl">Cancel</Button>
                    </div>
                  </form>
                )}
                {Object.keys(businessNetworkGrouped).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {Object.entries(businessNetworkGrouped).map(([type, entries]) => (
                      <div key={type} className="border border-slate-150 p-3 rounded-2xl bg-slate-50/30 text-center">
                        <span className="text-[11px] font-bold text-slate-800">{type}</span>
                        <p className="text-2xl font-black text-brand-600">{(entries as any[]).length}</p>
                      </div>
                    ))}
                  </div>
                )}
                {filteredNetwork.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><Share2 className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No business network entries</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredNetwork.map((n) => (
                      <div key={n.id} className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-slate-800">{n.name}</span><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(n.status)}`}>{n.status}</span></div>
                            <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 mt-1 inline-block">{n.relationshipType}</span>
                            {n.description && <p className="text-[10px] text-slate-500 mt-1">{n.description}</p>}
                            {n.website && <p className="text-[10px] text-brand-600 mt-0.5">{n.website}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditNetwork(n)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteNetwork(n.id, n.name)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMER JOURNEY TAB */}
            {selectedTab === 'journey' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><MapIcon size={14} /> Customer Journey</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search journey..." value={journeySearch} onChange={(e) => setJourneySearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                    <Button onClick={() => setShowJourneyForm(true)} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl"><Plus size={12} /> Add Milestone</Button>
                  </div>
                </div>
                {showJourneyForm && (
                  <form onSubmit={handleSaveJourney} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select value={journeyForm.type} onChange={(e) => setJourneyForm({ ...journeyForm, type: e.target.value })} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white"><option value="Lead Created">Lead Created</option><option value="Company Registered">Company Registered</option><option value="First Contact">First Contact</option><option value="First Meeting">First Meeting</option><option value="First Deal">First Deal</option><option value="Quote Generated">Quote Generated</option><option value="Invoice Generated">Invoice Generated</option><option value="Payment Received">Payment Received</option><option value="Renewal">Renewal</option><option value="Expansion">Expansion</option><option value="Support Case">Support Case</option><option value="Relationship Milestone">Relationship Milestone</option></select>
                      <input type="text" placeholder="Milestone title *" value={journeyForm.title} onChange={(e) => setJourneyForm({ ...journeyForm, title: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-medium bg-white" required />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="submit" size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-4 rounded-xl">Add Milestone</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setShowJourneyForm(false)} className="text-[10px] rounded-xl">Cancel</Button>
                    </div>
                  </form>
                )}
                {filteredJourney.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><MapIcon className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No journey milestones recorded</p></div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-100 space-y-5">
                    {filteredJourney.map((j, idx) => (
                      <div key={j.id || idx} className="relative animate-fade-in">
                        <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-glossy-sm" style={{ backgroundColor: j.color || '#3B82F6' }} />
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2"><span className="text-[11px] font-bold text-slate-800">{j.title}</span><span className="text-[9px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{j.type}</span></div>
                            {j.description && <p className="text-[10px] text-slate-500">{j.description}</p>}
                            <span className="text-[9px] text-slate-400 font-semibold block">{new Date(j.eventDate).toLocaleDateString()}</span>
                          </div>
                          <button onClick={() => handleDeleteJourney(j.id, j.title)} className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 flex-shrink-0"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ORG TREE (HIERARCHY) TAB */}
            {selectedTab === 'hierarchy' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><GitBranch size={14} /> Organization Tree</h4>
                  <Button onClick={() => { const type = prompt('Relationship type (Subsidiary, Branch, Joint Venture, etc.):') || 'Subsidiary'; const desc = prompt('Description (optional):') || ''; if (id) createHierarchyEntry(id, { relationshipType: type, description: desc }); }} size="sm" className="bg-slate-800 text-white font-bold text-[10px] px-3 rounded-xl"><Plus size={12} /> Add Node</Button>
                </div>
                {hierarchy.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><GitBranch className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No hierarchy entries</p></div>
                ) : (
                  <div className="space-y-2">
                    {hierarchy.map((entry, idx) => (
                      <div key={entry.id || idx} className="border border-slate-150 p-4 rounded-2xl bg-white hover:shadow-glossy-sm transition-all" style={{ marginLeft: `${entry.level * 24}px` }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0"><GitBranch size={14} /></div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-slate-800">{currentCompany.name}</span><span className="text-[10px] text-slate-500">→</span><span className="text-[12px] font-bold text-brand-600">{entry.parentCompany?.name || entry.relationshipType}</span></div>
                              <div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{entry.relationshipType}</span><span className="text-[9px] text-slate-400">Level {entry.level}</span></div>
                            </div>
                          </div>
                          <button onClick={() => { if (confirm('Remove hierarchy entry?')) deleteHierarchyEntry(id!, entry.id); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {selectedTab === 'history' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between"><h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm"><History size={14} /> Audit History</h4>
                  <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search history..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-150 rounded-xl text-[11px] font-medium w-48 bg-slate-50/50" /></div>
                </div>
                {filteredHistory.length === 0 ? (
                  <div className="p-12 text-center text-slate-450 border border-dashed border-slate-150 rounded-2xl select-none"><History className="mx-auto opacity-30 mb-2 w-8 h-8 text-slate-400" /><p className="text-xs font-semibold">No history entries recorded</p></div>
                ) : (
                  <div className="space-y-2">
                    {filteredHistory.map((entry) => (
                      <div key={entry.id} className="border border-slate-150 p-3.5 rounded-2xl bg-white hover:shadow-glossy-sm transition-all">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex-shrink-0"><History size={14} /></div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap"><span className="text-[12px] font-bold text-slate-800">{entry.action}</span>{entry.fieldName && <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{entry.fieldName}</span>}</div>
                            {(entry.oldValue || entry.newValue) && (<div className="flex items-center gap-2 mt-1 text-[10px] font-mono">{entry.oldValue && <span className="text-rose-500 line-through">{entry.oldValue}</span>}{entry.oldValue && entry.newValue && <ChevronRight size={10} className="text-slate-300" />}{entry.newValue && <span className="text-emerald-600">{entry.newValue}</span>}</div>)}
                            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">{new Date(entry.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LIFECYCLE TAB */}
            {selectedTab === 'lifecycle' && <LifecycleTab companyId={id!} />}

            {/* HEALTH TAB */}
            {selectedTab === 'health' && <HealthTab companyId={id!} />}

            {/* RISK TAB */}
            {selectedTab === 'risk' && <RiskTab companyId={id!} />}

            {/* SCORE TAB */}
            {selectedTab === 'score' && <ScoreTab companyId={id!} />}

            {/* SEGMENTS TAB */}
            {selectedTab === 'segments' && <SegmentsTab companyId={id!} />}

            {/* TAGS TAB */}
            {selectedTab === 'tags' && <TagsTab companyId={id!} />}

            {/* WORKFLOWS TAB */}
            {selectedTab === 'workflows' && <WorkflowsTab companyId={id!} />}

            {/* RECOMMENDATIONS TAB */}
            {selectedTab === 'recommendations' && <RecommendationsTab companyId={id!} />}

            {/* FOLLOWUPS TAB */}
            {selectedTab === 'followups' && <FollowupsTab companyId={id!} />}
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
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Select Employee</label>
                <select value={targetOwnerId} onChange={(e) => setTargetOwnerId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"><option value="">Select owner...</option>{employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}</select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" onClick={async () => { try { await updateCompany(currentCompany!.id, { ownerId: targetOwnerId } as any); toast.success('Owner Assigned', 'Company owner updated.'); setShowAssignModal(false); fetchCompany(currentCompany!.id); } catch { toast.error('Failed', 'Owner assignment failed.'); }}} disabled={!targetOwnerId} className="text-xs">Assign</Button>
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
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">File Name</label><input type="text" value={uploadFileName} onChange={(e) => setUploadFileName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white" placeholder="e.g., contract.pdf" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Type</label><select value={uploadFileType} onChange={(e) => setUploadFileType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"><option value="application/pdf">PDF</option><option value="image/jpeg">Image</option><option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel</option><option value="text/csv">CSV</option><option value="application/zip">Archive</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Size</label><select value={uploadFileSize} onChange={(e) => setUploadFileSize(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"><option value="1.2 MB">1.2 MB</option><option value="300 KB">300 KB</option></select></div>
              </div>
              <div className="flex gap-2 justify-end mt-4"><Button variant="secondary" size="sm" onClick={() => setShowFileUpload(false)} className="text-xs">Cancel</Button><Button variant="primary" size="sm" onClick={handleUploadFile} disabled={!uploadFileName.trim()} className="text-xs"><Upload size={12} /> Upload</Button></div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Form Modal */}
      {showRevenueForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Add Revenue Entry</h3>
            <form onSubmit={handleSaveRevenue} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Period</label><select value={revenueForm.period} onChange={(e) => setRevenueForm({ ...revenueForm, period: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Annual">Annual</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Type</label><select value={revenueForm.type} onChange={(e) => setRevenueForm({ ...revenueForm, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"><option value="Revenue">Revenue</option><option value="Expense">Expense</option><option value="Profit">Profit</option></select></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Amount ($)</label><input type="number" step="0.01" min="0" value={revenueForm.amount} onChange={(e) => setRevenueForm({ ...revenueForm, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white" /></div>
              <div className="flex gap-2 justify-end mt-4"><Button variant="secondary" size="sm" type="button" onClick={() => setShowRevenueForm(false)} className="text-xs">Cancel</Button><Button variant="primary" size="sm" type="submit" className="text-xs">Add Entry</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
