import api from './api';

const TASKS_URL = '/tasks';

export interface TaskFilterParams {
  page?: number;
  limit?: number;
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
  myTasks?: boolean;
}

export const taskApi = {
  getTasks: (params?: TaskFilterParams) =>
    api.get(TASKS_URL, { params }),

  getTask: (id: string) =>
    api.get(`${TASKS_URL}/${id}`),

  createTask: (data: any) =>
    api.post(TASKS_URL, data),

  updateTask: (id: string, data: any) =>
    api.put(`${TASKS_URL}/${id}`, data),

  deleteTask: (id: string) =>
    api.delete(`${TASKS_URL}/${id}`),

  patchStatus: (taskId: string, status: string, completedDate?: string | null) =>
    api.patch(`${TASKS_URL}/status`, { taskId, status, completedDate }),

  patchProgress: (taskId: string, progressPercentage: number) =>
    api.patch(`${TASKS_URL}/progress`, { taskId, progressPercentage }),

  patchAssign: (taskId: string, assignedToId: string, department?: string | null) =>
    api.patch(`${TASKS_URL}/assign`, { taskId, assignedToId, department }),

  getStatistics: (params?: { myTasks?: boolean }) =>
    api.get(`${TASKS_URL}/statistics`, { params }),

  addComment: (taskId: string, content: string) =>
    api.post(`${TASKS_URL}/${taskId}/comments`, { content }),

  deleteComment: (taskId: string, commentId: string) =>
    api.delete(`${TASKS_URL}/${taskId}/comments/${commentId}`),

  uploadAttachment: (taskId: string, formData: FormData) =>
    api.post(`${TASKS_URL}/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteAttachment: (taskId: string, attachmentId: string) =>
    api.delete(`${TASKS_URL}/${taskId}/attachments/${attachmentId}`),
};

export default taskApi;
