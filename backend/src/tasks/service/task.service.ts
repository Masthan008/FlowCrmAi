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

  /**
   * Subtasks
   */
  async addSubtask(taskId: string, data: any, author: string) {
    const subtask = await taskRepository.createSubtask({
      ...data,
      taskId,
      createdBy: author,
    });
    await taskRepository.createTimelineLog(taskId, 'Checklist Updated', `Subtask "${data.title}" added`, author);
    return subtask;
  }

  async updateSubtask(subtaskId: string, data: any, author: string) {
    const subtask = await taskRepository.updateSubtask(subtaskId, {
      ...data,
      updatedBy: author,
    });
    return subtask;
  }

  async deleteSubtask(subtaskId: string, taskId: string, author: string) {
    await taskRepository.deleteSubtask(subtaskId);
    await taskRepository.createTimelineLog(taskId, 'Checklist Updated', 'Subtask removed', author);
  }

  /**
   * Checklists
   */
  async addChecklistItem(taskId: string, title: string, order: number, author: string) {
    const item = await taskRepository.createChecklistItem({
      taskId,
      title,
      order,
      createdBy: author,
    });
    await taskRepository.createTimelineLog(taskId, 'Checklist Updated', `Checklist item "${title}" created`, author);
    return item;
  }

  async updateChecklistItem(itemId: string, data: any, taskId: string, author: string) {
    const item = await taskRepository.updateChecklistItem(itemId, {
      ...data,
      updatedBy: author,
    });
    await taskRepository.createTimelineLog(taskId, 'Checklist Updated', `Checklist item status updated`, author);
    return item;
  }

  async deleteChecklistItem(itemId: string, taskId: string, author: string) {
    await taskRepository.deleteChecklistItem(itemId);
    await taskRepository.createTimelineLog(taskId, 'Checklist Updated', 'Checklist item removed', author);
  }

  /**
   * Time Tracking / Logs
   */
  async addTimeLog(taskId: string, data: any, author: string, employeeId: string) {
    const duration = data.duration || 0;
    const log = await taskRepository.createTimeLog({
      ...data,
      taskId,
      employeeId,
      createdBy: author,
    });

    // Update actual hours on parent Task
    const task = await taskRepository.findById(taskId);
    if (task) {
      const allLogs = await prisma.taskTimeLog.findMany({
        where: { taskId, deletedAt: null },
      });
      const totalSecs = allLogs.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
      const actualHrs = parseFloat((totalSecs / 3600).toFixed(2));
      await taskRepository.update(taskId, {
        actualHours: actualHrs,
        version: task.version + 1,
      });
    }

    await taskRepository.createTimelineLog(taskId, 'Edited', `Logged ${parseFloat((duration / 3600).toFixed(2))} hours of effort`, author);
    return log;
  }

  async deleteTimeLog(logId: string, taskId: string, author: string) {
    await taskRepository.deleteTimeLog(logId);

    // Update actual hours on parent Task
    const task = await taskRepository.findById(taskId);
    if (task) {
      const allLogs = await prisma.taskTimeLog.findMany({
        where: { taskId, deletedAt: null },
      });
      const totalSecs = allLogs.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
      const actualHrs = parseFloat((totalSecs / 3600).toFixed(2));
      await taskRepository.update(taskId, {
        actualHours: actualHrs,
        version: task.version + 1,
      });
    }

    await taskRepository.createTimelineLog(taskId, 'Edited', 'Deleted time entry log', author);
  }

  /**
   * Watchers
   */
  async addWatcher(taskId: string, employeeId: string, author: string) {
    await taskRepository.addWatcher(taskId, employeeId);
    await taskRepository.createTimelineLog(taskId, 'Edited', 'Added follower watcher', author);
  }

  async removeWatcher(taskId: string, employeeId: string, author: string) {
    await taskRepository.removeWatcher(taskId, employeeId);
    await taskRepository.createTimelineLog(taskId, 'Edited', 'Removed follower watcher', author);
  }

  /**
   * Dependencies
   */
  async addDependency(taskId: string, dependentTaskId: string, type: string, author: string) {
    await taskRepository.addDependency(taskId, dependentTaskId, type);
    await taskRepository.createTimelineLog(taskId, 'Edited', `Linked dependency: ${type}`, author);
  }

  async removeDependency(taskId: string, dependentTaskId: string, type: string, author: string) {
    await taskRepository.removeDependency(taskId, dependentTaskId, type);
    await taskRepository.createTimelineLog(taskId, 'Edited', 'Removed dependency linkage', author);
  }

  /**
   * Recurrence
   */
  async upsertRecurrence(taskId: string, data: any, author: string) {
    const recurrence = await taskRepository.upsertRecurrence(taskId, {
      ...data,
      updatedBy: author,
    });
    await taskRepository.createTimelineLog(taskId, 'Edited', `Set recurrence schedule to ${data.frequency}`, author);
    return recurrence;
  }

  async handleTaskRecurrence(taskId: string, author: string) {
    const recurrence = await prisma.taskRecurrence.findUnique({ where: { taskId } });
    if (!recurrence || (recurrence.endDate && new Date(recurrence.endDate) < new Date())) {
      return;
    }
    const now = new Date();
    let nextDate = new Date();
    const interval = recurrence.interval || 1;

    if (recurrence.frequency === 'Daily') {
      nextDate.setDate(now.getDate() + interval);
    } else if (recurrence.frequency === 'Weekly') {
      nextDate.setDate(now.getDate() + 7 * interval);
    } else if (recurrence.frequency === 'Monthly') {
      nextDate.setMonth(now.getMonth() + interval);
    } else if (recurrence.frequency === 'Yearly') {
      nextDate.setFullYear(now.getFullYear() + interval);
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task) {
      const nextTaskNumber = await taskRepository.getNextTaskNumber();
      await prisma.task.create({
        data: {
          taskNumber: nextTaskNumber,
          title: task.title + ' (Recurring)',
          description: task.description,
          priority: task.priority,
          status: 'Pending',
          taskType: task.taskType,
          relatedModule: task.relatedModule,
          relatedRecordId: task.relatedRecordId,
          leadId: task.leadId,
          contactId: task.contactId,
          companyId: task.companyId,
          dealId: task.dealId,
          customerId: task.customerId,
          assignedToId: task.assignedToId,
          assignedById: task.assignedById,
          department: task.department,
          estimatedHours: task.estimatedHours,
          startDate: nextDate,
          dueDate: task.dueDate ? new Date(nextDate.getTime() + (new Date(task.dueDate).getTime() - new Date(task.startDate || task.createdAt).getTime())) : null,
          createdBy: author,
        },
      });

      await prisma.taskRecurrence.update({
        where: { taskId },
        data: { nextRunDate: nextDate },
      });
    }
  }

  /**
   * Approvals
   */
  async requestApproval(taskId: string, approverId: string, author: string) {
    const approval = await taskRepository.upsertApproval(taskId, approverId);
    await taskRepository.update(taskId, { status: 'Pending Approval' });
    await taskRepository.createTimelineLog(taskId, 'Edited', 'Submitted task for approval', author);
    return approval;
  }

  async approveTask(taskId: string, comments: string | null, author: string) {
    const approval = await prisma.taskApproval.findUnique({ where: { taskId } });
    if (!approval) throw new Error('No approval request found for this task.');

    await taskRepository.updateApproval(approval.id, {
      status: 'Approved',
      comments,
      approvalDate: new Date(),
      updatedBy: author,
    });

    await taskRepository.update(taskId, { status: 'Completed', completedDate: new Date() });
    await taskRepository.createTimelineLog(taskId, 'Approved', `Task approved. Review comments: ${comments || 'None'}`, author);
    
    // Process recurrence if active
    await this.handleTaskRecurrence(taskId, author);
  }

  async rejectTask(taskId: string, comments: string | null, author: string) {
    const approval = await prisma.taskApproval.findUnique({ where: { taskId } });
    if (!approval) throw new Error('No approval request found for this task.');

    await taskRepository.updateApproval(approval.id, {
      status: 'Rejected',
      comments,
      approvalDate: new Date(),
      updatedBy: author,
    });

    await taskRepository.update(taskId, { status: 'Waiting' });
    await taskRepository.createTimelineLog(taskId, 'Edited', `Task approval rejected: ${comments || 'No explanation'}`, author);
  }

  /**
   * Custom Productivity/Workload endpoints
   */
  async getCalendar(startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    return prisma.task.findMany({
      where: {
        deletedAt: null,
        OR: [
          { startDate: { gte: start, lte: end } },
          { dueDate: { gte: start, lte: end } },
        ],
      },
      select: {
        id: true,
        taskNumber: true,
        title: true,
        status: true,
        priority: true,
        startDate: true,
        dueDate: true,
      },
    });
  }

  async getWorkload() {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
      },
    });

    const workloadList = [];
    for (const emp of employees) {
      const [assigned, completed, pending, overdue, timeLogs] = await Promise.all([
        prisma.task.count({ where: { assignedToId: emp.id, status: { notIn: ['Completed', 'Cancelled'] }, deletedAt: null } }),
        prisma.task.count({ where: { assignedToId: emp.id, status: 'Completed', deletedAt: null } }),
        prisma.task.count({ where: { assignedToId: emp.id, status: 'Pending', deletedAt: null } }),
        prisma.task.count({ where: { assignedToId: emp.id, status: 'Overdue', deletedAt: null } }),
        prisma.taskTimeLog.aggregate({
          _sum: { duration: true },
          where: { employeeId: emp.id, deletedAt: null },
        }),
      ]);

      const durationSecs = timeLogs._sum.duration || 0;
      const loggedHours = parseFloat((durationSecs / 3600).toFixed(2));
      const capacity = 40.0; // weekly hours
      const utilization = capacity > 0 ? Math.min(100, Math.round((loggedHours / capacity) * 100)) : 0;

      workloadList.push({
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department || 'Sales',
        assigned,
        completed,
        pending,
        overdue,
        workingHours: loggedHours,
        capacity,
        utilizationPercentage: utilization,
      });
    }

    return workloadList;
  }

  async getProductivity(timeframe: string = 'week') {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let rangeStart = new Date();
    if (timeframe === 'today') rangeStart = todayStart;
    else if (timeframe === 'week') rangeStart.setDate(now.getDate() - 7);
    else rangeStart.setMonth(now.getMonth() - 1);

    const [
      completedToday,
      completedPeriod,
      pending,
      overdue,
      allCompleted,
    ] = await Promise.all([
      prisma.task.count({ where: { status: 'Completed', completedDate: { gte: todayStart }, deletedAt: null } }),
      prisma.task.count({ where: { status: 'Completed', completedDate: { gte: rangeStart }, deletedAt: null } }),
      prisma.task.count({ where: { status: 'Pending', deletedAt: null } }),
      prisma.task.count({ where: { status: 'Overdue', deletedAt: null } }),
      prisma.task.findMany({
        where: { status: 'Completed', completedDate: { not: null }, deletedAt: null },
        select: { createdAt: true, completedDate: true },
      }),
    ]);

    // Average duration math
    let avgCompletionHrs = 0;
    if (allCompleted.length > 0) {
      const sumMs = allCompleted.reduce((acc, t) => {
        return acc + Math.max(0, new Date(t.completedDate!).getTime() - new Date(t.createdAt).getTime());
      }, 0);
      avgCompletionHrs = parseFloat((sumMs / (allCompleted.length * 3600000)).toFixed(1));
    }

    const totalActive = pending + overdue;
    const productivityPercentage = totalActive > 0 ? Math.round((completedPeriod / (completedPeriod + totalActive)) * 100) : 100;

    return {
      completedToday,
      completedThisWeek: completedPeriod,
      pending,
      overdue,
      averageCompletionTime: avgCompletionHrs,
      productivityPercentage,
      teamProductivity: Math.round(productivityPercentage * 0.95), // simulate indices offsets
      departmentProductivity: Math.round(productivityPercentage * 0.92),
    };
  }

  async getTimeline(taskId: string) {
    return prisma.taskTimeline.findMany({
      where: { taskId, deletedAt: null },
      include: {
        user: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const taskService = new TaskService();

