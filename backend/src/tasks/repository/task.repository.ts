import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class TaskRepository {
  /**
   * Generates next task number in sequence (e.g., TASK-00001)
   */
  async getNextTaskNumber(): Promise<string> {
    const lastTask = await prisma.task.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { taskNumber: true },
    });
    if (!lastTask || !lastTask.taskNumber) {
      return 'TASK-00001';
    }
    const match = lastTask.taskNumber.match(/TASK-(\d+)/);
    if (!match) {
      return 'TASK-00001';
    }
    const currentNum = parseInt(match[1], 10);
    const nextNum = currentNum + 1;
    return `TASK-${String(nextNum).padStart(5, '0')}`;
  }

  /**
   * Find many tasks matching filters
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }) {
    return prisma.task.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: { select: { id: true, fullName: true, companyName: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        deal: { select: { id: true, name: true, value: true } },
      },
    });
  }

  /**
   * Count total tasks matching conditions
   */
  async count(where?: Prisma.TaskWhereInput) {
    return prisma.task.count({ where });
  }

  /**
   * Find single task by ID
   */
  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, department: true },
        },
        assignedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: { select: { id: true, fullName: true, companyName: true, phone: true, email: true } },
        contact: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        company: { select: { id: true, name: true, phone: true } },
        deal: { select: { id: true, name: true, value: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        subtasks: {
          where: { deletedAt: null },
          include: {
            assignedTo: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        checklists: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        timeLogs: {
          where: { deletedAt: null },
          include: {
            employee: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        labelMappings: {
          include: {
            label: true,
          },
        },
        watchers: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        dependencies: {
          include: {
            dependentTask: { select: { id: true, taskNumber: true, title: true, status: true } },
          },
        },
        dependentOn: {
          include: {
            task: { select: { id: true, taskNumber: true, title: true, status: true } },
          },
        },
        recurrence: true,
        approval: {
          include: {
            approver: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        timelines: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Create a new task
   */
  async create(data: Prisma.TaskUncheckedCreateInput) {
    const taskNumber = await this.getNextTaskNumber();
    return prisma.task.create({
      data: {
        ...data,
        taskNumber,
      },
      include: {
        assignedTo: true,
        assignedBy: true,
      },
    });
  }

  /**
   * Update an existing task
   */
  async update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignedTo: true,
        assignedBy: true,
      },
    });
  }

  /**
   * Delete a task
   */
  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Get raw statistics grouped by status & priority
   */
  async getStatusStats(where?: Prisma.TaskWhereInput) {
    return prisma.task.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });
  }

  async getPriorityStats(where?: Prisma.TaskWhereInput) {
    return prisma.task.groupBy({
      by: ['priority'],
      where,
      _count: { id: true },
    });
  }

  /**
   * Comment actions
   */
  async createComment(taskId: string, content: string, createdBy: string) {
    return prisma.taskComment.create({
      data: {
        taskId,
        content,
        createdBy,
      },
    });
  }

  async updateComment(commentId: string, content: string, updatedBy: string) {
    return prisma.taskComment.update({
      where: { id: commentId },
      data: {
        content,
        updatedBy,
      },
    });
  }

  async deleteComment(commentId: string) {
    return prisma.taskComment.delete({
      where: { id: commentId },
    });
  }

  /**
   * Attachment actions
   */
  async createAttachment(params: {
    taskId: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    createdBy: string;
  }) {
    return prisma.taskAttachment.create({
      data: params,
    });
  }

  async deleteAttachment(attachmentId: string) {
    return prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });
  }

  /**
   * Subtask actions
   */
  async createSubtask(data: Prisma.TaskSubtaskUncheckedCreateInput) {
    return prisma.taskSubtask.create({
      data,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateSubtask(id: string, data: Prisma.TaskSubtaskUncheckedUpdateInput) {
    return prisma.taskSubtask.update({
      where: { id },
      data,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async deleteSubtask(id: string) {
    return prisma.taskSubtask.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Checklist actions
   */
  async createChecklistItem(data: Prisma.TaskChecklistUncheckedCreateInput) {
    return prisma.taskChecklist.create({
      data,
    });
  }

  async updateChecklistItem(id: string, data: Prisma.TaskChecklistUncheckedUpdateInput) {
    return prisma.taskChecklist.update({
      where: { id },
      data,
    });
  }

  async deleteChecklistItem(id: string) {
    return prisma.taskChecklist.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Time Log actions
   */
  async createTimeLog(data: any) {
    return prisma.taskTimeLog.create({
      data,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateTimeLog(id: string, data: any) {
    return prisma.taskTimeLog.update({
      where: { id },
      data,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async deleteTimeLog(id: string) {
    return prisma.taskTimeLog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Watchers actions
   */
  async addWatcher(taskId: string, employeeId: string) {
    return prisma.taskWatcher.upsert({
      where: {
        taskId_employeeId: { taskId, employeeId },
      },
      create: { taskId, employeeId },
      update: {},
    });
  }

  async removeWatcher(taskId: string, employeeId: string) {
    return prisma.taskWatcher.delete({
      where: {
        taskId_employeeId: { taskId, employeeId },
      },
    });
  }

  /**
   * Dependency actions
   */
  async addDependency(taskId: string, dependentTaskId: string, type: string) {
    return prisma.taskDependency.upsert({
      where: {
        taskId_dependentTaskId_type: { taskId, dependentTaskId, type },
      },
      create: { taskId, dependentTaskId, type },
      update: {},
    });
  }

  async removeDependency(taskId: string, dependentTaskId: string, type: string) {
    return prisma.taskDependency.delete({
      where: {
        taskId_dependentTaskId_type: { taskId, dependentTaskId, type },
      },
    });
  }

  /**
   * Recurrence actions
   */
  async upsertRecurrence(taskId: string, data: any) {
    return prisma.taskRecurrence.upsert({
      where: { taskId },
      create: {
        ...data,
        taskId,
        frequency: data.frequency || 'Daily',
      } as any,
      update: data,
    });
  }

  /**
   * Approvals actions
   */
  async upsertApproval(taskId: string, approverId: string) {
    return prisma.taskApproval.upsert({
      where: { taskId },
      create: {
        taskId,
        approverId,
        status: 'Pending Approval',
      },
      update: {
        approverId,
        status: 'Pending Approval',
        approvalDate: null,
        comments: null,
      },
    });
  }

  async updateApproval(id: string, data: any) {
    return prisma.taskApproval.update({
      where: { id },
      data,
    });
  }

  /**
   * Timeline actions
   */
  async createTimelineLog(taskId: string, action: string, notes?: string, userId?: string) {
    return prisma.taskTimeline.create({
      data: {
        taskId,
        action,
        notes,
        userId,
      },
    });
  }

  /**
   * Notification actions
   */
  async createNotification(taskId: string, employeeId: string, title: string, message: string, type: string = 'info') {
    return prisma.taskNotification.create({
      data: {
        taskId,
        employeeId,
        title,
        message,
        type,
      },
    });
  }
}

export const taskRepository = new TaskRepository();

