import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useDealStore
} from '../../store/dealStore';
import {
  ArrowRight,
  User,
  Calendar,
  Activity,
  CheckSquare,
  DollarSign,
  Clock,
  Briefcase,
  Sparkles,
  FileText,
  Paperclip,
  Trash2,
  Edit2,
  Plus,
  Search,
  Filter,
  Users2,
  Link,
  ChevronRight,
  TrendingUp,
  Tag,
  Shield,
  MessageSquare,
  AlertTriangle,
  History,
  Archive,
  Download,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useToast } from '../../components/ui/ToastProvider';

export const DealWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const {
    currentDeal,
    fetchDeal,
    updateStage,
    deleteDeal,
    dealNotes,
    dealActivities,
    dealFiles,
    dealTimeline,
    dealHistory,
    dealProducts,
    dealQuotes,
    dealCompetitors,
    dealComments,
    dealChecklist,
    dealNegotiations,
    dealTeamMembers,
    fetchNotes,
    createNote,
    deleteNote,
    fetchActivities,
    createActivity,
    deleteActivity,
    fetchFiles,
    uploadFile,
    deleteFile,
    fetchTimeline,
    fetchHistory,
    fetchDealProducts,
    addDealProduct,
    updateDealProductLine,
    deleteDealProductLine,
    fetchDealQuotes,
    createDealQuote,
    updateDealQuote,
    approveDealQuote,
    rejectDealQuote,
    fetchDealCompetitors,
    createDealCompetitor,
    fetchCollaboration,
    createDealComment,
    fetchDealChecklist,
    updateDealChecklistItem,
    fetchDealNegotiations,
    createDealNegotiation,
    loading,
    error,
    employees
  } = useDealStore();

  const [activeTab, setActiveTab] = useState('overview');
  
  // Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  // Activity Form State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState('Call');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().substring(0, 16));
  const [activityPriority, setActivityPriority] = useState('Medium');
  const [activityStatus, setActivityStatus] = useState('Planned');
  const [activityAssigned, setActivityAssigned] = useState('');

  // File Upload State
  const [fileName, setFileName] = useState('');
  const [fileMime, setFileMime] = useState('application/pdf');
  const [fileSize, setFileSize] = useState(150000);

  // Search/Filters State
  const [tabSearch, setTabSearch] = useState('');
  const [activityFilterType, setActivityFilterType] = useState('All');

  // Commercial state hooks
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [newProdName, setNewProdName] = useState('Enterprise Support Package');
  const [newProdSku, setNewProdSku] = useState('SUPPORT-ENT-99');
  const [newProdPrice, setNewProdPrice] = useState(250);
  const [newProdQty, setNewProdQty] = useState(1);
  const [newProdDisc, setNewProdDisc] = useState(0);
  const [newProdTax, setNewProdTax] = useState(25);

  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState('');
  const [editProdQty, setEditProdQty] = useState(1);
  const [editProdDisc, setEditProdDisc] = useState(0);
  const [editProdTax, setEditProdTax] = useState(25);

  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [newQuoteNum, setNewQuoteNum] = useState('');
  const [newQuoteVer, setNewQuoteVer] = useState('1.0');
  const [newQuoteAmt, setNewQuoteAmt] = useState(0);
  const [newQuoteExpiry, setNewQuoteExpiry] = useState('');

  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompProd, setNewCompProd] = useState('');
  const [newCompPrice, setNewCompPrice] = useState('');
  const [newCompStrengths, setNewCompStrengths] = useState('');
  const [newCompWeaknesses, setNewCompWeaknesses] = useState('');

  const [showAddNegModal, setShowAddNegModal] = useState(false);
  const [newOfferAmt, setNewOfferAmt] = useState(0);
  const [newCounterAmt, setNewCounterAmt] = useState(0);
  const [newDiscountPct, setNewDiscountPct] = useState(0);
  const [newNegChanges, setNewNegChanges] = useState('');
  const [newNegNotes, setNewNegNotes] = useState('');

  const [newCommentText, setNewCommentText] = useState('');

  // Load Workspace Data
  useEffect(() => {
    if (id) {
      fetchDeal(id);
      fetchNotes(id);
      fetchActivities(id);
      fetchFiles(id);
      fetchTimeline(id);
      fetchHistory(id);
      fetchDealProducts(id);
      fetchDealQuotes(id);
      fetchDealCompetitors(id);
      fetchCollaboration(id);
      fetchDealChecklist(id);
      fetchDealNegotiations(id);
    }
  }, [id]);

  if (loading && !currentDeal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-550 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading Enterprise 360 Workspace...</p>
      </div>
    );
  }

  if (error || !currentDeal) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <AlertCircle size={48} className="text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Workspace Unavailable</h2>
        <p className="text-sm text-slate-600">{error || 'Deal details could not be found.'}</p>
        <Button onClick={() => navigate('/deals')} variant="outline" size="sm">
          Return to Pipeline
        </Button>
      </div>
    );
  }

  // Next stage calculation
  const advanceStage = async () => {
    try {
      // Standard pipeline progression demo logic
      if (currentDeal.pipeline?.stages) {
        const stages = currentDeal.pipeline.stages;
        const currentIdx = stages.findIndex((s: any) => s.id === currentDeal.stageId);
        if (currentIdx !== -1 && currentIdx < stages.length - 1) {
          const nextStage = stages[currentIdx + 1];
          await updateStage(currentDeal.id, nextStage.id);
          toast.success('Stage Progressed', `Opportunity advanced to "${nextStage.name}"`);
          fetchDeal(currentDeal.id);
          fetchTimeline(currentDeal.id);
        } else {
          toast.info('Maximum Stage reached', 'Deal is already in the final pipeline stage.');
        }
      }
    } catch {
      toast.error('Progression failed', 'Failed to advance opportunity stage.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await createNote(currentDeal.id, noteContent, noteTitle || 'Untitled Note');
      setNoteTitle('');
      setNoteContent('');
      toast.success('Note Logged', 'Workspace note compiled successfully.');
    } catch {
      toast.error('Error logging note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(currentDeal.id, noteId);
      toast.success('Note Removed', 'Comment has been removed from deal history.');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;
    try {
      await createActivity(currentDeal.id, {
        type: activityType,
        title: activityTitle,
        description: activityDesc,
        activityDate: new Date(activityDate).toISOString(),
        priority: activityPriority,
        status: activityStatus,
        assignedToId: activityAssigned || null
      });
      setShowActivityModal(false);
      setActivityTitle('');
      setActivityDesc('');
      toast.success('Activity Logged', 'Sales task or meeting logged successfully.');
    } catch {
      toast.error('Error logging activity');
    }
  };

  const handleDeleteActivity = async (actId: string) => {
    try {
      await deleteActivity(currentDeal.id, actId);
      toast.success('Activity Removed', 'Sales task activity record deleted.');
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  const handleUploadFileMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    try {
      await uploadFile(currentDeal.id, {
        name: fileName,
        path: `/attachments/${fileName.toLowerCase().replace(/\s+/g, '-')}`,
        mimeType: fileMime,
        size: fileSize
      });
      setFileName('');
      toast.success('Document Uploaded', 'Sales file added directly to local directory storage.');
    } catch {
      toast.error('Error adding document');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(currentDeal.id, fileId);
      toast.success('Document Removed', 'Attachment removed successfully.');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'timeline', label: 'Timeline', icon: TrendingUp },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Documents', icon: Paperclip },
    { id: 'products', label: 'Products', icon: Sparkles },
    { id: 'quotes', label: 'Quotes Hub', icon: DollarSign },
    { id: 'competitors', label: 'Competitors', icon: Shield },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'negotiations', label: 'Negotiation', icon: Clock },
    { id: 'communications', label: 'Unified Comm', icon: MessageSquare },
    { id: 'history', label: 'Audit History', icon: History }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Breadcrumb items={[{ label: 'Deals', link: '/deals' }, { label: currentDeal.name }]} />
        <div className="flex gap-2">
          <Button onClick={advanceStage} variant="primary" size="sm">
            <ArrowRight size={14} className="mr-1.5" /> Advance Stage
          </Button>
          <Button onClick={() => navigate('/deals')} variant="outline" size="sm">
            Back to Deals
          </Button>
        </div>
      </div>

      {/* Main 3-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Deal Profile Summary Card (30% / 3-span equivalent or 3.6 width) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <Card className="p-5 border-slate-100 bg-white/80 shadow-glossy-sm space-y-5">
            <div className="border-b border-slate-100/80 pb-4 text-left">
              <span className="px-2 py-0.5 text-[9px] font-black tracking-widest bg-brand-50 text-brand-600 rounded-md uppercase">
                {currentDeal.dealNumber}
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-2 line-clamp-1">{currentDeal.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{currentDeal.opportunityName || 'Sales Opportunity'}</p>
            </div>

            <div className="space-y-3.5 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Pipeline:</span>
                <span className="font-semibold text-slate-700">{currentDeal.pipeline?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Stage:</span>
                <span className="font-bold text-brand-600">{currentDeal.stage?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Status:</span>
                <span className="font-semibold text-slate-700">{currentDeal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Probability:</span>
                <span className="font-semibold text-slate-700">{currentDeal.probability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Value:</span>
                <span className="font-bold text-emerald-600">${currentDeal.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Expected Revenue:</span>
                <span className="font-bold text-slate-700">${currentDeal.expectedRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Owner:</span>
                <span className="font-semibold text-slate-700">
                  {currentDeal.assignedTo ? `${currentDeal.assignedTo.firstName} ${currentDeal.assignedTo.lastName}` : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Contact:</span>
                <span className="font-semibold text-brand-650">
                  {currentDeal.primaryContact ? `${currentDeal.primaryContact.firstName} ${currentDeal.primaryContact.lastName}` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100/80 pt-4 space-y-2">
              <Button onClick={() => setShowActivityModal(true)} variant="outline" size="sm" className="w-full justify-start">
                <Plus size={13} className="mr-2" /> Log Activity
              </Button>
              <Button onClick={() => setActiveTab('notes')} variant="outline" size="sm" className="w-full justify-start">
                <FileText size={13} className="mr-2" /> Compile Note
              </Button>
              <Button onClick={() => setActiveTab('files')} variant="outline" size="sm" className="w-full justify-start">
                <Paperclip size={13} className="mr-2" /> Attach Document
              </Button>
            </div>
          </Card>
        </div>

        {/* CENTER COLUMN: Tabs Navigation and Independent Panel View (45% / 5-span equivalent or 5.4 width) */}
        <div className="lg:col-span-5 xl:col-span-6 space-y-6">
          {/* Horizontally scrollable Tab Bar */}
          <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTabSearch('');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-550 text-white shadow-glossy-sm'
                      : 'text-slate-400 hover:text-slate-700 bg-transparent'
                  }`}
                >
                  <TabIcon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-[450px]">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Briefcase size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Opportunity Profile Overview</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="text-slate-400 font-semibold mb-1">Description</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      {currentDeal.description || 'No descriptive context compiled yet for this sales opportunity.'}
                    </p>
                  </div>
                  <div className="space-y-3 bg-brand-50/30 p-3 rounded-xl border border-brand-100/20">
                    <h4 className="text-brand-800 font-black text-[9px] uppercase tracking-wider mb-2">Deal Health Parameters</h4>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pipeline Velocity</span>
                      <span className="font-semibold text-slate-700">Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Currency Code</span>
                      <span className="font-bold text-slate-700">{currentDeal.currency || 'USD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lead Source</span>
                      <span className="font-semibold text-slate-700">{currentDeal.source || 'Direct Enquiry'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Premium Opportunity Timeline</h3>
                  </div>
                  <input
                    type="text"
                    placeholder="Search event logs..."
                    value={tabSearch}
                    onChange={(e) => setTabSearch(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500/50 bg-white w-40"
                  />
                </div>

                <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-6">
                  {dealTimeline
                    .filter((e: any) =>
                      tabSearch ? e.title?.toLowerCase().includes(tabSearch.toLowerCase()) || e.description?.toLowerCase().includes(tabSearch.toLowerCase()) : true
                    )
                    .map((evt: any) => (
                      <div key={evt.id} className="relative">
                        <div className="absolute -left-[25px] top-0.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-white"></div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">{evt.title}</p>
                          <p className="text-[11px] text-slate-500">{evt.description}</p>
                          <p className="text-[9px] text-slate-400 font-mono">
                            {new Date(evt.eventDate).toLocaleString()} &bull; {evt.createdBy || 'System'}
                          </p>
                        </div>
                      </div>
                    ))}
                  {dealTimeline.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No timeline event logs verified yet.</p>
                  )}
                </div>
              </Card>
            )}

            {/* ACTIVITIES TAB */}
            {activeTab === 'activities' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Enterprise Activity Management</h3>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={activityFilterType}
                      onChange={(e) => setActivityFilterType(e.target.value)}
                      className="px-2.5 py-1 text-[10px] border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="All">All Types</option>
                      <option value="Call">Calls</option>
                      <option value="Meeting">Meetings</option>
                      <option value="Email">Emails</option>
                      <option value="Demo">Demos</option>
                    </select>
                    <Button onClick={() => setShowActivityModal(true)} variant="primary" size="xs">
                      <Plus size={11} className="mr-1" /> Log Activity
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {dealActivities
                    .filter((act: any) => (activityFilterType === 'All' ? true : act.type === activityFilterType))
                    .map((act: any) => (
                      <div key={act.id} className="p-3.5 border border-slate-100 rounded-xl bg-white hover:shadow-glossy-sm transition-all flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-md uppercase tracking-wider ${
                            act.type === 'Call' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'
                          }`}>
                            {act.type}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 mt-1">{act.title}</h4>
                          {act.description && <p className="text-[11px] text-slate-500">{act.description}</p>}
                          <p className="text-[9px] text-slate-400">
                            Scheduled: {new Date(act.activityDate).toLocaleString()} &bull; Assigned: {act.assignedTo ? `${act.assignedTo.firstName} ${act.assignedTo.lastName}` : 'N/A'}
                          </p>
                        </div>
                        <Button onClick={() => handleDeleteActivity(act.id)} variant="ghost" size="xs">
                          <Trash2 size={13} className="text-rose-400 hover:text-rose-600" />
                        </Button>
                      </div>
                    ))}
                  {dealActivities.length === 0 && (
                    <div className="py-12 text-center text-slate-400 italic text-xs">
                      No matching activities logged for this workspace.
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FileText size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Opportunity Notes & Comments</h3>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Note subject..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white/60 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <textarea
                    placeholder="Write note content here (auto-save draft enabled)..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white/60 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  ></textarea>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="xs">
                      Add Note
                    </Button>
                  </div>
                </form>

                <div className="space-y-3 pt-3 border-t border-slate-100/80">
                  {dealNotes.map((note: any) => (
                    <div key={note.id} className="p-3 border border-slate-155 rounded-xl bg-white space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-slate-850">{note.title}</span>
                        <Button onClick={() => handleDeleteNote(note.id)} variant="ghost" size="xs">
                          <Trash2 size={13} className="text-rose-400 hover:text-rose-600" />
                        </Button>
                      </div>
                      <p className="text-slate-620 text-[11px] leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        Logged on: {new Date(note.createdAt).toLocaleString()} &bull; Author: {note.createdBy || 'User'}
                      </p>
                    </div>
                  ))}
                  {dealNotes.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No workspace notes recorded yet.</p>
                  )}
                </div>
              </Card>
            )}

            {/* FILES TAB */}
            {activeTab === 'files' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Paperclip size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Document Management</h3>
                </div>

                <form onSubmit={handleUploadFileMock} className="p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">File Name</label>
                      <input
                        type="text"
                        placeholder="Proposal-v2.pdf"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">File Format</label>
                      <select
                        value={fileMime}
                        onChange={(e) => setFileMime(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        <option value="application/pdf">PDF Document</option>
                        <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX Proposal</option>
                        <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX Pricing</option>
                        <option value="image/png">PNG Image</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="xs">
                      Attach Document
                    </Button>
                  </div>
                </form>

                <div className="space-y-2">
                  {dealFiles.map((f: any) => (
                    <div key={f.id} className="p-3 border border-slate-100 rounded-xl bg-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                          <Paperclip size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{f.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {f.mimeType} &bull; {Math.round(f.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Download trigger', 'Local attachment download complete.'); }} className="p-1.5 text-slate-400 hover:text-slate-600">
                          <Download size={14} />
                        </a>
                        <Button onClick={() => handleDeleteFile(f.id)} variant="ghost" size="xs">
                          <Trash2 size={13} className="text-rose-400 hover:text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {dealFiles.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No attached files mapped to this opportunity.</p>
                  )}
                </div>
              </Card>
            )}

            {/* MEETINGS TAB */}
            {activeTab === 'meetings' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Meeting Schedule</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-2xl flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">Contract Negotiation Briefing</h4>
                      <p className="text-[11px] text-slate-650">Agenda: Align subscription tier counts and data governance terms.</p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        Date: {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()} at 10:00 AM &bull; Duration: 45 min
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-indigo-50 text-indigo-700 rounded-md">Upcoming</span>
                  </div>
                  <div className="p-4 border border-slate-100 bg-slate-50/30 rounded-2xl flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-700">Initial Demo Presentation</h4>
                      <p className="text-[11px] text-slate-500">Agenda: Platform overview showcasing smart integrations.</p>
                      <p className="text-[9px] text-slate-400 font-mono">Date: 3 days ago &bull; Duration: 30 min</p>
                    </div>
                    <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-slate-100 text-slate-600 rounded-md">Completed</span>
                  </div>
                </div>
              </Card>
            )}

            {/* TASKS TAB */}
            {activeTab === 'tasks' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Sales Checklist</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                    <input type="checkbox" defaultChecked className="rounded text-brand-550" />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-700 line-through">Verify contact email domains</p>
                      <p className="text-[9px] text-slate-400">Completed yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                    <input type="checkbox" className="rounded text-brand-550" />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-850">Draft commercial terms quotation v1</p>
                      <p className="text-[9px] text-rose-500 font-semibold">Due in 2 days</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Associated Products & Services</h3>
                  </div>
                  <Button
                    onClick={() => {
                      setNewProdName('Enterprise Support Package');
                      setNewProdSku('SUPPORT-ENT-99');
                      setNewProdPrice(250);
                      setNewProdQty(1);
                      setNewProdDisc(0);
                      setNewProdTax(25);
                      setShowAddProdModal(true);
                    }}
                    variant="primary"
                    size="xs"
                  >
                    <Plus size={12} className="mr-1" /> Add Item
                  </Button>
                </div>

                {/* Product Summary KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Items Count</p>
                    <h4 className="text-sm font-black text-slate-800 mt-0.5">{dealProducts.length}</h4>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total Quantity</p>
                    <h4 className="text-sm font-black text-slate-800 mt-0.5">
                      {dealProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)}
                    </h4>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total Discounts</p>
                    <h4 className="text-sm font-black text-slate-800 mt-0.5">
                      ${dealProducts.reduce((sum, p) => sum + (p.discount || 0), 0).toLocaleString()}
                    </h4>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Deal Grand Total</p>
                    <h4 className="text-sm font-black text-brand-600 mt-0.5">
                      ${dealProducts.reduce((sum, p) => sum + (p.total || 0), 0).toLocaleString()}
                    </h4>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                        <th className="pb-2">Product Details</th>
                        <th className="pb-2 text-right">Qty</th>
                        <th className="pb-2 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Discount</th>
                        <th className="pb-2 text-right">Tax</th>
                        <th className="pb-2 text-right">Total</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                      {dealProducts.map((prod: any) => (
                        <tr key={prod.id} className="hover:bg-slate-25/30">
                          <td className="py-2.5">
                            <p className="font-bold text-slate-850">{prod.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">{prod.sku}</p>
                          </td>
                          <td className="py-2.5 text-right">{prod.quantity}</td>
                          <td className="py-2.5 text-right">${(prod.unitPrice || 0).toFixed(2)}</td>
                          <td className="py-2.5 text-right text-rose-500">${(prod.discount || 0).toFixed(2)}</td>
                          <td className="py-2.5 text-right text-slate-400">${(prod.tax || 0).toFixed(2)}</td>
                          <td className="py-2.5 text-right font-black text-slate-850">
                            ${(prod.total || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingProductId(prod.id);
                                setEditProdQty(prod.quantity);
                                setEditProdDisc(prod.discount);
                                setEditProdTax(prod.tax);
                                setShowEditProdModal(true);
                              }}
                              className="text-slate-400 hover:text-brand-550 transition-colors"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Remove this product line item?')) {
                                  await deleteDealProductLine(currentDeal.id, prod.id);
                                  toast.success('Product Line Removed', 'Product mapping updated.');
                                }
                              }}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dealProducts.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-8">No products mapped. Click Add Item to begin.</p>
                  )}
                </div>
              </Card>
            )}

            {/* QUOTES HUB TAB */}
            {activeTab === 'quotes' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Quotes Hub & Approval Workflows</h3>
                  </div>
                  <Button
                    onClick={() => {
                      const rand = Math.floor(1000 + Math.random() * 9000);
                      setNewQuoteNum(`QT-DEAL-${currentDeal.dealNumber}-${rand}`);
                      setNewQuoteVer('1.0');
                      setNewQuoteAmt(dealProducts.reduce((sum, p) => sum + p.total, 0));
                      setNewQuoteExpiry(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));
                      setShowAddQuoteModal(true);
                    }}
                    variant="primary"
                    size="xs"
                  >
                    <Plus size={12} className="mr-1" /> New Version
                  </Button>
                </div>

                <div className="space-y-4">
                  {dealQuotes.map((q: any) => (
                    <div
                      key={q.id}
                      className="p-5 border border-slate-150 bg-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-glossy-sm transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 text-[9px] font-black bg-brand-50 text-brand-700 rounded-md uppercase tracking-wider">
                            {q.quoteNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Version: {q.version}</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-850">${q.amount.toLocaleString()}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Expires: {q.expiryDate ? new Date(q.expiryDate).toLocaleDateString() : '-'}
                        </p>

                        {/* Approval Status Badge */}
                        <div className="pt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                              q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                              q.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-250' :
                              q.status === 'draft' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                              'bg-amber-50 text-amber-700 border-amber-250'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {q.status}
                          </span>
                        </div>
                      </div>

                      {/* Approval Controls */}
                      <div className="flex flex-wrap items-center gap-2">
                        {q.status !== 'Approved' && q.status !== 'Rejected' && (
                          <>
                            <Button
                              onClick={async () => {
                                await approveDealQuote(currentDeal.id, q.id);
                                toast.success('Quote Approved', 'Approval status finalized');
                              }}
                              variant="primary"
                              size="xs"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={async () => {
                                await rejectDealQuote(currentDeal.id, q.id);
                                toast.success('Quote Rejected', 'Rejection logged');
                              }}
                              variant="outline"
                              size="xs"
                              className="text-red-500 hover:bg-red-50 border-red-200"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => {
                            toast.info('Downloading PDF Quote', 'Generating PDF output formatting template...');
                          }}
                          variant="outline"
                          size="xs"
                          className="border-slate-200 text-slate-500"
                        >
                          <Download size={11} className="mr-1" /> PDF
                        </Button>
                      </div>
                    </div>
                  ))}

                  {dealQuotes.length === 0 && (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <DollarSign size={32} className="mx-auto text-slate-350" />
                      <p className="text-xs font-bold text-slate-700">No Quotes Generated</p>
                      <p className="text-[10px] max-w-xs mx-auto">Create quotation drafts and request manager/finance approvals in one place.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* COMPETITORS TAB */}
            {activeTab === 'competitors' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Competitor Intelligence Tracking</h3>
                  </div>
                  <Button
                    onClick={() => {
                      setNewCompName('');
                      setNewCompProd('');
                      setNewCompPrice('');
                      setNewCompStrengths('');
                      setNewCompWeaknesses('');
                      setShowAddCompModal(true);
                    }}
                    variant="primary"
                    size="xs"
                  >
                    <Plus size={12} className="mr-1" /> Log Competitor
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dealCompetitors.map((comp: any) => (
                    <div key={comp.id} className="p-5 border border-slate-150 bg-white rounded-2xl space-y-3 shadow-glossy-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{comp.name}</h4>
                          <p className="text-[10px] text-slate-450 font-semibold">{comp.product || 'Generic Product'}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-750 border border-blue-200 uppercase">{comp.status}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-slate-50 pt-2 font-bold text-slate-500">
                        <div>
                          <span className="text-[8px] font-black uppercase text-slate-400 block">Pricing:</span>
                          <span className="text-slate-700">${(comp.pricing || 0).toLocaleString()}/yr</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-slate-400 block">Position:</span>
                          <span className="text-slate-700">{comp.marketPosition || 'Challenger'}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[10px] font-semibold text-slate-600">
                        <p><strong className="text-slate-800">Strengths:</strong> {comp.strengths || '-'}</p>
                        <p><strong className="text-slate-850">Weaknesses:</strong> {comp.weaknesses || '-'}</p>
                        {comp.website && (
                          <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-brand-550 block font-bold hover:underline pt-1 text-[9px]">
                            Visit Website &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  {dealCompetitors.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-450 space-y-1.5">
                      <Shield size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">No Competitors Logged</p>
                      <p className="text-[10px] max-w-xs mx-auto">Track competitor pricing structure, feature capabilities, and win/loss records.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* CHECKLIST TAB */}
            {activeTab === 'checklist' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Commercial Closing Checklist</h3>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Progress: {Math.round((dealChecklist.filter(c => c.isCompleted).length / (dealChecklist.length || 1)) * 100)}%
                  </div>
                </div>

                <div className="space-y-2.5">
                  {dealChecklist.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 bg-white border border-slate-150 rounded-xl hover:border-brand-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={(e) => updateDealChecklistItem(currentDeal.id, item.id, e.target.checked)}
                          className="w-4 h-4 rounded text-brand-550 border-slate-350 focus:ring-brand-200 focus:ring-4"
                        />
                        <span className={`text-xs font-semibold ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.completedAt && (
                        <span className="text-[9px] font-semibold text-slate-400">
                          Checked by {item.completedBy || 'system'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* NEGOTIATIONS TAB */}
            {activeTab === 'negotiations' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-brand-550" />
                    <h3 className="text-sm font-bold text-slate-800">Commercial Negotiation Log</h3>
                  </div>
                  <Button
                    onClick={() => {
                      setNewOfferAmt(dealProducts.reduce((sum, p) => sum + p.total, 0));
                      setNewCounterAmt(0);
                      setNewDiscountPct(0);
                      setNewNegChanges('');
                      setNewNegNotes('');
                      setShowAddNegModal(true);
                    }}
                    variant="primary"
                    size="xs"
                  >
                    <Plus size={12} className="mr-1" /> Log Round
                  </Button>
                </div>

                <div className="space-y-4">
                  {dealNegotiations.map((neg: any) => (
                    <div key={neg.id} className="p-5 border border-slate-150 bg-white rounded-2xl space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="px-2 py-0.5 text-[9px] font-black bg-blue-50 text-blue-700 rounded-md">
                          Round {neg.round}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Status: {neg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-[10px] font-bold text-slate-500">
                        <div>
                          <span className="text-[8px] uppercase tracking-wide text-slate-400 block">Our Offer:</span>
                          <span className="text-slate-800">${neg.currentOffer.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wide text-slate-400 block">Counter Offer:</span>
                          <span className="text-slate-800">${neg.counterOffer ? neg.counterOffer.toLocaleString() : '-'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wide text-slate-400 block">Discount:</span>
                          <span className="text-brand-650">{neg.discountPercent}%</span>
                        </div>
                      </div>

                      {neg.requestedChanges && (
                        <div className="text-[10px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <strong className="text-slate-700 block text-[9px] uppercase tracking-wider mb-0.5">Requested Changes:</strong>
                          <span className="text-slate-600 font-semibold">{neg.requestedChanges}</span>
                        </div>
                      )}
                      {neg.notes && (
                        <p className="text-[10px] font-semibold text-slate-500">
                          <strong className="text-slate-700">Notes:</strong> {neg.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* UNIFIED COMMUNICATIONS COLLABORATION TAB */}
            {activeTab === 'communications' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <MessageSquare size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Deal Collaboration & Comments</h3>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                  {dealComments.map((comment: any) => {
                    const sender = comment.employee ? `${comment.employee.firstName} ${comment.employee.lastName}` : comment.createdBy || 'user';
                    return (
                      <div key={comment.id} className="p-4 border border-slate-150 bg-white rounded-2xl space-y-2 shadow-glossy-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-black">
                              {sender[0]}
                            </div>
                            <span className="text-xs font-bold text-slate-800">{sender}</span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-650 pl-8">{comment.comment}</p>
                      </div>
                    );
                  })}
                  {dealComments.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No workspace comments posted yet.</p>
                  )}
                </div>

                {/* Comment Input */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newCommentText.trim()) return;
                    try {
                      await createDealComment(currentDeal.id, { comment: newCommentText });
                      setNewCommentText('');
                      toast.success('Comment Posted', 'Internal collaboration update synced.');
                    } catch {
                      toast.error('Error posting comment');
                    }
                  }}
                  className="flex gap-2.5"
                >
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Type collaboration note or reply..."
                    className="flex-grow px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/50"
                  />
                  <Button type="submit" variant="primary" size="sm">Post</Button>
                </form>
              </Card>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <History size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Opportunity Audit History</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="pb-2 font-black uppercase text-[9px]">Action</th>
                        <th className="pb-2 font-black uppercase text-[9px]">Field</th>
                        <th className="pb-2 font-black uppercase text-[9px]">Old Value</th>
                        <th className="pb-2 font-black uppercase text-[9px]">New Value</th>
                        <th className="pb-2 font-black uppercase text-[9px]">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dealHistory.map((h: any) => (
                        <tr key={h.id}>
                          <td className="py-2 font-semibold text-slate-805">{h.action}</td>
                          <td className="py-2 text-slate-600">{h.fieldName || 'N/A'}</td>
                          <td className="py-2 text-slate-400 truncate max-w-28">{h.oldValue || '-'}</td>
                          <td className="py-2 text-slate-700 font-semibold truncate max-w-28">{h.newValue || '-'}</td>
                          <td className="py-2 text-[10px] text-slate-400">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dealHistory.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No modification records tracked.</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Smart Summary Widgets (25% / 3-span equivalent or 3.0 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Win Probability Placeholder Gauge */}
          <Card className="p-5 border-slate-100 bg-white/80 shadow-glossy-sm text-left">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
              Opportunity Win Index
            </h3>
            <div className="relative pt-1 flex flex-col items-center">
              <div className="text-3xl font-black text-brand-600 mb-1">{currentDeal.probability}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                <div
                  className="bg-brand-550 h-1.5 rounded-full transition-all"
                  style={{ width: `${currentDeal.probability}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Confidence Interval Parameter</span>
            </div>
          </Card>

          {/* Revenue Analytics Widget */}
          <Card className="p-5 border-slate-100 bg-white/80 shadow-glossy-sm text-left">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
              Revenue Value Summary
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Pipeline Quote Value</span>
                <p className="text-base font-bold text-slate-800">${currentDeal.value.toLocaleString()}</p>
              </div>
              <div className="pt-2.5 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Weight Weighted Forecast</span>
                <p className="text-sm font-bold text-brand-600">
                  ${Math.round(currentDeal.value * (currentDeal.probability / 100)).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* ACTIVITY SCHEDULER MODAL */}
      <AnimatePresence>
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Log Opportunity Activity</h3>
                <button onClick={() => setShowActivityModal(false)} className="text-slate-450 hover:text-slate-700">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddActivity} className="space-y-3 text-left">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Type</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="Demo">Demo</option>
                    <option value="Presentation">Presentation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter activity title..."
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description</label>
                  <textarea
                    placeholder="Provide details..."
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Assigned Employee</label>
                  <select
                    value={activityAssigned}
                    onChange={(e) => setActivityAssigned(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" onClick={() => setShowActivityModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Schedule Activity
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ADD PRODUCT MODAL */}
        {showAddProdModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 w-full max-w-md shadow-glossy space-y-4"
            >
              <h4 className="text-sm font-black text-slate-800">Add Product / Service mapping</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await addDealProduct(currentDeal.id, {
                      name: newProdName,
                      sku: newProdSku,
                      unitPrice: parseFloat(newProdPrice.toString()),
                      quantity: parseInt(newProdQty.toString()),
                      discount: parseFloat(newProdDisc.toString()),
                      tax: parseFloat(newProdTax.toString())
                    });
                    setShowAddProdModal(false);
                    toast.success('Product Added', 'Pricing totals re-calculated automatically.');
                  } catch {
                    toast.error('Error adding product');
                  }
                }}
                className="space-y-3.5 text-xs text-left"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">SKU</label>
                    <input
                      type="text"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(parseFloat(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Qty</label>
                    <input
                      type="number"
                      value={newProdQty}
                      onChange={(e) => setNewProdQty(parseInt(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Discount ($)</label>
                    <input
                      type="number"
                      value={newProdDisc}
                      onChange={(e) => setNewProdDisc(parseFloat(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Tax ($)</label>
                    <input
                      type="number"
                      value={newProdTax}
                      onChange={(e) => setNewProdTax(parseFloat(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" onClick={() => setShowAddProdModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Map Product
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT PRODUCT MODAL */}
        {showEditProdModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 w-full max-w-md shadow-glossy space-y-4"
            >
              <h4 className="text-sm font-black text-slate-800">Edit Line Item Pricing</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await updateDealProductLine(currentDeal.id, editingProductId, {
                      quantity: parseInt(editProdQty.toString()),
                      discount: parseFloat(editProdDisc.toString()),
                      tax: parseFloat(editProdTax.toString())
                    });
                    setShowEditProdModal(false);
                    toast.success('Line Item Updated', 'Opportunity value recalculated.');
                  } catch {
                    toast.error('Error updating product line');
                  }
                }}
                className="space-y-3.5 text-xs text-left"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editProdQty}
                    onChange={(e) => setEditProdQty(parseInt(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Discount ($)</label>
                  <input
                    type="number"
                    value={editProdDisc}
                    onChange={(e) => setEditProdDisc(parseFloat(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Tax ($)</label>
                  <input
                    type="number"
                    value={editProdTax}
                    onChange={(e) => setEditProdTax(parseFloat(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" onClick={() => setShowEditProdModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* CREATE QUOTE MODAL */}
        {showAddQuoteModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 w-full max-w-md shadow-glossy space-y-4"
            >
              <h4 className="text-sm font-black text-slate-800">Generate Quote Version</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await createDealQuote(currentDeal.id, {
                      quoteNumber: newQuoteNum,
                      version: newQuoteVer,
                      amount: parseFloat(newQuoteAmt.toString()),
                      expiryDate: newQuoteExpiry ? new Date(newQuoteExpiry) : undefined,
                      status: 'Pending Finance Approval'
                    });
                    setShowAddQuoteModal(false);
                    toast.success('Quote Prepared', 'Approval requests dispatched to finance team.');
                  } catch {
                    toast.error('Error creating quote');
                  }
                }}
                className="space-y-3.5 text-xs text-left"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Quote Reference Number</label>
                  <input
                    type="text"
                    value={newQuoteNum}
                    onChange={(e) => setNewQuoteNum(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Version</label>
                    <input
                      type="text"
                      value={newQuoteVer}
                      onChange={(e) => setNewQuoteVer(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Amount ($)</label>
                    <input
                      type="number"
                      value={newQuoteAmt}
                      onChange={(e) => setNewQuoteAmt(parseFloat(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newQuoteExpiry}
                    onChange={(e) => setNewQuoteExpiry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" onClick={() => setShowAddQuoteModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Send for Approval
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ADD COMPETITOR MODAL */}
        {showAddCompModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 w-full max-w-md shadow-glossy space-y-4"
            >
              <h4 className="text-sm font-black text-slate-800">Log Competitor Profile</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await createDealCompetitor(currentDeal.id, {
                      name: newCompName,
                      product: newCompProd,
                      pricing: newCompPrice ? parseFloat(newCompPrice) : undefined,
                      strengths: newCompStrengths,
                      weaknesses: newCompWeaknesses,
                      status: 'Active'
                    });
                    setShowAddCompModal(false);
                    toast.success('Competitor Logged', 'Competitor intelligence database updated.');
                  } catch {
                    toast.error('Error logging competitor');
                  }
                }}
                className="space-y-3.5 text-xs text-left"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={newCompName}
                      onChange={(e) => setNewCompName(e.target.value)}
                      required
                      placeholder="e.g. HubSpot"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Competing Product</label>
                    <input
                      type="text"
                      value={newCompProd}
                      onChange={(e) => setNewCompProd(e.target.value)}
                      placeholder="e.g. Sales Hub Professional"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Est. Competitor Pricing ($/yr)</label>
                  <input
                    type="number"
                    value={newCompPrice}
                    onChange={(e) => setNewCompPrice(e.target.value)}
                    placeholder="e.g. 18000"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Strengths</label>
                  <textarea
                    value={newCompStrengths}
                    onChange={(e) => setNewCompStrengths(e.target.value)}
                    rows={2}
                    placeholder="Key benefits of competitor..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Weaknesses / Gaps</label>
                  <textarea
                    value={newCompWeaknesses}
                    onChange={(e) => setNewCompWeaknesses(e.target.value)}
                    rows={2}
                    placeholder="Where competitor falls short..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" onClick={() => setShowAddCompModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Competitor
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ADD NEGOTIATION ROUND MODAL */}
        {showAddNegModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 w-full max-w-md shadow-glossy space-y-4"
            >
              <h4 className="text-sm font-black text-slate-800">Log Negotiation Round</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const nextRound = dealNegotiations.length + 1;
                    await createDealNegotiation(currentDeal.id, {
                      round: nextRound,
                      currentOffer: parseFloat(newOfferAmt.toString()),
                      counterOffer: newCounterAmt ? parseFloat(newCounterAmt.toString()) : undefined,
                      discountPercent: parseFloat(newDiscountPct.toString()),
                      requestedChanges: newNegChanges,
                      notes: newNegNotes,
                      status: 'Active'
                    });
                    setShowAddNegModal(false);
                    toast.success('Negotiation Logged', 'Negotiation timeline history updated.');
                  } catch {
                    toast.error('Error logging negotiation round');
                  }
                }}
                className="space-y-3.5 text-xs text-left"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Our Offer ($)</label>
                    <input
                      type="number"
                      value={newOfferAmt}
                      onChange={(e) => setNewOfferAmt(parseFloat(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Counter Offer ($)</label>
                    <input
                      type="number"
                      value={newCounterAmt}
                      onChange={(e) => setNewCounterAmt(parseFloat(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Discount Percent (%)</label>
                  <input
                    type="number"
                    value={newDiscountPct}
                    onChange={(e) => setNewDiscountPct(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Requested Changes</label>
                  <textarea
                    value={newNegChanges}
                    onChange={(e) => setNewNegChanges(e.target.value)}
                    rows={2}
                    placeholder="e.g. Extended payment terms, Net 45..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Meeting / Summary Notes</label>
                  <textarea
                    value={newNegNotes}
                    onChange={(e) => setNewNegNotes(e.target.value)}
                    rows={2}
                    placeholder="Key concessions or points agreed..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" onClick={() => setShowAddNegModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Round
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
