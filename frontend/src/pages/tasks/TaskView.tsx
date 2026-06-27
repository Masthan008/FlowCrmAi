import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useTaskStore } from '../../store/taskStore';
import { useLeadStore } from '../../store/leadStore';
import { useAuthStore } from '../../store/authStore';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  Briefcase,
  Paperclip,
  MessageSquare,
  History,
  TrendingUp,
  AlertCircle,
  Download,
  Trash,
  Plus,
  Save,
  CheckCircle,
  X,
  FileText,
  Send,
  Loader2,
  Play,
  Pause,
  Square,
  Users,
  GitBranch,
  RotateCw,
  Sliders,
  Check,
  Award,
  BookOpen,
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-700 border-slate-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
  Overdue: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
  'Pending Approval': 'bg-purple-50 text-purple-700 border-purple-200',
};

const TaskView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employees, fetchEmployees, leads, fetchLeads } = useLeadStore();
  
  const {
    currentTask,
    timelineLogs,
    taskLoading,
    error,
    tasks,
    fetchTasks,
    fetchTask,
    fetchTimeline,
    patchStatus,
    patchProgress,
    deleteTask,
    addComment,
    deleteComment,
    uploadAttachment,
    deleteAttachment,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    addTimeLog,
    deleteTimeLog,
    addWatcher,
    removeWatcher,
    addDependency,
    removeDependency,
    upsertRecurrence,
    requestApproval,
    approveTask,
    rejectTask,
  } = useTaskStore();

  // Subtask & Checklist Form States
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtaskAssignee, setSubtaskAssignee] = useState('');
  const [subtaskPriority, setSubtaskPriority] = useState('Medium');
  
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  // Comment & Attachment Mappings
  const [commentText, setCommentText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Time Tracker stopwatch state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<any>(null);
  const [manualHours, setManualHours] = useState('');
  const [timeNotes, setTimeNotes] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Watchers & Dependencies forms
  const [selectedWatcherId, setSelectedWatcherId] = useState('');
  const [selectedDependentTaskId, setSelectedDependentTaskId] = useState('');
  const [dependencyType, setDependencyType] = useState('blocked_by');

  // Recurrence Config Form
  const [recurrenceFreq, setRecurrenceFreq] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  // Approvals comments
  const [selectedApproverId, setSelectedApproverId] = useState('');
  const [approvalComments, setApprovalComments] = useState('');

  // Modal Controls
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask(id);
      fetchTimeline(id);
      fetchEmployees();
      fetchLeads();
      fetchTasks();
    }
  }, [id]);

  // Handle local stopwatch increment
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Set local pre-fills when task arrives
  useEffect(() => {
    if (currentTask) {
      if (currentTask.recurrence) {
        setRecurrenceFreq(currentTask.recurrence.frequency);
        setRecurrenceInterval(currentTask.recurrence.interval || 1);
      } else {
        setRecurrenceFreq('none');
      }
    }
  }, [currentTask]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    // Local start
  };

  const handleStopTimer = async () => {
    setIsTimerRunning(false);
    if (timerSeconds === 0) return;
    
    // Log hours to backend
    const durationHours = parseFloat((timerSeconds / 3600).toFixed(2));
    if (id) {
      await addTimeLog(id, {
        duration: timerSeconds,
        isTimer: true,
        isBillable,
        notes: `Timer Log: tracked ${durationHours} hours.`,
      });
      setTimerSeconds(0);
    }
  };

  const handleManualTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = parseFloat(manualHours);
    if (isNaN(hrs) || hrs <= 0 || !id) return;

    await addTimeLog(id, {
      duration: Math.round(hrs * 3600),
      isTimer: false,
      isBillable,
      notes: timeNotes || 'Manual hours logging entry.',
    });

    setManualHours('');
    setTimeNotes('');
  };

  // Subtask Handlers
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !id) return;

    await addSubtask(id, {
      title: newSubtaskTitle.trim(),
      assignedToId: subtaskAssignee || null,
      priority: subtaskPriority,
      status: 'Pending',
    });

    setNewSubtaskTitle('');
    setSubtaskAssignee('');
  };

  const handleSubtaskComplete = async (subId: string, currentStatus: string) => {
    if (!id) return;
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    const progress = newStatus === 'Completed' ? 100 : 0;
    await updateSubtask(id, subId, { status: newStatus, progressPercentage: progress });
  };

  const handleSubtaskDelete = async (subId: string) => {
    if (id && window.confirm('Delete subtask?')) {
      await deleteSubtask(id, subId);
    }
  };

  // Checklist Handlers
  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim() || !id) return;

    const order = currentTask?.checklists ? currentTask.checklists.length : 0;
    await addChecklistItem(id, newChecklistTitle.trim(), order);
    setNewChecklistTitle('');
  };

  const handleChecklistCheck = async (itemId: string, currentCompleted: boolean) => {
    if (id) {
      await updateChecklistItem(id, itemId, { isCompleted: !currentCompleted });
    }
  };

  const handleChecklistDelete = async (itemId: string) => {
    if (id) {
      await deleteChecklistItem(id, itemId);
    }
  };

  // Watcher Handlers
  const handleAddWatcher = async () => {
    if (!selectedWatcherId || !id) return;
    await addWatcher(id, selectedWatcherId);
    setSelectedWatcherId('');
  };

  // Dependency Handlers
  const handleAddDependency = async () => {
    if (!selectedDependentTaskId || !id) return;
    await addDependency(id, selectedDependentTaskId, dependencyType);
    setSelectedDependentTaskId('');
  };

  // Recurrence update
  const handleRecurrenceSave = async () => {
    if (!id) return;
    await upsertRecurrence(id, {
      frequency: recurrenceFreq === 'none' ? null : recurrenceFreq,
      interval: recurrenceInterval,
    });
  };

  // Approvals controls
  const handleRequestApproval = async () => {
    if (!selectedApproverId || !id) return;
    await requestApproval(id, selectedApproverId);
    setSelectedApproverId('');
  };

  const handleApprove = async () => {
    if (id) {
      await approveTask(id, approvalComments);
      setApprovalModalOpen(false);
      setApprovalComments('');
    }
  };

  const handleReject = async () => {
    if (id) {
      await rejectTask(id, approvalComments);
      setApprovalModalOpen(false);
      setApprovalComments('');
    }
  };

  // Comment Handlers
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    await addComment(id, commentText.trim());
    setCommentText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && id) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit.');
        return;
      }
      setIsUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append('file', file);
      try {
        await uploadAttachment(id, formData);
      } catch (err: any) {
        setUploadError(err.response?.data?.message || 'Upload failed.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (id) {
      await patchStatus(id, newStatus);
      setStatusModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (id) {
      await deleteTask(id);
      navigate('/tasks');
    }
  };

  // Checklist progress calculator
  const checklistProgress = useMemo(() => {
    if (!currentTask || !currentTask.checklists || currentTask.checklists.length === 0) return 0;
    const completed = currentTask.checklists.filter((c: any) => c.isCompleted).length;
    return Math.round((completed / currentTask.checklists.length) * 100);
  }, [currentTask]);

  // Stopwatch visual formatted string
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getRelationLink = (task: any) => {
    if (!task.relatedModule || !task.relatedRecordId) return null;
    const label = task.lead?.fullName || task.company?.name || task.deal?.name || 'Associated Record';
    const path = `/leads/${task.leadId || task.relatedRecordId}`;
    return (
      <Link to={path} className="text-blue-650 font-bold hover:underline inline-flex items-center gap-1">
        {label}
        <Briefcase size={12} />
      </Link>
    );
  };

  if (taskLoading && !currentTask) {
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

  if (!currentTask) return null;

  // Check if current user is approval approver
  const currentEmployee = employees.find((e) => e.email === user?.email);
  const isApprover = currentTask.approval && currentTask.approval.approverId === currentEmployee?.id;

  return (
    <div className="space-y-6">
      {/* Workspace Header & Action Actions */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tasks')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
            >
              <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-800">{currentTask.title}</h1>
                <Badge variant="glass" className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${statusColors[currentTask.status]}`}>
                  {currentTask.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">ID: {currentTask.taskNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              className="rounded-xl font-bold text-xs"
            >
              Set Status
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigate(`/tasks/${id}/edit`)}
              className="rounded-xl font-bold text-xs"
            >
              Edit Task
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="rounded-xl font-bold text-red-600 border-red-100 hover:bg-red-50 text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* THREE COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (lg:col-span-3) - Task Metadata & Recurrence/Approvals */}
        <div className="lg:col-span-3 space-y-6">
          {/* Metadata Card */}
          <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Task Deliverable Info
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-650">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Priority</span>
                <Badge variant="glass" className={`px-2 py-0.5 rounded border text-[9px] font-bold ${priorityColors[currentTask.priority]}`}>
                  {currentTask.priority}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Category</span>
                <span className="bg-slate-50 px-2 py-0.5 border border-slate-200 rounded">{currentTask.taskType}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Assignee</span>
                <span>{currentTask.assignedTo ? `${currentTask.assignedTo.firstName} ${currentTask.assignedTo.lastName}` : 'Unassigned'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Due Date</span>
                <span>{currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Estimated Effort</span>
                <span>{currentTask.estimatedHours || 0} hrs</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Actual Logged</span>
                <span className="text-blue-600 font-bold">{currentTask.actualHours || 0} hrs</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Relation Link</span>
                <span>{getRelationLink(currentTask) || <span className="text-slate-350">—</span>}</span>
              </div>
            </div>

            {/* Overall Slider Progress */}
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Overall Progress</span>
                <span>{currentTask.progressPercentage}%</span>
              </div>
              <input
                type="range"
                value={currentTask.progressPercentage}
                onChange={(e) => patchProgress(id as string, parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer bg-slate-100 rounded"
                min="0"
                max="100"
              />
            </div>
          </Card>

          {/* Recurrence Settings Widget */}
          <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders size={12} className="text-blue-500" />
              Recurrence Rule
            </h3>

            <div className="space-y-2">
              <select
                value={recurrenceFreq}
                onChange={(e) => setRecurrenceFreq(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="none">One-time Task</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>

              {recurrenceFreq !== 'none' && (
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-slate-400">Every</span>
                  <input
                    type="number"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                    className="w-16 border border-slate-200 rounded-xl p-2 focus:outline-none text-xs font-bold"
                    min="1"
                  />
                  <span className="text-[10px] font-bold text-slate-400">interval</span>
                </div>
              )}

              <Button
                variant="glass"
                size="sm"
                onClick={handleRecurrenceSave}
                className="w-full rounded-xl text-xs font-bold"
              >
                Apply Recurrence
              </Button>
            </div>
          </Card>

          {/* Approvals Workflow Widget */}
          <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Award size={12} className="text-purple-500" />
              Workflow Approvals
            </h3>

            {currentTask.approval ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-800 space-y-1">
                  <span className="font-bold block">Approval Status: {currentTask.approval.status}</span>
                  <span className="text-[10px] text-purple-650 block">
                    Approver: {currentTask.approval.approver ? `${currentTask.approval.approver.firstName} ${currentTask.approval.approver.lastName}` : 'Unassigned'}
                  </span>
                </div>

                {/* If approver and pending approval, show Approve/Reject buttons */}
                {currentTask.approval.status === 'Pending Approval' && isApprover && (
                  <div className="space-y-2">
                    <textarea
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder="Optional remarks/comments..."
                      rows={2}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 focus:outline-none bg-white font-medium"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={handleReject}
                        className="bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <select
                  value={selectedApproverId}
                  onChange={(e) => setSelectedApproverId(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2 focus:outline-none"
                >
                  <option value="">Select Approver</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleRequestApproval}
                  disabled={!selectedApproverId}
                  className="w-full rounded-xl text-xs font-bold border-purple-100 hover:bg-purple-50 text-purple-700"
                >
                  Submit for Approval
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* CENTER COLUMN (lg:col-span-6) - Subtasks, Checklists, stopwatch live timer, comments, files */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* stopwatch live Timer widget & manual entry */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-blue-500" />
                Effort Time Tracker
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[10px] text-slate-400">
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Billable Time
              </label>
            </h3>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Running clock */}
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[160px]">
                <span className="text-2xl font-black text-slate-800 font-mono tracking-wider">
                  {formatTime(timerSeconds)}
                </span>
                <div className="flex justify-center gap-2 mt-3">
                  {!isTimerRunning ? (
                    <Button
                      size="sm"
                      onClick={handleStartTimer}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs p-2 flex items-center justify-center"
                    >
                      <Play size={12} />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setIsTimerRunning(false)}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs p-2 flex items-center justify-center"
                    >
                      <Pause size={12} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleStopTimer}
                    disabled={timerSeconds === 0}
                    className="bg-red-650 hover:bg-red-750 text-white rounded-xl font-bold text-xs p-2 flex items-center justify-center"
                  >
                    <Square size={12} />
                  </Button>
                </div>
              </div>

              {/* Manual input */}
              <form onSubmit={handleManualTimeSubmit} className="flex-1 grid grid-cols-2 gap-3.5">
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Log manual hours</label>
                  <Input
                    type="number"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    placeholder="e.g. 2.5"
                    step="0.1"
                    min="0"
                    required
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity notes</label>
                  <Input
                    value={timeNotes}
                    onChange={(e) => setTimeNotes(e.target.value)}
                    placeholder="Review doc summary"
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2"
                >
                  Log Work Hours
                </Button>
              </form>
            </div>

            {/* Time logs list */}
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {currentTask.timeLogs && currentTask.timeLogs.length > 0 ? (
                currentTask.timeLogs.map((log: any) => (
                  <div key={log.id} className="p-2.5 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-3 transition-colors text-[10px] font-semibold text-slate-600">
                    <div className="truncate">
                      <span className="font-bold text-slate-700 block truncate">
                        {log.notes || 'Effort tracking session'}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        {log.employee ? `${log.employee.firstName} • ` : ''} {new Date(log.createdAt).toLocaleString()} • {log.isBillable ? 'Billable' : 'Non-Billable'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-bold text-blue-600">{parseFloat((log.duration / 3600).toFixed(2))} hrs</span>
                      <button
                        onClick={() => deleteTimeLog(id as string, log.id)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic text-center py-2">No work hours logged.</p>
              )}
            </div>
          </Card>

          {/* Subtasks Workspace Panel */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Subtasks Checklist (1 level nested)</span>
              <Badge variant="glass" className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-2 py-0.5 rounded-lg border text-[10px]">
                {currentTask.subtasks ? currentTask.subtasks.length : 0} Items
              </Badge>
            </h3>

            {/* List subtasks */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {currentTask.subtasks && currentTask.subtasks.length > 0 ? (
                currentTask.subtasks.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-3 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleSubtaskComplete(sub.id, sub.status)}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          sub.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-350 bg-white'
                        }`}
                      >
                        {sub.status === 'Completed' && <Check size={10} strokeWidth={3} />}
                      </button>
                      <div className="truncate">
                        <span className={`text-xs font-bold block truncate ${sub.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {sub.title}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wide">
                          {sub.assignedTo ? `${sub.assignedTo.firstName} • ` : ''} Priority: {sub.priority}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSubtaskDelete(sub.id)}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-2">No subtasks recorded.</p>
              )}
            </div>

            {/* Subtask addition form */}
            <form onSubmit={handleAddSubtask} className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="New subtask title..."
                required
                className="col-span-1.5 rounded-xl border-slate-200 text-xs"
              />
              <select
                value={subtaskAssignee}
                onChange={(e) => setSubtaskAssignee(e.target.value)}
                className="col-span-0.75 text-xs border border-slate-200 rounded-xl p-2 bg-white font-semibold focus:outline-none"
              >
                <option value="">Assignee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                size="sm"
                className="col-span-0.75 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2"
              >
                Add Subtask
              </Button>
            </form>
          </Card>

          {/* Checklist Item Widget */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Task Checklist Items</span>
              <span className="text-[10px] text-slate-400 font-bold">{checklistProgress}% Completed</span>
            </h3>

            {/* Checklist Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {currentTask.checklists && currentTask.checklists.length > 0 ? (
                currentTask.checklists.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleChecklistCheck(item.id, item.isCompleted)}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          item.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-350 bg-white'
                        }`}
                      >
                        {item.isCompleted && <Check size={10} strokeWidth={3} />}
                      </button>
                      <span className={`text-xs font-semibold truncate ${item.isCompleted ? 'line-through text-slate-450' : 'text-slate-700'}`}>
                        {item.title}
                      </span>
                    </div>

                    <button
                      onClick={() => handleChecklistDelete(item.id)}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash size={11} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-2">No checklists added.</p>
              )}
            </div>

            {/* Add checklist input */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <Input
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Add checklist item..."
                required
                className="rounded-xl border-slate-200 text-xs bg-white"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2 px-4 shrink-0"
              >
                Add Item
              </Button>
            </form>
          </Card>

          {/* Live Discussions comments thread */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1">
              <MessageSquare size={12} className="text-purple-500" />
              Comments Discussions Feed
            </h3>

            <form onSubmit={handlePostComment} className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post comment response..."
                className="rounded-xl border-slate-200 bg-white"
              />
              <Button type="submit" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 shrink-0">
                <Send size={14} />
              </Button>
            </form>

            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {currentTask.comments && currentTask.comments.length > 0 ? (
                currentTask.comments.map((cmt: any) => (
                  <div key={cmt.id} className="p-3 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-xl space-y-1 relative group transition-colors">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-slate-500">
                        <User size={10} />
                        {cmt.createdBy || 'Unknown'}
                      </span>
                      <span className="font-mono">{new Date(cmt.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed font-semibold pr-6">
                      {cmt.content}
                    </p>
                    <button
                      onClick={() => deleteComment(id as string, cmt.id)}
                      className="absolute right-2 top-2 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={10} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-4">No comments posted yet.</p>
              )}
            </div>
          </Card>

          {/* Files / Documents Attachments list */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Paperclip size={12} className="text-emerald-500" />
                Attachments
              </h3>
              <Button
                variant="glass"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-lg py-1 px-2.5 h-max"
              >
                Upload File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.csv,.xlsx,.zip"
              />
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-705 text-[10px] font-bold flex items-center gap-1.5 animate-shake">
                <AlertCircle size={12} />
                {uploadError}
              </div>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 italic py-1">
                <Loader2 className="animate-spin text-blue-500" size={14} />
                Uploading document...
              </div>
            )}

            <div className="space-y-2">
              {currentTask.attachments && currentTask.attachments.length > 0 ? (
                currentTask.attachments.map((file: any) => (
                  <div
                    key={file.id}
                    className="p-3 bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-700 block truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {Math.round(file.size / 1024)} KB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`http://localhost:5000/uploads/${file.path}`}
                        download={file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-slate-100 text-slate-450 hover:text-slate-600 transition-colors"
                      >
                        <Download size={13} />
                      </a>
                      <button
                        onClick={() => deleteAttachment(id as string, file.id)}
                        className="p-1 rounded hover:bg-red-50 text-slate-450 hover:text-red-600 transition-colors"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-2">No attachments uploaded.</p>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (lg:col-span-3) - Watchers list, Task dependencies, event history logs */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Watchers list */}
          <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users size={12} className="text-blue-500" />
                Followers / Watchers
              </span>
              <Badge variant="glass" className="bg-slate-50 text-slate-500 font-bold font-mono px-1.5 py-0.2 rounded border text-[9px]">
                {currentTask.watchers ? currentTask.watchers.length : 0}
              </Badge>
            </h3>

            {/* List watchers */}
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {currentTask.watchers && currentTask.watchers.length > 0 ? (
                currentTask.watchers.map((w: any) => (
                  <div key={w.employeeId} className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <span className="truncate">{w.employee ? `${w.employee.firstName} ${w.employee.lastName}` : 'System Follower'}</span>
                    <button
                      onClick={() => removeWatcher(id as string, w.employeeId)}
                      className="text-red-500 hover:text-red-600 text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic text-center py-1">No watchers tracking task.</p>
              )}
            </div>

            {/* Form to add watcher */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <select
                value={selectedWatcherId}
                onChange={(e) => setSelectedWatcherId(e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded-xl p-2 bg-white font-semibold focus:outline-none"
              >
                <option value="">Follow task...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              <Button
                variant="glass"
                size="sm"
                onClick={handleAddWatcher}
                disabled={!selectedWatcherId}
                className="rounded-xl px-2.5 h-max py-2 text-xs font-bold border-slate-200"
              >
                Add
              </Button>
            </div>
          </Card>

          {/* Dependencies / Blocking Links widget */}
          <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <GitBranch size={12} className="text-indigo-500" />
              Task Dependencies
            </h3>

            {/* List current mappings */}
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {currentTask.dependencies && currentTask.dependencies.length > 0 ? (
                currentTask.dependencies.map((dep: any) => (
                  <div key={dep.dependentTaskId} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-[10px] font-semibold text-slate-650 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="font-bold text-slate-800 block truncate">
                        {dep.dependentTask ? dep.dependentTask.title : 'Task Dependency'}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-black block tracking-wider mt-0.5">
                        {dep.type.replace('_', ' ')} • Status: {dep.dependentTask?.status || 'Active'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDependency(id as string, dep.dependentTaskId, dep.type)}
                      className="text-red-500 text-[10px] font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic text-center py-1">No dependencies defined.</p>
              )}
            </div>

            {/* Form to link dependency */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <select
                value={selectedDependentTaskId}
                onChange={(e) => setSelectedDependentTaskId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2 bg-white font-semibold focus:outline-none"
              >
                <option value="">Choose task...</option>
                {tasks
                  .filter((t) => t.id !== id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.taskNumber} • {t.title}
                    </option>
                  ))}
              </select>

              <div className="flex gap-2">
                <select
                  value={dependencyType}
                  onChange={(e) => setDependencyType(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl p-2 bg-white font-semibold focus:outline-none"
                >
                  <option value="blocked_by">Blocked By</option>
                  <option value="blocks">Blocks</option>
                  <option value="waiting_for">Waiting For</option>
                </select>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleAddDependency}
                  disabled={!selectedDependentTaskId}
                  className="rounded-xl px-3.5 h-max py-2 text-xs font-bold border-slate-200"
                >
                  Link
                </Button>
              </div>
            </div>
          </Card>

          {/* Timeline events feed history */}
          <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1">
              <History size={14} className="text-orange-500" />
              Productivity Timeline
            </h3>

            <div className="space-y-4 relative pl-3 border-l border-slate-150 text-[10px] font-semibold text-slate-500 max-h-80 overflow-y-auto">
              {timelineLogs.length > 0 ? (
                timelineLogs.map((log: any) => (
                  <div key={log.id} className="space-y-1 relative py-0.5">
                    <div className="absolute -left-[16.5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                    <span className="font-bold text-slate-700 block">{log.action}</span>
                    <span className="text-slate-500 block leading-normal">{log.notes}</span>
                    <span className="text-[9px] text-slate-400 block font-mono font-medium">
                      {log.user ? `${log.user.fullName} • ` : ''} {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="space-y-1 relative">
                  <div className="absolute -left-[16.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  <span className="font-bold text-slate-700 block">Task Created</span>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    {new Date(currentTask.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Single Task Confirm */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Confirm Task Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete task <strong>{currentTask.title}</strong>? All subtasks, comments, checklists, and time logs will be deleted from the database.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs"
            >
              Delete task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Change Selection Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Set Task Status"
        size="sm"
      >
        <div className="space-y-3">
          {['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className="w-full text-left p-3 hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex justify-between items-center mt-1"
            >
              <span>{st}</span>
              <Badge variant="glass" className={`px-2 py-0.5 rounded border ${statusColors[st]}`}>
                Select
              </Badge>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

const breadcrumbs = [
  { label: 'Tasks', href: '/tasks' },
  { label: 'Task Details' },
];

export default TaskView;
export { TaskView };
