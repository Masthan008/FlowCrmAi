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

      // Query all tasks for Kanban view if limit is small, but standard boards want all active ones:
      // In this setup, we group current paginated lists or group them directly
      items.forEach((item: any) => {
        const currentStatus = item.status; // e.g., 'Pending', 'In Progress', etc.
        if (kanban[currentStatus]) {
          kanban[currentStatus].push(item);
        } else if (currentStatus === 'Overdue') {
          // Put Overdue in Pending column for simplicity or treat separately
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
      // Synchronize details if loaded
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
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to post comment.' });
      throw err;
    }
  },

  deleteComment: async (taskId: string, commentId: string) => {
    try {
      await taskApi.deleteComment(taskId, commentId);
      get().fetchTask(taskId);
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
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to upload attachment.' });
      throw err;
    }
  },

  deleteAttachment: async (taskId: string, attachmentId: string) => {
    try {
      await taskApi.deleteAttachment(taskId, attachmentId);
      get().fetchTask(taskId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete attachment.' });
      throw err;
    }
  },
}));

export default useTaskStore;
