import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useLeadStore } from '../../store/leadStore';
import { leadApi } from '../../services/leadApi';
import {
  Pencil,
  Trash2,
  ArrowLeft,
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  DollarSign,
  CalendarDays,
  Clock,
  MessageSquare,
  Paperclip,
  UserCheck,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle,
  History as HistoryIcon,
  Sparkles,
  Heart,
  TrendingUp,
  ShieldCheck,
  Activity as ActivityIcon,
  Award,
  Settings,
  Bell,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// Subcomponents
import { OverviewTab } from './components/OverviewTab';
import { TimelineTab } from './components/TimelineTab';
import { ActivitiesTab } from './components/ActivitiesTab';
import { NotesTab } from './components/NotesTab';
import { FilesTab } from './components/FilesTab';
import { HistoryTab } from './components/HistoryTab';
import { PlaceholderTab } from './components/PlaceholderTab';
import { RightPanelCards } from './components/RightPanelCards';

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const SLAColors: Record<string, string> = {
  Green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  Red: 'bg-red-50 text-red-750 border-red-250 animate-pulse',
};

const LeadView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Zustand Store
  const {
    currentLead,
    profile,
    timeline,
    activities,
    notes,
    files,
    history,
    employees,
    followups,
    scoreInfo,
    healthInfo,
    slaInfo,
    loading,
    error,
    selectedTab,
    fetchProfile,
    fetchTimeline,
    fetchActivities,
    fetchNotes,
    fetchFiles,
    fetchHistory,
    fetchEmployees,
    setSelectedTab,
    deleteLead,
    clearCurrentLead,
    fetchFollowups,
    createFollowupAction,
    assignLeadAction,
    convertLeadAction,
    saveWorkflowAction,
    fetchScore,
    fetchHealth,
    fetchSla,
    submitApprovalAction,
    reassignLeadAction,
  } = useLeadStore();

  // Dialog Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [actionAlertMessage, setActionAlertMessage] = useState<string | null>(null);

  // Reassignment Form State
  const [assignedToId, setAssignedToId] = useState('');
  const [assignRuleType, setAssignRuleType] = useState<'Manual' | 'ROUND_ROBIN' | 'LOAD_BASED'>('Manual');
  const [assignReason, setAssignReason] = useState('');

  // Follow-up Form State
  const [followupType, setFollowupType] = useState('Phone Call');
  const [followupDate, setFollowupDate] = useState('');
  const [followupTime, setFollowupTime] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');
  const [followupAssignee, setFollowupAssignee] = useState('');

  // Conversion Wizard State
  const [conversionStep, setConversionStep] = useState(1);
  const [convSkipCompany, setConvSkipCompany] = useState(false);
  const [convMergeContact, setConvMergeContact] = useState(false);
  const [convCompanyId, setConvCompanyId] = useState('');
  const [convContactId, setConvContactId] = useState('');
  const [convDealName, setConvDealName] = useState('');
  const [convDealStageId, setConvDealStageId] = useState('');
  const [convNotes, setConvNotes] = useState('');
  const [conversionResult, setConversionResult] = useState<any>(null);

  // Workflow builder State
  const [wfName, setWfName] = useState('');
  const [wfTrigger, setWfTrigger] = useState('Lead Created');
  const [wfConditionField, setWfConditionField] = useState('priority');
  const [wfConditionVal, setWfConditionVal] = useState('High');
  const [wfActionType, setWfActionType] = useState('Change Status');
  const [wfActionVal, setWfActionVal] = useState('');

  // Approval Form State
  const [approvalType, setApprovalType] = useState('Conversion Approval');
  const [approverId, setApproverId] = useState('');
  const [approvalComments, setApprovalComments] = useState('');

  useEffect(() => {
    if (id) {
      fetchProfile(id);
      fetchEmployees();
      fetchFollowups(id);
      fetchScore(id);
      fetchHealth(id);
      fetchSla(id, 45); // Simulate response minutes tracking
      // Lazy load initial tab
      loadTabData(id, selectedTab);
    }
    return () => clearCurrentLead();
  }, [id]);

  const loadTabData = (leadId: string, tab: string) => {
    switch (tab) {
      case 'Overview':
        fetchProfile(leadId);
        break;
      case 'Timeline':
        fetchTimeline(leadId);
        break;
      case 'Activities':
        fetchActivities(leadId);
        break;
      case 'Notes':
        fetchNotes(leadId);
        break;
      case 'Files':
        fetchFiles(leadId);
        break;
      case 'History':
        fetchHistory(leadId);
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (id) {
      loadTabData(id, tab);
    }
  };

  const handleDelete = async () => {
    if (id) {
      await deleteLead(id);
      navigate('/leads');
    }
  };

  // Reassignment Submit Handler
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await assignLeadAction(id, {
        assignedToId: assignRuleType === 'Manual' ? assignedToId : undefined,
        ruleType: assignRuleType !== 'Manual' ? assignRuleType : undefined,
        reason: assignReason || 'CRM Workspace Transfer',
      });
      fetchProfile(id);
      setAssignModalOpen(false);
      setAssignReason('');
    } catch (err: any) {
      setActionAlertMessage(err.message || 'Transfer failed.');
    }
  };

  // Follow-up scheduler Submit Handler
  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !followupDate || !followupAssignee) return;
    try {
      const fullDateStr = `${followupDate}T${followupTime || '09:00'}:00.000Z`;
      await createFollowupAction(id, {
        type: followupType,
        followupDate: fullDateStr,
        assignedToId: followupAssignee,
        notes: followupNotes,
      });
      setFollowupModalOpen(false);
      setFollowupNotes('');
      setFollowupTime('');
      setFollowupDate('');
    } catch (err: any) {
      setActionAlertMessage(err.message || 'Followup scheduling failed.');
    }
  };

  // Workflow builder submit
  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !wfName) return;
    try {
      await saveWorkflowAction(id, {
        name: wfName,
        trigger: wfTrigger,
        conditions: { [wfConditionField]: wfConditionVal },
        actions: [{ type: wfActionType, value: wfActionVal }],
      });
      setWorkflowModalOpen(false);
      setWfName('');
    } catch (err: any) {
      setActionAlertMessage(err.message || 'Workflow builder mapping failed.');
    }
  };

  // Approval submit
  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !approverId) return;
    try {
      await submitApprovalAction(id, {
        type: approvalType,
        approverId,
        comments: approvalComments,
      });
      setApprovalModalOpen(false);
      setApprovalComments('');
    } catch (err: any) {
      setActionAlertMessage(err.message || 'Approval request failed.');
    }
  };

  // Lead Conversion wizard submit
  const handleConvertSubmit = async () => {
    if (!id) return;
    try {
      const res = await convertLeadAction(id, {
        skipCompany: convSkipCompany,
        mergeContact: convMergeContact,
        companyId: convCompanyId || undefined,
        contactId: convContactId || undefined,
        dealName: convDealName || undefined,
        dealStageId: convDealStageId || undefined,
        notes: convNotes,
      });
      setConversionResult(res);
      setConversionStep(6);
    } catch (err: any) {
      setActionAlertMessage(err.message || 'Conversion wizard transaction failed.');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );

  const breadcrumbs = [
    { label: 'Leads', href: '/leads' },
    { label: profile?.fullName || 'Lead Details' },
  ];

  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-3 h-96 rounded-3xl" />
          <Skeleton className="lg:col-span-6 h-96 rounded-3xl" />
          <Skeleton className="lg:col-span-3 h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Leads', href: '/leads' }, { label: 'Error' }]} />
        <div className="flex items-center gap-3 p-6 rounded-xl bg-red-50 border border-red-200 text-red-750 shadow-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
          <Button variant="glass" size="sm" onClick={() => navigate('/leads')} className="ml-auto">
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Workspace Header Info */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leads')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">{profile.fullName}</h1>
                <Badge variant="glass" className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${
                  profile.status?.name === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {profile.status?.name || 'New'}
                </Badge>
                {slaInfo && (
                  <Badge variant="glass" className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold ${SLAColors[slaInfo.status] || SLAColors.Green}`}>
                    SLA Status: {slaInfo.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">ID: {profile.leadNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setConvertModalOpen(true)}
              className="rounded-xl font-bold text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1"
            >
              <Sparkles size={13} />
              Convert Lead
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setFollowupModalOpen(true)}
              className="rounded-xl font-bold text-xs flex items-center gap-1"
            >
              <CalendarDays size={13} />
              Schedule Followup
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setWorkflowModalOpen(true)}
              className="rounded-xl font-bold text-xs flex items-center gap-1"
            >
              <Settings size={13} />
              Automation Rules
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setApprovalModalOpen(true)}
              className="rounded-xl font-bold text-xs flex items-center gap-1 text-purple-700 border-purple-100 hover:bg-purple-50"
            >
              <Award size={13} />
              Submit Approval
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="rounded-xl font-bold text-red-650 border-red-100 hover:bg-red-50 text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {actionAlertMessage && (
        <Card className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs font-bold text-blue-800 animate-fadeIn">
          <span>{actionAlertMessage}</span>
          <button onClick={() => setActionAlertMessage(null)} className="text-blue-500 hover:text-blue-700">Dismiss</button>
        </Card>
      )}

      {/* THREE COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (lg:col-span-3) - Health Card, Lead score, Metadata */}
        <div className="lg:col-span-3 space-y-6">
          {/* Intelligence Scorecard & Overall health gauge */}
          {scoreInfo && healthInfo && (
            <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow border-none space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lead Health Assessment</span>
                <Badge variant="glass" className={`px-2 py-0.5 rounded border text-[9px] font-bold ${
                  healthInfo.overallHealth === 'Healthy' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {healthInfo.overallHealth}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent flex items-center justify-center font-black text-xl text-blue-300">
                  {scoreInfo.score}%
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-200">Rule-Based CRM Score</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Factors Contributing:</span>
                  <span className="text-[9px] text-slate-300 block font-semibold">Engagement, Deal budget</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-[10px] font-bold text-slate-350">
                <div className="flex justify-between">
                  <span>Engagement Level</span>
                  <span>{healthInfo.engagementScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Activity Score</span>
                  <span>{healthInfo.activityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span>SLA Compliance</span>
                  <span>{healthInfo.communicationScore}%</span>
                </div>
              </div>
            </Card>
          )}

          {/* Lead General Details */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Lead Information
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-655">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner Assignee</span>
                <button onClick={() => setAssignModalOpen(true)} className="text-blue-650 font-bold hover:underline inline-flex items-center gap-1">
                  {profile.assignedTo ? `${profile.assignedTo.firstName} ${profile.assignedTo.lastName}` : 'Unassigned'}
                  <UserCheck size={12} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deal Budget</span>
                <span className="font-extrabold text-slate-800">${(profile.value || 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead Source</span>
                <span>{profile.source?.name || '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industry</span>
                <span>{profile.industry || '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <span className="truncate max-w-[120px]">{profile.city || profile.country || '—'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* CENTER COLUMN (lg:col-span-6) - Tabs navigation panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'Overview', label: 'Overview', icon: User },
              { id: 'Timeline', label: 'Timeline & Timeline Logs', icon: Clock },
              { id: 'Activities', label: 'Activities List', icon: ActivityIcon },
              { id: 'Notes', label: 'Discussion Notes', icon: MessageSquare },
              { id: 'Files', label: 'Attachments', icon: Paperclip },
              { id: 'History', label: 'Audit Change History', icon: HistoryIcon },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-400 border-slate-200/80 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Card className="p-6 bg-white border border-slate-200/50 rounded-3xl shadow-sm min-h-[380px]">
            {selectedTab === 'Overview' && <OverviewTab profile={profile} />}
            {selectedTab === 'Timeline' && <TimelineTab leadId={id as string} />}
            {selectedTab === 'Activities' && <ActivitiesTab leadId={id as string} />}
            {selectedTab === 'Notes' && <NotesTab leadId={id as string} />}
            {selectedTab === 'Files' && <FilesTab leadId={id as string} />}
            {selectedTab === 'History' && <HistoryTab leadId={id as string} />}
          </Card>
        </div>

        {/* RIGHT COLUMN (lg:col-span-3) - Scheduled followups list, timeline summaries */}
        <div className="lg:col-span-3 space-y-6">
          {/* Scheduled Follow-ups card */}
          <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Scheduled Follow-ups</span>
              <Badge variant="glass" className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-1.5 py-0.2 rounded border text-[9px]">
                {followups.length}
              </Badge>
            </h3>

            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {followups.length > 0 ? (
                followups.map((follow) => (
                  <div key={follow.id} className="p-2.5 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-xl space-y-1.5 transition-colors text-[10px] font-semibold text-slate-600">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>{follow.type}</span>
                      <Badge variant="glass" className="bg-slate-100 text-slate-500 border-slate-200 px-1 py-0.2 rounded text-[8px]">
                        {follow.status}
                      </Badge>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">{follow.notes || 'Schedule follow-up discussion.'}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-50 font-mono">
                      <span>{new Date(follow.followupDate).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-bold">
                  <CalendarDays size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[10px]">No followups scheduled.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick sidebar elements */}
          <RightPanelCards notes={notes} activities={activities} files={files} />
        </div>

      </div>

      {/* --- DIALOG WORKSPACE MODALS --- */}

      {/* DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Lead Record"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-505 leading-relaxed">
            Are you sure you want to permanently delete lead <strong>{profile.fullName}</strong>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs py-2 px-5"
            >
              Delete lead
            </Button>
          </div>
        </div>
      </Modal>

      {/* OWNERSHIP ASSIGNMENT ENGINE */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="CRM Lead Assignment Selector"
        size="sm"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Routing Strategy</label>
            <select
              value={assignRuleType}
              onChange={(e) => setAssignRuleType(e.target.value as any)}
              className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="Manual">Manual owner selection</option>
              <option value="ROUND_ROBIN">Round Robin sequential routing</option>
              <option value="LOAD_BASED">Load-Based lowest workload</option>
            </select>
          </div>

          {assignRuleType === 'Manual' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Assignee</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                required
                className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="">Choose User...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason for transfer</label>
            <Input
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
              placeholder="e.g. Territory update"
              className="rounded-xl text-xs bg-white border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="glass" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2 px-4"
            >
              Confirm Routing
            </Button>
          </div>
        </form>
      </Modal>

      {/* FOLLOW-UP SCHEDULER */}
      <Modal
        isOpen={followupModalOpen}
        onClose={() => setFollowupModalOpen(false)}
        title="Schedule Follow-up calendar activity"
        size="sm"
      >
        <form onSubmit={handleFollowupSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activity Category</label>
            <select
              value={followupType}
              onChange={(e) => setFollowupType(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="Phone Call">Phone Call</option>
              <option value="Email">Email followup</option>
              <option value="Meeting">Meeting discussion</option>
              <option value="Demo">Visit Demo presentation</option>
              <option value="Visit">On-site Visit</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</label>
              <Input
                type="date"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                required
                className="rounded-xl text-xs bg-white border-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time</label>
              <Input
                type="time"
                value={followupTime}
                onChange={(e) => setFollowupTime(e.target.value)}
                className="rounded-xl text-xs bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned User</label>
            <select
              value={followupAssignee}
              onChange={(e) => setFollowupAssignee(e.target.value)}
              required
              className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="">Select User...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notes</label>
            <textarea
              value={followupNotes}
              onChange={(e) => setFollowupNotes(e.target.value)}
              placeholder="Discussion goals notes..."
              rows={2}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none bg-white font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="glass" size="sm" onClick={() => setFollowupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Confirm schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* WORKFLOW RULE BUILDER */}
      <Modal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        title="Custom Lead Workflow Rule Builder"
        size="md"
      >
        <form onSubmit={handleWorkflowSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workflow Rule Name</label>
            <Input
              value={wfName}
              onChange={(e) => setWfName(e.target.value)}
              placeholder="e.g. Route critical leads to Super Admin"
              required
              className="rounded-xl border-slate-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trigger Event</label>
              <select
                value={wfTrigger}
                onChange={(e) => setWfTrigger(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2 focus:outline-none"
              >
                <option value="Lead Created">Lead Created</option>
                <option value="Lead Updated">Lead Updated</option>
                <option value="Lead Assigned">Lead Assigned</option>
                <option value="Status Changed">Status Changed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Condition Target Field</label>
              <select
                value={wfConditionField}
                onChange={(e) => setWfConditionField(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2 focus:outline-none"
              >
                <option value="priority">Priority</option>
                <option value="industry">Industry Tech</option>
                <option value="minValue">MinValue expected value</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Condition Target Value</label>
              <Input
                value={wfConditionVal}
                onChange={(e) => setWfConditionVal(e.target.value)}
                placeholder="e.g. Critical, Technology"
                className="rounded-xl text-xs bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispatch Action</label>
              <select
                value={wfActionType}
                onChange={(e) => setWfActionType(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2 focus:outline-none"
              >
                <option value="Change Status">Change status state</option>
                <option value="Assign User">Assign target user</option>
                <option value="Create Task">Create task activity</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action parameter value</label>
            <Input
              value={wfActionVal}
              onChange={(e) => setWfActionVal(e.target.value)}
              placeholder="Status ID, employee ID or Task title text..."
              className="rounded-xl text-xs bg-white border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="glass" size="sm" onClick={() => setWorkflowModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2 px-5"
            >
              Add Workflow Automator
            </Button>
          </div>
        </form>
      </Modal>

      {/* APPROVAL SUBMISSION PANEL */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="Submit Approval Request"
        size="sm"
      >
        <form onSubmit={handleApprovalSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approval Category</label>
            <select
              value={approvalType}
              onChange={(e) => setApprovalType(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="Value Approval">Value limit approval</option>
              <option value="Transfer Approval">Ownership transfer approval</option>
              <option value="Conversion Approval">Conversion Wizard approval</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Designated Approver</label>
            <select
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              required
              className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="">Choose Employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Request remarks</label>
            <textarea
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Remarks for request approval..."
              rows={2}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none bg-white font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="glass" size="sm" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Request Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* LEAD CONVERSION WIZARD (6 STEPS) */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setConversionStep(1);
          setConversionResult(null);
        }}
        title="CRM Lead Conversion Wizard"
        size="md"
      >
        <div className="space-y-4">
          {/* Progress tracker steps */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            <span>Step {conversionStep} of 6</span>
            <span>
              {conversionStep === 1 && 'Verify Lead Info'}
              {conversionStep === 2 && 'Map Company Details'}
              {conversionStep === 3 && 'Establish Contact'}
              {conversionStep === 4 && 'Sales Deal Stage'}
              {conversionStep === 5 && 'Verify layout review'}
              {conversionStep === 6 && 'Conversions completed!'}
            </span>
          </div>

          {conversionStep === 1 && (
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <p>Confirm the details from the lead file below:</p>
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-150">
                <div>First Name: {profile.firstName}</div>
                <div>Last Name: {profile.lastName}</div>
                <div className="col-span-2">Email: {profile.email || '—'}</div>
                <div>Company Name: {profile.companyName || '—'}</div>
                <div>Deal Value: ${(profile.value || 0).toLocaleString()}</div>
              </div>
              <div className="flex justify-end pt-3">
                <Button onClick={() => setConversionStep(2)} className="bg-blue-600 text-white font-bold rounded-xl text-xs py-2 px-5">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {conversionStep === 2 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={convSkipCompany}
                  onChange={(e) => setConvSkipCompany(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Skip company record creation (Use general placeholder)
              </label>

              {!convSkipCompany && (
                <div className="space-y-3.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700">
                  <div className="font-bold text-slate-800">New Company properties to create:</div>
                  <div>Company Name: {profile.companyName || 'Lead Company record'}</div>
                  <div>Industry Category: {profile.industry || '—'}</div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="glass" size="sm" onClick={() => setConversionStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setConversionStep(3)} className="bg-blue-600 text-white font-bold rounded-xl text-xs">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {conversionStep === 3 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={convMergeContact}
                  onChange={(e) => setConvMergeContact(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Merge duplicate contact card if exists
              </label>

              {convMergeContact && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Contact ID</label>
                  <Input
                    value={convContactId}
                    onChange={(e) => setConvContactId(e.target.value)}
                    placeholder="Past duplicate Contact UUID..."
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="glass" size="sm" onClick={() => setConversionStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setConversionStep(4)} className="bg-blue-600 text-white font-bold rounded-xl text-xs">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {conversionStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auto-Generated Deal Name</label>
                <Input
                  value={convDealName}
                  onChange={(e) => setConvDealName(e.target.value)}
                  placeholder="e.g. Enterprise package deal"
                  className="rounded-xl border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Stage</label>
                <select
                  value={convDealStageId}
                  onChange={(e) => setConvDealStageId(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">Select Pipeline Stage...</option>
                  <option value="1">New opportunity stage</option>
                  <option value="2">Qualified Stage</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="glass" size="sm" onClick={() => setConversionStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setConversionStep(5)} className="bg-blue-600 text-white font-bold rounded-xl text-xs">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {conversionStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversion summary remarks</label>
                <textarea
                  value={convNotes}
                  onChange={(e) => setConvNotes(e.target.value)}
                  placeholder="Review notes..."
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="glass" size="sm" onClick={() => setConversionStep(4)}>
                  Back
                </Button>
                <Button onClick={handleConvertSubmit} className="bg-blue-600 text-white font-bold rounded-xl text-xs">
                  Convert Lead Now
                </Button>
              </div>
            </div>
          )}

          {conversionStep === 6 && (
            <div className="space-y-4 text-center py-4">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-2 animate-bounce" />
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-800 block">✓ Lead successfully converted!</span>
                <span className="text-[10px] text-slate-400 block">All note logs and file timelines are preserved.</span>
              </div>

              <div className="flex justify-center pt-3">
                <Button
                  onClick={() => {
                    setConvertModalOpen(false);
                    setConversionStep(1);
                    fetchProfile(id as string);
                  }}
                  className="bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs py-2 px-6"
                >
                  Close & Redirect
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LeadView;
export { LeadView };
