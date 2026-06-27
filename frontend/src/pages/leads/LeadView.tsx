import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
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
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
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
    loading,
    error,
    selectedTab,
    tabLoading,
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
  } = useLeadStore();

  // Dialog Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [actionAlertMessage, setActionAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile(id);
      fetchEmployees();
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

  const handleQuickAction = (type: 'Call' | 'SMS') => {
    if (!profile) return;
    const phone = profile.phone || profile.alternatePhone;
    if (!phone) {
      setActionAlertMessage('No phone number is available for this lead.');
      return;
    }
    if (type === 'Call') {
      setActionAlertMessage(`Initiating VoIP Call connection to ${phone}... (Integration active in the next phase)`);
    } else {
      setActionAlertMessage(`Opening SMS chat gateway for ${phone}... (Integration active in the next phase)`);
    }
  };

  const handleQuickAssign = async (employeeId: string) => {
    if (!id) return;
    try {
      await leadApi.updateOwner(id, employeeId);
      await fetchProfile(id);
      setAssignModalOpen(false);
      // Reload timeline and history if open
      if (selectedTab === 'Timeline') fetchTimeline(id);
      if (selectedTab === 'History') fetchHistory(id);
    } catch (err: any) {
      setActionAlertMessage(err.response?.data?.message || 'Failed to reassign lead.');
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Leads', href: '/leads' }, { label: 'Error' }]} />
        <div className="flex items-center gap-3 p-6 rounded-xl bg-red-50 border border-red-200 text-red-700 shadow-sm">
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
      {/* Header breadcrumb & Meta */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leads')}
              className="p-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                  {profile.fullName}
                </h1>
                {profile.status && (
                  <span
                    className="inline-flex items-center px-3 py-0.5 rounded-lg text-xs font-semibold border"
                    style={{
                      backgroundColor: `${profile.status.color}15`,
                      color: profile.status.color,
                      borderColor: `${profile.status.color}30`,
                    }}
                  >
                    {profile.status.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">ID: {profile.leadNumber}</p>
            </div>
          </div>
          
          {/* Main Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigate(`/leads/${id}/edit`)}
              className="flex items-center gap-1.5 rounded-xl font-bold border-slate-200"
            >
              <Pencil size={14} />
              Edit Lead
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-1.5 text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* THREE-PANEL WORKSPACE GRID */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        
        {/* LEFT PANEL (30% Width) - Lead Summary Card */}
        <div className="w-full lg:w-[30%] flex-shrink-0 space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-3xl space-y-5">
            {/* Profile Avatar & Primary Info */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md mb-3">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">{profile.fullName}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{profile.jobTitle || 'No Title'} at {profile.companyName || 'No Company'}</p>
              
              <div className="flex gap-1.5 items-center mt-3">
                <Badge variant="glass" className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${priorityColors[profile.priority] || priorityColors.Medium}`}>
                  {profile.priority}
                </Badge>
                {renderStars(profile.rating)}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-4 gap-2 pb-4 border-b border-slate-100 text-center">
              <button
                onClick={() => handleQuickAction('Call')}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors gap-1 border border-slate-100 shadow-sm"
              >
                <Phone size={16} className="text-green-600" />
                <span className="text-[10px] font-bold text-slate-500">Call</span>
              </button>
              <button
                onClick={() => handleTabChange('Emails')}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors gap-1 border border-slate-100 shadow-sm"
              >
                <Mail size={16} className="text-blue-600" />
                <span className="text-[10px] font-bold text-slate-500">Email</span>
              </button>
              <button
                onClick={() => handleQuickAction('SMS')}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors gap-1 border border-slate-100 shadow-sm"
              >
                <MessageSquare size={16} className="text-teal-600" />
                <span className="text-[10px] font-bold text-slate-500">SMS</span>
              </button>
              <button
                onClick={() => setConvertModalOpen(true)}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors gap-1 border border-slate-100 shadow-sm"
              >
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-[10px] font-bold text-slate-500">Convert</span>
              </button>
            </div>

            {/* General Fields Info */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Owner</span>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  {profile.assignedTo ? `${profile.assignedTo.firstName} ${profile.assignedTo.lastName}` : 'Unassigned'}
                  <UserCheck size={12} />
                </button>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Source</span>
                <span className="font-semibold text-slate-700">{profile.source?.name || '—'}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Deal Value</span>
                <span className="font-extrabold text-slate-800 text-sm">${profile.value.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Closing Date</span>
                <span className="font-semibold text-slate-700">
                  {profile.expectedClosingDate ? new Date(profile.expectedClosingDate).toLocaleDateString() : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Industry</span>
                <span className="font-semibold text-slate-700">{profile.industry || '—'}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Location</span>
                <span className="font-semibold text-slate-700">
                  {profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.country || '—'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* CENTER PANEL (45% Width) - Tabs Nav & Views */}
        <div className="w-full lg:w-[45%] flex-shrink-0 space-y-6">
          
          {/* Scrollable Tab Navigation bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
            {[
              { id: 'Overview', label: 'Overview', icon: User },
              { id: 'Timeline', label: 'Timeline', icon: Clock },
              { id: 'Activities', label: 'Activities', icon: ActivityIcon },
              { id: 'Notes', label: 'Notes', icon: MessageSquare },
              { id: 'Files', label: 'Files', icon: Paperclip },
              { id: 'Emails', label: 'Emails', icon: Mail },
              { id: 'Meetings', label: 'Meetings', icon: CalendarDays },
              { id: 'Tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'History', label: 'History', icon: HistoryIcon },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 shadow-sm ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
                      : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Independent lazy loading views */}
          <Card className="p-6 bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-3xl shadow-sm">
            {selectedTab === 'Overview' && <OverviewTab profile={profile} />}
            {selectedTab === 'Timeline' && <TimelineTab leadId={id as string} />}
            {selectedTab === 'Activities' && <ActivitiesTab leadId={id as string} />}
            {selectedTab === 'Notes' && <NotesTab leadId={id as string} />}
            {selectedTab === 'Files' && <FilesTab leadId={id as string} />}
            {['Emails', 'Meetings', 'Tasks'].includes(selectedTab) && (
              <PlaceholderTab tabName={selectedTab as 'Emails' | 'Meetings' | 'Tasks'} />
            )}
            {selectedTab === 'History' && <HistoryTab leadId={id as string} />}
          </Card>
        </div>

        {/* RIGHT PANEL (25% Width) - Widgets & Metrics */}
        <div className="w-full lg:w-[25%] flex-shrink-0">
          <RightPanelCards notes={notes} activities={activities} files={files} />
        </div>

      </div>

      {/* --- DIALOG MODALS --- */}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Lead Record"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete lead <strong>{profile.fullName}</strong>? This action can be undone later by system admins.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md text-xs"
            >
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>

      {/* Convert Lead Placeholder Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Lead to Account & Contact"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium leading-relaxed flex items-start gap-2.5">
            <Sparkles className="mt-0.5 shrink-0" size={16} />
            <div>
              <span className="font-bold">Architecture Ready Panel</span>
              <p className="mt-0.5 text-slate-600">
                Lead Conversion to client account records will be fully configured and automated in Phase 5.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs" onClick={() => setConvertModalOpen(false)}>
              Proceed
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Owner Selection Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Reassign Lead Ownership"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Select a sales executive to assign the ownership of <strong>{profile.fullName}</strong>.
          </p>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto border border-slate-200/60 rounded-xl bg-white shadow-inner">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleQuickAssign(emp.id)}
                  className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-700">{emp.firstName} {emp.lastName}</span>
                    <span className="text-slate-400 block font-semibold">{emp.email}</span>
                  </div>
                  <UserCheck size={14} className="text-slate-300 hover:text-blue-600" />
                </button>
              ))
            ) : (
              <p className="p-4 text-xs text-slate-400 italic">No employees found.</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="glass" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Action Gateway Alerts */}
      {actionAlertMessage && (
        <Modal
          isOpen={!!actionAlertMessage}
          onClose={() => setActionAlertMessage(null)}
          title="CRM Action Notification"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              {actionAlertMessage}
            </p>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs" onClick={() => setActionAlertMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default LeadView;
