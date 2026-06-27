import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { useTaskStore } from '../store/taskStore';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Columns,
  ChevronDown,
  LayoutGrid,
  List,
  UserCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  FolderOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Check,
  Loader2,
  Grid,
  FileDown,
  FileUp,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
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

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employees, fetchEmployees } = useLeadStore();
  const {
    tasks,
    statistics,
    kanbanData,
    calendarTasks,
    workloadData,
    productivityAnalytics,
    loading,
    error,
    filters,
    pagination,
    fetchTasks,
    fetchStatistics,
    fetchCalendar,
    fetchWorkload,
    fetchProductivity,
    setFilters,
    setPage,
    patchStatus,
    patchProgress,
    patchAssign,
    deleteTask,
    createTask,
    clearError,
  } = useTaskStore();

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'List' | 'Kanban' | 'MyTasks' | 'Calendar' | 'Gantt' | 'Workload'>('Dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  
  // Local filters
  const [searchInput, setSearchInput] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Bulk Actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkPriorityModal, setBulkPriorityModal] = useState(false);
  const [bulkAssignModal, setBulkAssignModal] = useState(false);
  const [bulkAssigneeId, setBulkAssigneeId] = useState('');

  // CSV Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    taskNumber: true,
    title: true,
    assignee: true,
    relation: true,
    priority: true,
    status: true,
    progress: true,
    dueDate: true,
    createdAt: true,
  });

  // Calendar Month State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Delete Confirm Modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    loadWorkspaceData();
  }, [activeTab]);

  const loadWorkspaceData = () => {
    const options = activeTab === 'MyTasks' ? { myTasks: true } : undefined;
    fetchTasks(options);
    fetchStatistics(options);

    if (activeTab === 'Calendar') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString();
      const lastDay = new Date(year, month + 1, 0).toISOString();
      fetchCalendar(firstDay, lastDay);
    } else if (activeTab === 'Workload') {
      fetchWorkload();
    } else if (activeTab === 'Dashboard') {
      fetchProductivity('week');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    loadWorkspaceData();
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setPriorityFilter('');
    setStatusFilter('');
    setTypeFilter('');
    setAssigneeFilter('');
    setDepartmentFilter('');
    setFilters({
      search: '',
      priority: '',
      status: '',
      taskType: '',
      assignedToId: '',
      department: '',
    });
    setTimeout(() => loadWorkspaceData(), 50);
  };

  useEffect(() => {
    setFilters({
      priority: priorityFilter || undefined,
      status: statusFilter || undefined,
      taskType: typeFilter || undefined,
      assignedToId: assigneeFilter || undefined,
      department: departmentFilter || undefined,
    });
    loadWorkspaceData();
  }, [priorityFilter, statusFilter, typeFilter, assigneeFilter, departmentFilter]);

  // DRAG & DROP KANBAN
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    try {
      await patchStatus(taskId, targetStatus);
      loadWorkspaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      loadWorkspaceData();
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    await patchStatus(id, newStatus);
    loadWorkspaceData();
  };

  const getRelationDescription = (task: any) => {
    if (!task.relatedModule || !task.relatedRecordId) return 'General';
    const relatedName =
      task.lead?.fullName ||
      (task.contact ? `${task.contact.firstName} ${task.contact.lastName}` : null) ||
      task.company?.name ||
      task.deal?.name ||
      'Record';
    return `${task.relatedModule}: ${relatedName}`;
  };

  // CHECKBOX SELECTION
  const handleSelectRow = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedTaskIds((prev) => [...prev, taskId]);
    } else {
      setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(tasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  // BULK ACTIONS DISPATCH
  const handleBulkComplete = async () => {
    try {
      setImporting(true);
      await Promise.all(selectedTaskIds.map((id) => patchStatus(id, 'Completed')));
      setSelectedTaskIds([]);
      loadWorkspaceData();
    } finally {
      setImporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      try {
        setImporting(true);
        await Promise.all(selectedTaskIds.map((id) => deleteTask(id)));
        setSelectedTaskIds([]);
        loadWorkspaceData();
      } finally {
        setImporting(false);
      }
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      setImporting(true);
      await Promise.all(selectedTaskIds.map((id) => patchStatus(id, status)));
      setSelectedTaskIds([]);
      setBulkStatusModal(false);
      loadWorkspaceData();
    } finally {
      setImporting(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAssigneeId) return;
    try {
      setImporting(true);
      const emp = employees.find((e) => e.id === bulkAssigneeId);
      await Promise.all(selectedTaskIds.map((id) => patchAssign(id, bulkAssigneeId, emp?.department || null)));
      setSelectedTaskIds([]);
      setBulkAssignModal(false);
      setBulkAssigneeId('');
      loadWorkspaceData();
    } finally {
      setImporting(false);
    }
  };

  // CSV EXPORT ENGINE
  const handleExportCSV = () => {
    const headers = ['Task Number', 'Title', 'Priority', 'Status', 'Type', 'Estimated Hours', 'Actual Hours', 'Assignee', 'Due Date', 'Created Date'];
    const rows = tasks.map((t) => [
      t.taskNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.taskType,
      t.estimatedHours || 0,
      t.actualHours || 0,
      t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—',
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FlowCRM_Tasks_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV IMPORT PARSER
  const handleImportCSV = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    setImportResult(null);

    const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      setImportResult('Invalid CSV: missing headers or row rows.');
      setImporting(false);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/['"]/g, ''));
    const titleIdx = headers.findIndex((h) => h.toLowerCase() === 'title');
    const assigneeIdx = headers.findIndex((h) => h.toLowerCase() === 'assignee');
    const priorityIdx = headers.findIndex((h) => h.toLowerCase() === 'priority');
    const typeIdx = headers.findIndex((h) => h.toLowerCase() === 'type');

    if (titleIdx === -1) {
      setImportResult('CSV validation failed: "title" column is required.');
      setImporting(false);
      return;
    }

    let successCount = 0;
    let duplicateCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
      if (cols.length === 0 || !cols[titleIdx]) continue;

      const title = cols[titleIdx];
      // Simple duplicate checker in current list
      const isDuplicate = tasks.some((t) => t.title.toLowerCase() === title.toLowerCase());
      if (isDuplicate) {
        duplicateCount++;
        continue;
      }

      let assignedToId = employees[0]?.id || ''; // fallback to first assignee
      if (assigneeIdx !== -1 && cols[assigneeIdx]) {
        const matchingEmp = employees.find((e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(cols[assigneeIdx].toLowerCase())
        );
        if (matchingEmp) assignedToId = matchingEmp.id;
      }

      const priority = (priorityIdx !== -1 && cols[priorityIdx]) ? cols[priorityIdx] : 'Medium';
      const taskType = (typeIdx !== -1 && cols[typeIdx]) ? cols[typeIdx] : 'General';

      try {
        await createTask({
          title,
          assignedToId,
          priority,
          taskType,
          status: 'Pending',
        });
        successCount++;
      } catch (err) {
        console.error(err);
      }
    }

    setImportResult(`Import Completed. Imported: ${successCount} tasks. Duplicates skipped: ${duplicateCount}.`);
    setImporting(false);
    setCsvText('');
    loadWorkspaceData();
  };

  // CALENDAR HELPER MATH
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const grid = [];
    // Add empty leading days
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    // Add actual days
    for (let d = 1; d <= totalDays; d++) {
      grid.push(new Date(year, month, d));
    }
    return grid;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Filter MyTasks subsets
  const filterMyTasks = (category: 'Today' | 'Tomorrow' | 'ThisWeek' | 'Overdue' | 'Completed') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    const currentEmp = employees.find((e) => e.email === user?.email);
    const empId = currentEmp?.id;

    return tasks.filter((t) => {
      if (t.assignedToId !== empId) return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const isDone = t.status === 'Completed' || t.status === 'Cancelled';

      switch (category) {
        case 'Today':
          return due >= today && due < tomorrow && !isDone;
        case 'Tomorrow':
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
          return due >= tomorrow && due < dayAfterTomorrow && !isDone;
        case 'ThisWeek':
          return due >= today && due <= endOfWeek && !isDone;
        case 'Overdue':
          return due < today && !isDone;
        case 'Completed':
          return t.status === 'Completed';
        default:
          return false;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Breadcrumb items={[{ label: 'Productivity Hub' }]} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Enterprise Productivity Hub</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
            Enterprise workload workload checklist manager
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="rounded-xl font-bold border-slate-200 text-xs flex items-center gap-1.5"
          >
            <FileUp size={14} />
            Import CSV
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl font-bold border-slate-200 text-xs flex items-center gap-1.5"
          >
            <FileDown size={14} />
            Export CSV
          </Button>
          <Button
            onClick={() => navigate('/tasks/new')}
            className="rounded-xl flex items-center gap-1.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            <Plus size={16} />
            Create Task
          </Button>
        </div>
      </div>

      {/* Tabs list (Extended Workspace options) */}
      <div className="flex border-b border-slate-200 gap-1 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: 'Dashboard', label: 'Dashboard & Analytics', icon: LayoutGrid },
          { id: 'List', label: 'All Tasks List', icon: List },
          { id: 'Kanban', label: 'Kanban Board', icon: Grid },
          { id: 'MyTasks', label: 'My Tasks', icon: UserCheck },
          { id: 'Calendar', label: 'Monthly Calendar', icon: CalendarIcon },
          { id: 'Gantt', label: 'Gantt View (Read)', icon: Sliders },
          { id: 'Workload', label: 'Team Workload', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px leading-none shrink-0 ${
                active
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SEARCH AND FILTERS (Hidden on analytics or dashboards) */}
      {activeTab !== 'Dashboard' && activeTab !== 'Workload' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-9 pr-4 rounded-xl border-slate-200/80 focus:border-blue-400 bg-white/70"
                />
              </div>
              <Button variant="glass" type="submit" size="sm" className="rounded-xl">
                Search
              </Button>
            </form>

            <div className="flex gap-2 items-center justify-end">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl flex items-center gap-1.5 ${showFilters ? 'bg-slate-100 border-slate-300' : ''}`}
              >
                <Filter size={14} />
                Filters
              </Button>
              {activeTab === 'List' && (
                <div className="relative">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="rounded-xl flex items-center gap-1.5"
                  >
                    <Columns size={14} />
                    Columns
                  </Button>
                  {showColumnDropdown && (
                    <Card className="absolute right-0 mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-35 min-w-[160px] space-y-2 text-xs font-semibold text-slate-700">
                      {Object.keys(visibleColumns).map((col) => (
                        <label key={col} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={(visibleColumns as any)[col]}
                            onChange={() =>
                              setVisibleColumns((prev) => ({ ...prev, [col]: !(prev as any)[col] }))
                            }
                            className="rounded text-blue-600"
                          />
                          <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                      ))}
                    </Card>
                  )}
                </div>
              )}
              <Button variant="glass" size="sm" onClick={handleClearFilters} className="rounded-xl text-red-500 hover:bg-red-50">
                Clear
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">All Team</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                <Input
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  placeholder="e.g. Sales"
                  className="text-xs font-semibold bg-white"
                />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      <div className="space-y-6">
        
        {/* TAB 1: PRODUCTIVITY DASHBOARD */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top statistics overview cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Period</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">{productivityAnalytics?.completedThisWeek || 0}</span>
                <span className="text-[10px] font-bold text-emerald-600 block mt-1.5">Tasks finished</span>
              </Card>

              <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tasks Completed Today</span>
                <span className="text-3xl font-black text-blue-600 block mt-1">{productivityAnalytics?.completedToday || 0}</span>
                <span className="text-[10px] font-bold text-slate-400 block mt-1.5">Action checklists log</span>
              </Card>

              <Card className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Completion Time</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">
                  {productivityAnalytics?.averageCompletionTime || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block mt-1.5 uppercase tracking-wide">Hours</span>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow border-none">
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider block">Overall Productivity Ratio</span>
                <span className="text-3xl font-black block mt-1">{productivityAnalytics?.productivityPercentage || 0}%</span>
                <span className="text-[10px] text-blue-100/90 block mt-1.5 font-bold flex items-center gap-1">
                  <Sparkles size={10} />
                  Performance Index
                </span>
              </Card>
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Productivity */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Productivity Indices</span>
                  <TrendingUp size={16} className="text-blue-500" />
                </h3>

                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Team Productivity Rate</span>
                      <span>{productivityAnalytics?.teamProductivity || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${productivityAnalytics?.teamProductivity || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Department Capacity Ratio</span>
                      <span>{productivityAnalytics?.departmentProductivity || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${productivityAnalytics?.departmentProductivity || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Time stats */}
              <Card className="p-5 bg-white/70 border border-slate-200/60 rounded-3xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Deliverables</h3>
                  <Badge variant="glass" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-2 py-0.5 rounded-lg border text-[10px]">
                    Optimized
                  </Badge>
                </div>
                <div className="py-6 flex items-end gap-1.5">
                  <span className="text-4xl font-black text-slate-800">
                    {statistics?.completed || 0}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide pb-1.5">Completed Tasks total</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-relaxed">
                  Focus on closing overdue bottlenecks to maintain department workload standards.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: ALL TASKS LIST WITH BULK ACTIONS */}
        {activeTab === 'List' && (
          <div className="space-y-4 animate-fadeIn">
            {selectedTaskIds.length > 0 && (
              <div className="bg-blue-50 border border-blue-200/60 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-blue-800 shadow-sm">
                <span>Selected {selectedTaskIds.length} tasks for bulk actions:</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs py-1 px-3"
                    onClick={handleBulkComplete}
                  >
                    Complete
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="rounded-xl border-blue-200 text-xs py-1 px-3"
                    onClick={() => setBulkStatusModal(true)}
                  >
                    Change Status
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="rounded-xl border-blue-200 text-xs py-1 px-3"
                    onClick={() => setBulkAssignModal(true)}
                  >
                    Reassign
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 text-xs py-1 px-3"
                    onClick={handleBulkDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}

            <Card className="overflow-hidden border border-slate-200/50 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.length === tasks.length && tasks.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      {visibleColumns.taskNumber && <th className="py-3 px-4">Task No.</th>}
                      {visibleColumns.title && <th className="py-3 px-4">Title</th>}
                      {visibleColumns.assignee && <th className="py-3 px-4">Assigned User</th>}
                      {visibleColumns.relation && <th className="py-3 px-4">Related Record</th>}
                      {visibleColumns.priority && <th className="py-3 px-4">Priority</th>}
                      {visibleColumns.status && <th className="py-3 px-4">Status</th>}
                      {visibleColumns.progress && <th className="py-3 px-4">Progress</th>}
                      {visibleColumns.dueDate && <th className="py-3 px-4">Due Date</th>}
                      {visibleColumns.createdAt && <th className="py-3 px-4">Created Date</th>}
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td className="p-4" colSpan={11}>
                            <Skeleton className="h-6 w-full rounded-lg" />
                          </td>
                        </tr>
                      ))
                    ) : tasks.length > 0 ? (
                      tasks.map((task) => {
                        const isChecked = selectedTaskIds.includes(task.id);
                        return (
                          <tr
                            key={task.id}
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className={`hover:bg-white/80 transition-colors group cursor-pointer ${isChecked ? 'bg-blue-50/20' : ''}`}
                          >
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleSelectRow(task.id, e)}
                                className="rounded border-slate-300 text-blue-600"
                              />
                            </td>
                            {visibleColumns.taskNumber && (
                              <td className="py-3.5 px-4 font-bold text-slate-500 font-mono tracking-tight">
                                {task.taskNumber}
                              </td>
                            )}
                            {visibleColumns.title && (
                              <td className="py-3.5 px-4 font-bold text-slate-800 min-w-[150px] max-w-xs truncate">
                                {task.title}
                              </td>
                            )}
                            {visibleColumns.assignee && (
                              <td className="py-3.5 px-4 text-slate-600 font-semibold">
                                {task.assignedTo
                                  ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                                  : 'Unassigned'}
                              </td>
                            )}
                            {visibleColumns.relation && (
                              <td className="py-3.5 px-4 text-slate-500 font-medium">
                                {getRelationDescription(task)}
                              </td>
                            )}
                            {visibleColumns.priority && (
                              <td className="py-3.5 px-4">
                                <Badge
                                  variant="glass"
                                  className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${
                                    priorityColors[task.priority] || priorityColors.Medium
                                  }`}
                                >
                                  {task.priority}
                                </Badge>
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td className="py-3.5 px-4">
                                <Badge
                                  variant="glass"
                                  className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${
                                    statusColors[task.status] || statusColors.Pending
                                  }`}
                                >
                                  {task.status}
                                </Badge>
                              </td>
                            )}
                            {visibleColumns.progress && (
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2 max-w-[100px]">
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${task.progressPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">{task.progressPercentage}%</span>
                                </div>
                              </td>
                            )}
                            {visibleColumns.dueDate && (
                              <td className="py-3.5 px-4 text-slate-400 font-semibold font-mono">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                              </td>
                            )}
                            {visibleColumns.createdAt && (
                              <td className="py-3.5 px-4 text-slate-400 font-medium font-mono">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </td>
                            )}
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => navigate(`/tasks/${task.id}`)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                  title="Details"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={(e) => handleToggleComplete(task.id, task.status, e)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteInit(task.id, e)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-400 font-bold">
                          <p className="text-sm">No tasks matched current criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>
                    Showing page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="glass"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage(pagination.page - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPage(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 3: KANBAN BOARD */}
        {activeTab === 'Kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 select-none animate-fadeIn">
            {['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled'].map((colName) => {
              const colTasks = kanbanData[colName] || [];
              return (
                <div
                  key={colName}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, colName)}
                  className="bg-slate-50/70 border border-slate-200/50 p-3 rounded-2xl min-h-[480px] flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {colName}
                    </span>
                    <Badge variant="glass" className="bg-white text-slate-500 font-bold font-mono px-2 py-0.5 rounded-lg border border-slate-200">
                      {colTasks.length}
                    </Badge>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colTasks.length > 0 ? (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="p-4 bg-white border border-slate-200/60 hover:border-slate-350 cursor-grab active:cursor-grabbing rounded-2xl shadow-sm transition-all space-y-3"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[9px] font-bold text-slate-400 font-mono block">
                              {task.taskNumber}
                            </span>
                            <Badge variant="glass" className={`px-1.5 py-0.2 rounded-lg border text-[8px] font-bold ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </Badge>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                            {task.title}
                          </h4>

                          {/* Progress slider bar */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${task.progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{task.progressPercentage}%</span>
                          </div>

                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-50 flex justify-between items-center">
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</span>
                            <span className="truncate max-w-[80px]">
                              {task.assignedTo ? task.assignedTo.firstName : 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 py-8 border border-dashed border-slate-200 rounded-2xl bg-white/20 text-center text-slate-400">
                        <span className="text-[10px] font-bold">No tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: MY TASKS */}
        {activeTab === 'MyTasks' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fadeIn">
            {([
              { id: 'Today', label: 'Due Today', color: 'bg-red-50 text-red-700 border-red-200' },
              { id: 'Tomorrow', label: 'Due Tomorrow', color: 'bg-orange-50 text-orange-700 border-orange-200' },
              { id: 'ThisWeek', label: 'Due This Week', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { id: 'Overdue', label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-300' },
              { id: 'Completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            ] as const).map((cat) => {
              const catTasks = filterMyTasks(cat.id);
              return (
                <div key={cat.id} className="bg-slate-50/70 border border-slate-200/50 p-3 rounded-2xl flex flex-col min-h-[400px]">
                  <h3 className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-2 rounded-lg border text-center mb-3 ${cat.color}`}>
                    {cat.label} ({catTasks.length})
                  </h3>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {catTasks.length > 0 ? (
                      catTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="p-3 bg-white border border-slate-200/60 hover:border-slate-350 cursor-pointer rounded-xl shadow-sm hover:shadow transition-all space-y-1.5"
                        >
                          <span className="text-[9px] font-bold text-slate-400 font-mono block">
                            {task.taskNumber}
                          </span>
                          <h4 className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight">
                            {task.title}
                          </h4>
                          <div className="flex justify-between items-center text-[8px] font-bold uppercase text-slate-400 pt-1.5 border-t border-slate-50">
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</span>
                            <span className={`px-1.5 rounded ${priorityColors[task.priority]}`}>{task.priority}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 py-8 border border-dashed border-slate-200 rounded-xl bg-white/20 text-center text-slate-400">
                        <span className="text-[9px] font-bold">No tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: MONTHLY CALENDAR VIEW */}
        {activeTab === 'Calendar' && (
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CalendarIcon size={18} className="text-blue-500" />
                <h3 className="text-sm font-black text-slate-800 tracking-tight">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div className="flex gap-1.5">
                <Button variant="glass" size="sm" className="p-1.5 rounded-lg" onClick={handlePrevMonth}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="glass" size="sm" className="rounded-xl font-bold text-xs" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="glass" size="sm" className="p-1.5 rounded-lg" onClick={handleNextMonth}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2.5 bg-slate-50/80">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarGrid.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/20 min-h-[90px] rounded-xl border border-slate-100/10" />;

                const dayStr = day.toISOString().slice(0, 10);
                const dayTasks = calendarTasks.filter((t) => {
                  if (t.dueDate) return t.dueDate.slice(0, 10) === dayStr;
                  if (t.startDate) return t.startDate.slice(0, 10) === dayStr;
                  return false;
                });

                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <div
                    key={dayStr}
                    className={`min-h-[100px] p-2 bg-slate-50/30 border border-slate-100 hover:border-slate-300 rounded-2xl flex flex-col justify-between transition-all ${
                      isToday ? 'bg-blue-50/20 border-blue-200' : ''
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${isToday ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-slate-500'}`}>
                      {day.getDate()}
                    </span>

                    <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px]">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => navigate(`/tasks/${t.id}`)}
                          className="p-1 rounded text-[8px] font-bold truncate cursor-pointer shadow-sm border bg-white border-slate-200"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                            t.priority === 'Critical' ? 'bg-red-500' : t.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                          }`} />
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* TAB 6: SVGs GANTT TIMELINE PREVIEW */}
        {activeTab === 'Gantt' && (
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl animate-fadeIn space-y-4">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Timeline Gantt Chart (Read Only)</h3>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-4">
                {/* Headers columns duration dates */}
                <div className="grid grid-cols-12 border-b border-slate-100 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-4">Task Deliverable</div>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="text-center">Day {i + 1}</div>
                  ))}
                </div>

                <div className="divide-y divide-slate-100">
                  {tasks.slice(0, 10).map((task, idx) => {
                    const startOffset = Math.min(6, idx); // Simulate chart position
                    const durationWidth = Math.max(2, (idx % 4) + 2);

                    return (
                      <div key={task.id} className="grid grid-cols-12 py-3.5 items-center">
                        <div className="col-span-4 min-w-0 pr-4">
                          <span className="text-xs font-bold text-slate-700 block truncate">{task.title}</span>
                          <span className="text-[9px] text-slate-400 block font-mono font-bold tracking-tight">
                            {task.taskNumber} • {task.priority}
                          </span>
                        </div>
                        {/* Horizontal duration rendering bar */}
                        <div className="col-span-8 relative h-7 bg-slate-50/50 rounded-xl overflow-hidden">
                          <div
                            className="absolute h-full bg-indigo-500/80 rounded-xl flex items-center justify-center text-[8px] font-bold text-white shadow-sm border border-indigo-600/20"
                            style={{
                              left: `${(startOffset / 8) * 100}%`,
                              width: `${(durationWidth / 8) * 100}%`,
                            }}
                          >
                            {task.progressPercentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 7: TEAM WORKLOAD BOARD */}
        {activeTab === 'Workload' && (
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm rounded-3xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-blue-500" />
                <h3 className="text-sm font-black text-slate-800 tracking-tight">Team Capacity & Workload Balance</h3>
              </div>
            </div>

            <div className="space-y-5">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
              ) : workloadData.length > 0 ? (
                workloadData.map((emp) => (
                  <div key={emp.employeeId} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-[150px]">
                      <span className="text-xs font-bold text-slate-700 block">{emp.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{emp.department}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-4 gap-4 text-center">
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active</span>
                        <span className="text-sm font-bold text-slate-700 mt-0.5 block">{emp.assigned}</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Overdue</span>
                        <span className="text-sm font-bold text-red-600 mt-0.5 block">{emp.overdue}</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hrs Tracked</span>
                        <span className="text-sm font-bold text-slate-700 mt-0.5 block">{emp.workingHours} hrs</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Capacity</span>
                        <span className="text-sm font-bold text-slate-700 mt-0.5 block">{emp.capacity} hrs</span>
                      </div>
                    </div>

                    <div className="min-w-[150px] space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Utilization %</span>
                        <span>{emp.utilizationPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                        <div
                          className={`h-full rounded-full ${
                            emp.utilizationPercentage > 85 ? 'bg-orange-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${emp.utilizationPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">No workload statistics available.</p>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* CSV Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Tasks from CSV"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Format: Column headers should include <strong>title</strong>, <strong>assignee</strong>, <strong>priority</strong>, <strong>type</strong>.
          </p>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="title, assignee, priority, type&#10;Follow up with client, Masthan, High, Call"
            rows={6}
            className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          />
          {importResult && (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-750 text-[10px] font-bold">
              {importResult}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImportCSV}
              disabled={importing || !csvText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              {importing ? 'Importing...' : 'Parse & Import'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Status Change Modal */}
      <Modal
        isOpen={bulkStatusModal}
        onClose={() => setBulkStatusModal(false)}
        title="Bulk Change Tasks Status"
        size="sm"
      >
        <div className="space-y-3">
          {['Pending', 'In Progress', 'Waiting', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => handleBulkStatusUpdate(st)}
              className="w-full text-left p-3 hover:bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex justify-between items-center"
            >
              <span>{st}</span>
              <Badge variant="glass" className={`px-2 py-0.5 rounded border ${statusColors[st]}`}>
                Apply
              </Badge>
            </button>
          ))}
        </div>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={bulkAssignModal}
        onClose={() => setBulkAssignModal(false)}
        title="Bulk Assign Tasks"
        size="sm"
      >
        <div className="space-y-4">
          <select
            value={bulkAssigneeId}
            onChange={(e) => setBulkAssigneeId(e.target.value)}
            className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
          >
            <option value="">Select Assignee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setBulkAssignModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={!bulkAssigneeId}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Confirm Reassign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Single Task Confirm */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Task Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete this task? Associated comments, checklists, and time logs will be deleted.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
