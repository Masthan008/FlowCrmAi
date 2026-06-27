import { prisma } from '../../database/db';
import { taskRepository } from '../repository/task.repository';
import type { Prisma } from '@prisma/client';

export class TaskService {
  /**
   * Sync relatedModule & relatedRecordId to explicit DB relational columns
   */
  private syncRelationFields(data: any) {
    const result = { ...data };
    
    // Clear relations first
    result.leadId = null;
    result.contactId = null;
    result.companyId = null;
    result.dealId = null;
    result.customerId = null;

    if (data.relatedModule && data.relatedRecordId) {
      const moduleName = String(data.relatedModule).toLowerCase();
      const recordId = data.relatedRecordId;

      if (moduleName === 'leads' || moduleName === 'lead') {
        result.leadId = recordId;
      } else if (moduleName === 'contacts' || moduleName === 'contact') {
        result.contactId = recordId;
      } else if (moduleName === 'companies' || moduleName === 'company') {
        result.companyId = recordId;
      } else if (moduleName === 'deals' || moduleName === 'deal') {
        result.dealId = recordId;
      } else if (moduleName === 'customers' || moduleName === 'customer') {
        result.customerId = recordId;
      }
    }
    return result;
  }

  /**
   * List tasks with advanced searching, sorting, pagination, and filters
   */
  async getTasks(params: {
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
    myTasksOnlyUserId?: string; // If passed, filters only tasks assigned to this user
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = { deletedAt: null };

    // My Tasks Filter (for logged-in user)
    if (params.myTasksOnlyUserId) {
      where.assignedToId = params.myTasksOnlyUserId;
    } else if (params.assignedToId) {
      where.assignedToId = params.assignedToId;
    }

    if (params.priority) {
      where.priority = params.priority;
    }

    if (params.status) {
      if (params.status === 'Overdue') {
        where.status = { notIn: ['Completed', 'Cancelled'] };
        where.dueDate = { lt: new Date() };
      } else {
        where.status = params.status;
      }
    }

    if (params.department) {
      where.department = { contains: params.department, mode: 'insensitive' };
    }

    if (params.taskType) {
      where.taskType = params.taskType;
    }

    // Due Date Range
    if (params.dueDateStart || params.dueDateEnd) {
      where.dueDate = {};
      if (params.dueDateStart) {
        where.dueDate.gte = new Date(params.dueDateStart);
      }
      if (params.dueDateEnd) {
        where.dueDate.lte = new Date(params.dueDateEnd);
      }
    }

    // Search query
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      where.OR = [
        { taskNumber: { contains: params.search, mode: 'insensitive' } },
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { department: { contains: params.search, mode: 'insensitive' } },
        { tags: { hasSome: [params.search] } },
        { assignedTo: { firstName: { contains: params.search, mode: 'insensitive' } } },
        { assignedTo: { lastName: { contains: params.search, mode: 'insensitive' } } },
        { lead: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { contact: { firstName: { contains: params.search, mode: 'insensitive' } } },
        { contact: { lastName: { contains: params.search, mode: 'insensitive' } } },
        { company: { name: { contains: params.search, mode: 'insensitive' } } },
        { deal: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    // Sorting
    let orderBy: Prisma.TaskOrderByWithRelationInput = { createdAt: 'desc' };
    if (params.sortBy) {
      const dir = params.sortDir || 'asc';
      if (params.sortBy === 'assignedUser') {
        orderBy = { assignedTo: { firstName: dir } };
      } else {
        orderBy = { [params.sortBy]: dir };
      }
    }

    const [items, total] = await Promise.all([
      taskRepository.findMany({ skip, take: limit, where, orderBy }),
      taskRepository.count(where),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single task details
   */
  async getTask(id: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task record not found.');
    }
    return task;
  }

  /**
   * Create a new task
   */
  async createTask(data: any, author: string) {
    const dataWithRelations = this.syncRelationFields(data);
    
    // Automatically set status to Overdue if due date is in the past
    if (dataWithRelations.dueDate && new Date(dataWithRelations.dueDate) < new Date() && dataWithRelations.status !== 'Completed') {
      dataWithRelations.status = 'Overdue';
    }

    return taskRepository.create({
      ...dataWithRelations,
      createdBy: author,
    });
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: any, author: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task record not found.');
    }
    const dataWithRelations = this.syncRelationFields(data);
    
    // Automatically set status to Overdue if due date is in the past
    if (dataWithRelations.dueDate && new Date(dataWithRelations.dueDate) < new Date() && dataWithRelations.status !== 'Completed') {
      dataWithRelations.status = 'Overdue';
    }

    return taskRepository.update(id, {
      ...dataWithRelations,
      updatedBy: author,
      version: task.version + 1,
    });
  }

  /**
   * Delete task
   */
  async deleteTask(id: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task record not found.');
    }
    return taskRepository.delete(id);
  }

  /**
   * Patch task status
   */
  async patchStatus(id: string, status: string, author: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task record not found.');
    }
    const updateData: any = { status, updatedBy: author, version: task.version + 1 };
    
    if (status === 'Completed') {
      updateData.completedDate = new Date();
      updateData.progressPercentage = 100;
    } else if (status === 'Pending' || status === 'In Progress') {
      updateData.completedDate = null;
    }

    return taskRepository.update(id, updateData);
  }

  /**
   * Patch task progress percentage
   */
  async patchProgress(id: string, progressPercentage: number, author: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task record not found.');
    }
    const updateData: any = { progressPercentage, updatedBy: author, version: task.version + 1 };
    
    if (progressPercentage === 100) {
      updateData.status = 'Completed';
      updateData.completedDate = new Date();
    } else if (progressPercentage < 100 && task.status === 'Completed') {
      updateData.status = 'In Progress';
      updateData.completedDate = null;
    }

    return taskRepository.update(id, updateData);
  }

  /**
   * Patch task assignee
   */
  async patchAssign(id: string, assignedToId: string, department: string | null, author: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task record not found.');
    }
    return taskRepository.update(id, {
      assignedToId,
      department,
      updatedBy: author,
      version: task.version + 1,
    });
  }

  /**
   * Fetch task statistics metrics
   */
  async getStatistics(myTasksOnlyUserId?: string) {
    const baseWhere: Prisma.TaskWhereInput = { deletedAt: null };
    if (myTasksOnlyUserId) {
      baseWhere.assignedToId = myTasksOnlyUserId;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Queries
    const [
      total,
      pending,
      inProgress,
      waiting,
      completed,
      cancelled,
      overdue,
      critical,
      todayTasks,
      completedTasksList,
    ] = await Promise.all([
      taskRepository.count(baseWhere),
      taskRepository.count({ ...baseWhere, status: 'Pending' }),
      taskRepository.count({ ...baseWhere, status: 'In Progress' }),
      taskRepository.count({ ...baseWhere, status: 'Waiting' }),
      taskRepository.count({ ...baseWhere, status: 'Completed' }),
      taskRepository.count({ ...baseWhere, status: 'Cancelled' }),
      // Overdue is either status === Overdue OR status is not Completed/Cancelled and due date is past
      taskRepository.count({
        ...baseWhere,
        OR: [
          { status: 'Overdue' },
          {
            status: { notIn: ['Completed', 'Cancelled'] },
            dueDate: { lt: now },
          },
        ],
      }),
      // Critical is priority === Critical and not completed
      taskRepository.count({
        ...baseWhere,
        priority: 'Critical',
        status: { notIn: ['Completed', 'Cancelled'] },
      }),
      // Today's tasks are due today
      taskRepository.count({
        ...baseWhere,
        dueDate: { gte: todayStart, lte: todayEnd },
      }),
      // For average completion time
      prisma.task.findMany({
        where: {
          ...baseWhere,
          status: 'Completed',
          completedDate: { not: null },
        },
        select: {
          createdAt: true,
          completedDate: true,
        },
      }),
    ]);

    // Average Completion Time Calculation (in hours)
    let avgCompletionTimeHours = 0;
    if (completedTasksList.length > 0) {
      const totalMs = completedTasksList.reduce((sum, task) => {
        const createTime = new Date(task.createdAt).getTime();
        const doneTime = new Date(task.completedDate!).getTime();
        return sum + Math.max(0, doneTime - createTime);
      }, 0);
      const totalHours = totalMs / (1000 * 60 * 60);
      avgCompletionTimeHours = parseFloat((totalHours / completedTasksList.length).toFixed(1));
    }

    const completionRate = total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0;

    return {
      totalTasks: total,
      pending,
      inProgress,
      waiting,
      completed,
      cancelled,
      overdue,
      critical,
      todayTasks,
      completionRate,
      averageCompletionTime: avgCompletionTimeHours,
    };
  }

  /**
   * Comments
   */
  async addComment(taskId: string, content: string, createdBy: string) {
    return taskRepository.createComment(taskId, content, createdBy);
  }

  async updateComment(commentId: string, content: string, updatedBy: string) {
    return taskRepository.updateComment(commentId, content, updatedBy);
  }

  async deleteComment(commentId: string) {
    return taskRepository.deleteComment(commentId);
  }

  /**
   * Attachments
   */
  async addAttachment(params: {
    taskId: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    createdBy: string;
  }) {
    return taskRepository.createAttachment(params);
  }

  async deleteAttachment(attachmentId: string) {
    return taskRepository.deleteAttachment(attachmentId);
  }
}

export const taskService = new TaskService();
