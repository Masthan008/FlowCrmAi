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

  // --- EXTENSIONS FOR PROMPT 20 ---

  getCalendar: (start: string, end: string) =>
    api.get(`${TASKS_URL}/calendar`, { params: { start, end } }),

  getWorkload: () =>
    api.get(`${TASKS_URL}/workload`),

  getProductivity: (timeframe: string) =>
    api.get(`${TASKS_URL}/productivity`, { params: { timeframe } }),

  getTimeline: (taskId: string) =>
    api.get(`${TASKS_URL}/${taskId}/timeline`),

  getSubtasks: (taskId: string) =>
    api.get(`${TASKS_URL}/${taskId}/subtasks`),

  addSubtask: (taskId: string, data: any) =>
    api.post(`${TASKS_URL}/${taskId}/subtasks`, data),

  updateSubtask: (taskId: string, subtaskId: string, data: any) =>
    api.put(`${TASKS_URL}/${taskId}/subtasks/${subtaskId}`, data),

  deleteSubtask: (taskId: string, subtaskId: string) =>
    api.delete(`${TASKS_URL}/${taskId}/subtasks/${subtaskId}`),

  addChecklistItem: (taskId: string, title: string, order: number) =>
    api.post(`${TASKS_URL}/${taskId}/checklists`, { title, order }),

  updateChecklistItem: (taskId: string, itemId: string, data: any) =>
    api.put(`${TASKS_URL}/${taskId}/checklists/${itemId}`, data),

  deleteChecklistItem: (taskId: string, itemId: string) =>
    api.delete(`${TASKS_URL}/${taskId}/checklists/${itemId}`),

  getTimeLogs: (taskId: string) =>
    api.get(`${TASKS_URL}/${taskId}/time`),

  addTimeLog: (taskId: string, data: any) =>
    api.post(`${TASKS_URL}/${taskId}/time`, data),

  deleteTimeLog: (taskId: string, logId: string) =>
    api.delete(`${TASKS_URL}/${taskId}/time/${logId}`),

  addWatcher: (taskId: string, employeeId: string) =>
    api.post(`${TASKS_URL}/${taskId}/watchers`, { employeeId }),

  removeWatcher: (taskId: string, employeeId: string) =>
    api.delete(`${TASKS_URL}/${taskId}/watchers/${employeeId}`),

  addDependency: (taskId: string, dependentTaskId: string, type: string) =>
    api.post(`${TASKS_URL}/${taskId}/dependencies`, { dependentTaskId, type }),

  removeDependency: (taskId: string, dependentTaskId: string, type: string) =>
    api.delete(`${TASKS_URL}/${taskId}/dependencies/${dependentTaskId}/${type}`),

  upsertRecurrence: (taskId: string, data: any) =>
    api.post(`${TASKS_URL}/${taskId}/recurrence`, data),

  requestApproval: (taskId: string, approverId: string) =>
    api.post(`${TASKS_URL}/${taskId}/approve/request`, { approverId }),

  approveTask: (taskId: string, comments?: string | null) =>
    api.patch(`${TASKS_URL}/${taskId}/approve`, { comments }),

  rejectTask: (taskId: string, comments?: string | null) =>
    api.patch(`${TASKS_URL}/${taskId}/reject`, { comments }),
};

export default taskApi;
