import { create } from 'zustand';
import { taskApi } from '../services/taskApi';

export interface TaskFilters {
  search?: string;
  priority?: string;
  status?: string;
  assignedToId?: string;
  department?: string;
  taskType?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface TaskPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface TaskState {
  // Data
  tasks: any[];
  currentTask: any | null;
  statistics: any | null;
  kanbanData: Record<string, any[]>;
  
  // Extensions Data
  calendarTasks: any[];
  workloadData: any[];
  productivityAnalytics: any | null;
  timelineLogs: any[];

  // UI State
  loading: boolean;
  taskLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: TaskPagination;

  // Actions
  fetchTasks: (options?: { myTasks?: boolean }) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: any) => Promise<any>;
  updateTask: (id: string, data: any) => Promise<any>;
  deleteTask: (id: string) => Promise<void>;
  patchStatus: (id: string, status: string) => Promise<void>;
  patchProgress: (id: string, progressPercentage: number) => Promise<void>;
  patchAssign: (id: string, assignedToId: string, department?: string | null) => Promise<void>;
  fetchStatistics: (options?: { myTasks?: boolean }) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setPage: (page: number) => void;
  clearCurrentTask: () => void;
  clearError: () => void;

  // Comments
  addComment: (taskId: string, content: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;

  // Attachments
  uploadAttachment: (taskId: string, formData: FormData) => Promise<void>;
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;

  // --- EXTENSIONS FOR PROMPT 20 ---
  fetchCalendar: (start: string, end: string) => Promise<void>;
  fetchWorkload: () => Promise<void>;
  fetchProductivity: (timeframe?: string) => Promise<void>;
  fetchTimeline: (taskId: string) => Promise<void>;

  addSubtask: (taskId: string, data: any) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, data: any) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  addChecklistItem: (taskId: string, title: string, order: number) => Promise<void>;
  updateChecklistItem: (taskId: string, itemId: string, data: any) => Promise<void>;
  deleteChecklistItem: (taskId: string, itemId: string) => Promise<void>;

  addTimeLog: (taskId: string, data: any) => Promise<void>;
  deleteTimeLog: (taskId: string, logId: string) => Promise<void>;

  addWatcher: (taskId: string, employeeId: string) => Promise<void>;
  removeWatcher: (taskId: string, employeeId: string) => Promise<void>;

  addDependency: (taskId: string, dependentTaskId: string, type: string) => Promise<void>;
  removeDependency: (taskId: string, dependentTaskId: string, type: string) => Promise<void>;

  upsertRecurrence: (taskId: string, data: any) => Promise<void>;

  requestApproval: (taskId: string, approverId: string) => Promise<void>;
  approveTask: (taskId: string, comments?: string | null) => Promise<void>;
  rejectTask: (taskId: string, comments?: string | null) => Promise<void>;
}

const initialFilters: TaskFilters = {
  search: '',
  priority: '',
  status: '',
  assignedToId: '',
  department: '',
  taskType: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
};

const initialPagination: TaskPagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 0,
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  statistics: null,
  kanbanData: {
    'Pending': [],
    'In Progress': [],
    'Waiting': [],
    'Completed': [],
    'Cancelled': [],
  },
  calendarTasks: [],
  workloadData: [],
  productivityAnalytics: null,
  timelineLogs: [],

  loading: false,
  taskLoading: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  fetchTasks: async (options) => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        myTasks: options?.myTasks,
      };

      const res = await taskApi.getTasks(params);
      const items = res.data.data.data || [];
      const pag = res.data.data.pagination || get().pagination;

      // Group for Kanban View
      const kanban: Record<string, any[]> = {
        'Pending': [],
        'In Progress': [],
        'Waiting': [],
        'Completed': [],
        'Cancelled': [],
      };

      items.forEach((item: any) => {
        const currentStatus = item.status;
        if (kanban[currentStatus]) {
          kanban[currentStatus].push(item);
        } else if (currentStatus === 'Overdue' || currentStatus === 'Pending Approval') {
          kanban['Pending'].push(item);
        }
      });

      set({
        tasks: items,
        kanbanData: kanban,
        pagination: { ...pag },
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch tasks list.',
        loading: false,
      });
    }
  },

  fetchTask: async (id: string) => {
    set({ taskLoading: true, error: null });
    try {
      const res = await taskApi.getTask(id);
      set({ currentTask: res.data.data, taskLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch task details.',
        taskLoading: false,
      });
    }
  },

  createTask: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const res = await taskApi.createTask(data);
      set({ loading: false });
      return res.data.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to create task.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  updateTask: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const res = await taskApi.updateTask(id, data);
      set({ currentTask: res.data.data, loading: false });
      return res.data.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update task.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await taskApi.deleteTask(id);
      set({ loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to delete task.',
        loading: false,
      });
      throw err;
    }
  },

  patchStatus: async (id: string, status: string) => {
    try {
      await taskApi.patchStatus(id, status);
      const { currentTask } = get();
      if (currentTask && currentTask.id === id) {
        get().fetchTask(id);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update task status.' });
      throw err;
    }
  },

  patchProgress: async (id: string, progressPercentage: number) => {
    try {
      await taskApi.patchProgress(id, progressPercentage);
      const { currentTask } = get();
      if (currentTask && currentTask.id === id) {
        get().fetchTask(id);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update task progress.' });
      throw err;
    }
  },

  patchAssign: async (id: string, assignedToId: string, department?: string | null) => {
    try {
      await taskApi.patchAssign(id, assignedToId, department);
      const { currentTask } = get();
      if (currentTask && currentTask.id === id) {
        get().fetchTask(id);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to assign task.' });
      throw err;
    }
  },

  fetchStatistics: async (options) => {
    try {
      const res = await taskApi.getStatistics(options);
      set({ statistics: res.data.data });
    } catch {
      // Silently fail
    }
  },

  setFilters: (filters: Partial<TaskFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  clearCurrentTask: () => set({ currentTask: null }),
  clearError: () => set({ error: null }),

  // Comments
  addComment: async (taskId: string, content: string) => {
    try {
      await taskApi.addComment(taskId, content);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to post comment.' });
      throw err;
    }
  },

  deleteComment: async (taskId: string, commentId: string) => {
    try {
      await taskApi.deleteComment(taskId, commentId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete comment.' });
      throw err;
    }
  },

  // Attachments
  uploadAttachment: async (taskId: string, formData: FormData) => {
    try {
      await taskApi.uploadAttachment(taskId, formData);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to upload attachment.' });
      throw err;
    }
  },

  deleteAttachment: async (taskId: string, attachmentId: string) => {
    try {
      await taskApi.deleteAttachment(taskId, attachmentId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete attachment.' });
      throw err;
    }
  },

  // --- EXTENSIONS FOR PROMPT 20 ---
  fetchCalendar: async (start, end) => {
    try {
      const res = await taskApi.getCalendar(start, end);
      set({ calendarTasks: res.data.data || [] });
    } catch {
      // Silently fail
    }
  },

  fetchWorkload: async () => {
    try {
      const res = await taskApi.getWorkload();
      set({ workloadData: res.data.data || [] });
    } catch {
      // Silently fail
    }
  },

  fetchProductivity: async (timeframe = 'week') => {
    try {
      const res = await taskApi.getProductivity(timeframe);
      set({ productivityAnalytics: res.data.data });
    } catch {
      // Silently fail
    }
  },

  fetchTimeline: async (taskId) => {
    try {
      const res = await taskApi.getTimeline(taskId);
      set({ timelineLogs: res.data.data || [] });
    } catch {
      // Silently fail
    }
  },

  addSubtask: async (taskId, data) => {
    try {
      await taskApi.addSubtask(taskId, data);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create subtask.' });
      throw err;
    }
  },

  updateSubtask: async (taskId, subtaskId, data) => {
    try {
      await taskApi.updateSubtask(taskId, subtaskId, data);
      get().fetchTask(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update subtask.' });
      throw err;
    }
  },

  deleteSubtask: async (taskId, subtaskId) => {
    try {
      await taskApi.deleteSubtask(taskId, subtaskId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete subtask.' });
      throw err;
    }
  },

  addChecklistItem: async (taskId, title, order) => {
    try {
      await taskApi.addChecklistItem(taskId, title, order);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add checklist item.' });
      throw err;
    }
  },

  updateChecklistItem: async (taskId, itemId, data) => {
    try {
      await taskApi.updateChecklistItem(taskId, itemId, data);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update checklist item.' });
      throw err;
    }
  },

  deleteChecklistItem: async (taskId, itemId) => {
    try {
      await taskApi.deleteChecklistItem(taskId, itemId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete checklist item.' });
      throw err;
    }
  },

  addTimeLog: async (taskId, data) => {
    try {
      await taskApi.addTimeLog(taskId, data);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to log time.' });
      throw err;
    }
  },

  deleteTimeLog: async (taskId, logId) => {
    try {
      await taskApi.deleteTimeLog(taskId, logId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete time log.' });
      throw err;
    }
  },

  addWatcher: async (taskId, employeeId) => {
    try {
      await taskApi.addWatcher(taskId, employeeId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to follow task.' });
      throw err;
    }
  },

  removeWatcher: async (taskId, employeeId) => {
    try {
      await taskApi.removeWatcher(taskId, employeeId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to unfollow task.' });
      throw err;
    }
  },

  addDependency: async (taskId, dependentTaskId, type) => {
    try {
      await taskApi.addDependency(taskId, dependentTaskId, type);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to link dependency.' });
      throw err;
    }
  },

  removeDependency: async (taskId, dependentTaskId, type) => {
    try {
      await taskApi.removeDependency(taskId, dependentTaskId, type);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to remove dependency.' });
      throw err;
    }
  },

  upsertRecurrence: async (taskId, data) => {
    try {
      await taskApi.upsertRecurrence(taskId, data);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to set recurrence.' });
      throw err;
    }
  },

  requestApproval: async (taskId, approverId) => {
    try {
      await taskApi.requestApproval(taskId, approverId);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to request approval.' });
      throw err;
    }
  },

  approveTask: async (taskId, comments) => {
    try {
      await taskApi.approveTask(taskId, comments);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to approve task.' });
      throw err;
    }
  },

  rejectTask: async (taskId, comments) => {
    try {
      await taskApi.rejectTask(taskId, comments);
      get().fetchTask(taskId);
      get().fetchTimeline(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to reject task.' });
      throw err;
    }
  },
}));

export default useTaskStore;
