import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import {
  Phone,
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle,
  FileText,
  Activity,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import type { LeadActivity } from '../../../types/lead';
import useLeadStore from '../../../store/leadStore';

interface ActivitiesTabProps {
  leadId: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'Call':
      return <Phone size={14} className="text-green-600" />;
    case 'Meeting':
      return <Calendar size={14} className="text-purple-600" />;
    case 'Email':
      return <Mail size={14} className="text-blue-600" />;
    case 'SMS':
      return <MessageSquare size={14} className="text-teal-600" />;
    case 'Task':
      return <CheckCircle size={14} className="text-indigo-600" />;
    case 'Follow-up':
      return <Clock size={14} className="text-amber-600" />;
    case 'Demo':
      return <SparklesIcon size={14} className="text-rose-600" />;
    case 'Visit':
      return <MapPinIcon size={14} className="text-cyan-600" />;
    default:
      return <Activity size={14} className="text-slate-600" />;
  }
};

const SparklesIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/></svg>
);

const MapPinIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
);

const priorityColors: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const statusColors: Record<string, string> = {
  Planned: 'bg-sky-50 text-sky-700 border-sky-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ leadId }) => {
  const {
    activities,
    employees,
    fetchActivities,
    fetchEmployees,
    createActivity,
    updateActivity,
    deleteActivity,
    tabLoading,
  } = useLeadStore();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [type, setType] = useState('Call');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [status, setStatus] = useState('Planned');
  const [priority, setPriority] = useState('Medium');
  const [assignedToId, setAssignedToId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const loading = tabLoading.Activities;

  useEffect(() => {
    fetchActivities(leadId);
    fetchEmployees();
  }, [leadId]);

  // Load Filters from API
  const applyFilters = () => {
    const params: any = {};
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (statusFilter) params.status = statusFilter;
    fetchActivities(leadId, params);
  };

  useEffect(() => {
    applyFilters();
  }, [typeFilter, priorityFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activityDate) return;

    // Convert date string to ISO format
    const isoDate = new Date(activityDate).toISOString();

    const payload = {
      type,
      title,
      description,
      activityDate: isoDate,
      status,
      priority,
      assignedToId: assignedToId || null,
      isCompleted,
    };

    try {
      if (isEditing && selectedActivityId) {
        await updateActivity(leadId, selectedActivityId, payload);
      } else {
        await createActivity(leadId, payload);
      }
      setFormOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setType('Call');
    setTitle('');
    setDescription('');
    setActivityDate('');
    setStatus('Planned');
    setPriority('Medium');
    setAssignedToId('');
    setIsCompleted(false);
    setIsEditing(false);
    setSelectedActivityId(null);
  };

  const handleEditInit = (act: LeadActivity) => {
    setType(act.type);
    setTitle(act.title);
    setDescription(act.description || '');
    
    // Format Date for datetime-local (yyyy-MM-ddThh:mm)
    const dt = new Date(act.activityDate);
    const tzOffset = dt.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
    setActivityDate(localISOTime);

    setStatus(act.status);
    setPriority(act.priority);
    setAssignedToId(act.assignedToId || '');
    setIsCompleted(act.isCompleted);
    setIsEditing(true);
    setSelectedActivityId(act.id);
    setFormOpen(true);
  };

  const handleDeleteInit = (actId: string) => {
    setActivityToDelete(actId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (activityToDelete) {
      await deleteActivity(leadId, activityToDelete);
      setDeleteConfirmOpen(false);
      setActivityToDelete(null);
    }
  };

  // Completion toggle directly on the list
  const handleToggleComplete = async (act: LeadActivity) => {
    await updateActivity(leadId, act.id, {
      isCompleted: !act.isCompleted,
      status: !act.isCompleted ? 'Completed' : 'Planned',
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="pl-9 pr-4 rounded-xl border-slate-200/80 focus:border-blue-400 bg-white/70"
            />
          </div>
          <Button variant="glass" type="submit" size="sm" className="rounded-xl">
            Search
          </Button>
        </form>

        <div className="flex gap-2 items-center">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl flex items-center gap-1.5 ${showFilters ? 'bg-slate-100 border-slate-300' : ''}`}
          >
            <Filter size={14} />
            Filters
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="rounded-xl flex items-center gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <Plus size={16} />
            Log Activity
          </Button>
        </div>
      </div>

      {/* Dynamic Filter Panel */}
      {showFilters && (
        <Card className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Call">Call</option>
              <option value="Meeting">Meeting</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Task">Task</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Demo">Demo</option>
              <option value="Visit">Visit</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </Card>
      )}

      {/* Activity List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
        ) : activities.length > 0 ? (
          activities.map((act) => (
            <Card
              key={act.id}
              className={`p-5 bg-white/75 backdrop-blur-sm border border-slate-200/60 transition-all duration-300 rounded-2xl flex items-start gap-4 hover:shadow-md ${
                act.isCompleted ? 'opacity-80 border-slate-100' : ''
              }`}
            >
              {/* Checkbox for quick complete */}
              <button
                onClick={() => handleToggleComplete(act)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center mt-1 transition-all ${
                  act.isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 hover:border-blue-500 bg-white'
                }`}
              >
                {act.isCompleted && <Check size={12} strokeWidth={3} />}
              </button>

              {/* Core Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <div className="p-1 bg-slate-50 rounded-lg">
                    {getActivityIcon(act.type)}
                  </div>
                  <h4 className={`text-sm font-bold text-slate-800 tracking-tight ${act.isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {act.title}
                  </h4>
                  <Badge variant="glass" className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${priorityColors[act.priority] || priorityColors.Medium}`}>
                    {act.priority}
                  </Badge>
                  <Badge variant="glass" className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${statusColors[act.status] || statusColors.Planned}`}>
                    {act.status}
                  </Badge>
                </div>

                {act.description && (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3 whitespace-pre-wrap">
                    {act.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-50">
                  <span className="flex items-center gap-1.5">
                    <Clock size={10} className="text-slate-300" />
                    Due: {new Date(act.activityDate).toLocaleString()}
                  </span>
                  {act.assignedTo && (
                    <span className="flex items-center gap-1.5">
                      <User size={10} className="text-slate-300" />
                      Assignee: {act.assignedTo.firstName} {act.assignedTo.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditInit(act)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-transparent"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => handleDeleteInit(act.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-2xl border border-dashed border-slate-200/80 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Activities Logged</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              No tasks, calls, or demos have been logged. Log your first outreach to start tracking communications.
            </p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={isEditing ? 'Edit Activity Details' : 'Log New Activity'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Task">Task</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Demo">Demo</option>
                <option value="Visit">Visit</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Schedule Date</label>
              <Input
                type="datetime-local"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                required
                className="rounded-xl border-slate-200/80 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Subject / Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discuss Q3 Quotation Details"
              required
              className="rounded-xl border-slate-200/80 focus:border-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description & Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Log notes about this touchpoint..."
              rows={4}
              className="w-full text-sm font-medium border border-slate-200/80 focus:border-blue-400 focus:outline-none rounded-xl p-3 bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Planned">Planned</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200/80 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="">Select Assignee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              id="is_completed_check"
              checked={isCompleted}
              onChange={(e) => {
                setIsCompleted(e.target.checked);
                if (e.target.checked) setStatus('Completed');
              }}
              className="w-4 h-4 rounded text-blue-600 border-slate-200 focus:ring-blue-400"
            />
            <label htmlFor="is_completed_check" className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none cursor-pointer flex items-center gap-1">
              Mark this activity as Completed
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="glass" type="button" onClick={() => setFormOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              Log Touchpoint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Activity"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete this activity record? This will archive the record from filters.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm text-xs"
            >
              <Trash2 size={14} className="mr-1" />
              Remove Activity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
