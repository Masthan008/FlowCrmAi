import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useTaskStore } from '../../store/taskStore';
import { useLeadStore } from '../../store/leadStore';
import { useAuthStore } from '../../store/authStore';
import {
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  User,
  Tag,
  Briefcase,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const TaskAdd: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employees, fetchEmployees, leads, fetchLeads } = useLeadStore();
  const { createTask, loading, error, clearError } = useTaskStore();

  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form State
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
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchLeads();
    clearError();
  }, []);

  // Pre-fill department from selected employee
  useEffect(() => {
    if (assignedToId) {
      const emp = employees.find((e) => e.id === assignedToId);
      if (emp && emp.department) {
        setDepartment(emp.department);
      }
    }
  }, [assignedToId]);

  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!title.trim()) errors.title = 'Task title is required';
      if (!taskType) errors.taskType = 'Task type is required';
    }

    if (currentStep === 2) {
      if (!assignedToId) errors.assignedToId = 'Assignee is required';
    }

    if (currentStep === 3) {
      if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
        errors.dueDate = 'Due Date cannot be earlier than Start Date';
      }
    }

    if (currentStep === 4) {
      if (relatedModule !== 'none' && !relatedRecordId) {
        errors.relatedRecordId = 'Associated record selection is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    // Build payload
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
      reminderDate: reminderDate ? new Date(reminderDate).toISOString() : null,
      reminderTime: reminderTime || null,
      tags,
    };

    try {
      await createTask(payload);
      navigate('/tasks');
    } catch {
      // Error handled by store
    }
  };

  const breadcrumbs = [
    { label: 'Tasks', href: '/tasks' },
    { label: 'New Task' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Create Task Deliverable</h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
          Step {step} of 4: {step === 1 && 'Basic Information'}
          {step === 2 && 'Assignment & Priority'}
          {step === 3 && 'Schedule & Reminders'}
          {step === 4 && 'CRM Relationships & Tags'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Steps Indicator Bar */}
      <div className="flex gap-2 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-full rounded-full transition-all duration-300 ${
              i <= step ? 'bg-blue-600' : 'bg-slate-250/40'
            }`}
          />
        ))}
      </div>

      {/* Multi-step Form body */}
      <Card className="p-6 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Subject / Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Discovery Call / Send Proposal review"
                  required
                  className="rounded-xl border-slate-200/80 focus:border-blue-400"
                />
                {validationErrors.title && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Category Type</label>
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting">Waiting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elaborate details or goals for this deliverable..."
                  rows={5}
                  className="w-full text-sm font-medium border border-slate-200/80 focus:border-blue-400 focus:outline-none rounded-xl p-3 bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ASSIGNMENT & PRIORITY */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Team User</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  required
                  className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">Select Assignee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
                {validationErrors.assignedToId && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.assignedToId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority Weight</label>
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Group</label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Sales Account Team"
                    className="rounded-xl border-slate-200/80 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE & REMINDERS */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Schedule Date</label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl border-slate-200/80 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl border-slate-200/80 focus:border-blue-400"
                  />
                  {validationErrors.dueDate && (
                    <p className="text-[10px] text-red-500 font-bold">{validationErrors.dueDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminder Date</label>
                  <Input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="rounded-xl border-slate-200/80 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</label>
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    placeholder="e.g. 09:00"
                    className="rounded-xl border-slate-200/80 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Effort Hours</label>
                <Input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="rounded-xl border-slate-200/80 focus:border-blue-400"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <Info size={14} className="shrink-0" />
                <span>Dashboard badge indicator reminders will fire on due dates.</span>
              </div>
            </div>
          )}

          {/* STEP 4: RELATIONSHIPS & TAGS */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Related CRM Module</label>
                  <select
                    value={relatedModule}
                    onChange={(e) => {
                      setRelatedModule(e.target.value);
                      setRelatedRecordId('');
                    }}
                    className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="none">General Task (None)</option>
                    <option value="Leads">Leads</option>
                    <option value="Contacts">Contacts</option>
                    <option value="Companies">Companies</option>
                    <option value="Deals">Deals</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associated record</label>
                  {relatedModule === 'none' ? (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold rounded-xl select-none">
                      No module relationship active.
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
                          {l.fullName} ({l.companyName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={relatedRecordId}
                      onChange={(e) => setRelatedRecordId(e.target.value)}
                      placeholder="Paste associated UUID ID"
                      required
                      className="rounded-xl border-slate-200/80 focus:border-blue-400 text-xs"
                    />
                  )}
                  {validationErrors.relatedRecordId && (
                    <p className="text-[10px] text-red-500 font-bold">{validationErrors.relatedRecordId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags / Labels (Comma separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. follow-up, pricing, critical-path"
                  className="rounded-xl border-slate-200/80 focus:border-blue-400"
                />
              </div>
            </div>
          )}

          {/* Form Actions footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button
              variant="glass"
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-xl flex items-center gap-1 text-xs"
            >
              <ChevronLeft size={14} />
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="glass"
                type="button"
                onClick={() => navigate('/tasks')}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shadow text-xs"
                >
                  Continue
                  <ChevronRight size={14} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md text-xs"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  Save Task
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TaskAdd;
