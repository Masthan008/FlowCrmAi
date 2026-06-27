import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useTaskStore } from '../../store/taskStore';
import { useLeadStore } from '../../store/leadStore';
import { Save, X, AlertCircle, Loader2 } from 'lucide-react';

const TaskEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees, fetchEmployees, leads, fetchLeads } = useLeadStore();
  const { currentTask, fetchTask, updateTask, loading, taskLoading, error, clearError } = useTaskStore();

  const [isLoaded, setIsLoaded] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [taskType, setTaskType] = useState('General');
  const [relatedModule, setRelatedModule] = useState('none');
  const [relatedRecordId, setRelatedRecordId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [actualHours, setActualHours] = useState<number>(0);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchTask(id);
      fetchEmployees();
      fetchLeads();
      clearError();
    }
  }, [id]);

  // Pre-fill form when task arrives
  useEffect(() => {
    if (currentTask && !isLoaded) {
      setTitle(currentTask.title);
      setDescription(currentTask.description || '');
      setPriority(currentTask.priority);
      setStatus(currentTask.status);
      setTaskType(currentTask.taskType);
      setRelatedModule(currentTask.relatedModule || 'none');
      setRelatedRecordId(currentTask.relatedRecordId || '');
      setAssignedToId(currentTask.assignedToId);
      setDepartment(currentTask.department || '');

      // Format ISO Date for datetime-local
      const formatISO = (isoStr?: string) => {
        if (!isoStr) return '';
        const dt = new Date(isoStr);
        const tzOffset = dt.getTimezoneOffset() * 60000;
        return new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
      };

      setStartDate(formatISO(currentTask.startDate));
      setDueDate(formatISO(currentTask.dueDate));
      setEstimatedHours(currentTask.estimatedHours || 0);
      setActualHours(currentTask.actualHours || 0);

      // Date only formatted for date input (yyyy-MM-dd)
      if (currentTask.reminderDate) {
        setReminderDate(new Date(currentTask.reminderDate).toISOString().slice(0, 10));
      } else {
        setReminderDate('');
      }

      setReminderTime(currentTask.reminderTime || '');
      setProgressPercentage(currentTask.progressPercentage || 0);
      setTagsInput(currentTask.tags ? currentTask.tags.join(', ') : '');

      setIsLoaded(true);
    }
  }, [currentTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedToId || !id) return;

    const tags = tagsInput
      ? tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const payload = {
      title,
      description,
      priority,
      status,
      taskType,
      relatedModule: relatedModule === 'none' ? null : relatedModule,
      relatedRecordId: relatedModule === 'none' ? null : relatedRecordId,
      assignedToId,
      department: department || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      estimatedHours: estimatedHours || 0,
      actualHours: actualHours || 0,
      reminderDate: reminderDate ? new Date(reminderDate).toISOString() : null,
      reminderTime: reminderTime || null,
      progressPercentage,
      tags,
    };

    try {
      await updateTask(id, payload);
      navigate(`/tasks/${id}`);
    } catch {
      // Error handled by store
    }
  };

  const breadcrumbs = [
    { label: 'Tasks', href: '/tasks' },
    { label: currentTask?.title || 'Task Details', href: id ? `/tasks/${id}` : undefined },
    { label: 'Edit' },
  ];

  if (taskLoading && !isLoaded) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Edit Task Deliverable</h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Task Reference: {currentTask?.taskNumber}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Form Card */}
      <Card className="p-6 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Subject / Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Documentation">Documentation</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
                <option value="General">General</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting">Waiting</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                required
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Hours</label>
              <Input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actual Hours Logged</label>
              <Input
                type="number"
                value={actualHours}
                onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)}
                className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress ({progressPercentage}%)</label>
              <input
                type="range"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(parseInt(e.target.value) || 0)}
                className="w-full mt-3 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminder Date</label>
              <Input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</label>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Related Module</label>
              <select
                value={relatedModule}
                onChange={(e) => {
                  setRelatedModule(e.target.value);
                  setRelatedRecordId('');
                }}
                className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="none">None</option>
                <option value="Leads">Leads</option>
                <option value="Contacts">Contacts</option>
                <option value="Companies">Companies</option>
                <option value="Deals">Deals</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associated ID</label>
              {relatedModule === 'none' ? (
                <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold rounded-xl select-none">
                  No relationships.
                </div>
              ) : relatedModule === 'Leads' ? (
                <select
                  value={relatedRecordId}
                  onChange={(e) => setRelatedRecordId(e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">Select Lead</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={relatedRecordId}
                  onChange={(e) => setRelatedRecordId(e.target.value)}
                  placeholder="Associated record UUID"
                  required
                  className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white text-xs"
                />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description Details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full text-sm font-medium border border-slate-200/80 focus:border-blue-400 focus:outline-none rounded-xl p-3 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags (Comma separated)</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="rounded-xl border-slate-200/80 focus:border-blue-400 bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="glass"
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TaskEdit;
