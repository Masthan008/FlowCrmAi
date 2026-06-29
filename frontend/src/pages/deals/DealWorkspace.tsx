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
    fetchProducts,
    fetchQuotes,
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

  // Load Workspace Data
  useEffect(() => {
    if (id) {
      fetchDeal(id);
      fetchNotes(id);
      fetchActivities(id);
      fetchFiles(id);
      fetchTimeline(id);
      fetchHistory(id);
      fetchProducts(id);
      fetchQuotes(id);
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
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'products', label: 'Products', icon: Sparkles },
    { id: 'quotes', label: 'Link', icon: DollarSign },
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
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Associated Products & Services</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="pb-2 font-black uppercase text-[9px]">Product</th>
                        <th className="pb-2 font-black uppercase text-[9px] text-right">Qty</th>
                        <th className="pb-2 font-black uppercase text-[9px] text-right">Unit Price</th>
                        <th className="pb-2 font-black uppercase text-[9px] text-right">Discount</th>
                        <th className="pb-2 font-black uppercase text-[9px] text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dealProducts.map((prod: any) => (
                        <tr key={prod.id}>
                          <td className="py-2.5">
                            <p className="font-semibold text-slate-850">{prod.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{prod.sku}</p>
                          </td>
                          <td className="py-2.5 text-right">{prod.quantity}</td>
                          <td className="py-2.5 text-right">${prod.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 text-right">${prod.discount.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-bold text-slate-800">${prod.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dealProducts.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No products mapped.</p>
                  )}
                </div>
              </Card>
            )}

            {/* QUOTES LINK TAB */}
            {activeTab === 'quotes' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <DollarSign size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Linked Commercial Quotes</h3>
                </div>

                <div className="space-y-3">
                  {dealQuotes.map((q: any) => (
                    <div key={q.id} className="p-4 border border-slate-100 bg-white rounded-2xl flex justify-between items-center shadow-glossy-sm">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 rounded-md uppercase">
                          {q.quoteNumber}
                        </span>
                        <h4 className="text-xs font-bold text-slate-850 mt-1">Amount: ${q.amount.toLocaleString()}</h4>
                        <p className="text-[10px] text-slate-400">
                          Version: {q.version} &bull; Expiry: {new Date(q.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button onClick={() => toast.info('Quote Viewer', 'PDF format viewer module architecture loaded.')} variant="outline" size="xs">
                        View Quote
                      </Button>
                    </div>
                  ))}
                  {dealQuotes.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No linked quotes discovered.</p>
                  )}
                </div>
              </Card>
            )}

            {/* COMMUNICATIONS TAB */}
            {activeTab === 'communications' && (
              <Card className="p-6 text-left space-y-6 bg-white/70">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <MessageSquare size={16} className="text-brand-550" />
                  <h3 className="text-sm font-bold text-slate-800">Unified Communication Center</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 border border-slate-100 rounded-xl bg-white flex gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit"><MessageSquare size={14} /></div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-850">Client Domain Checked</p>
                      <p className="text-slate-500">System verified contact validation record details.</p>
                      <p className="text-[9px] text-slate-400 mt-1">3 hours ago &bull; Logged by System</p>
                    </div>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-xl bg-white flex gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg h-fit"><Calendar size={14} /></div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-850">Enterprise Sync Call</p>
                      <p className="text-slate-500">Confirmed stage movement checks and pricing calculations.</p>
                      <p className="text-[9px] text-slate-400 mt-1">Yesterday &bull; Logged by User</p>
                    </div>
                  </div>
                </div>
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
      </AnimatePresence>

    </div>
  );
};
