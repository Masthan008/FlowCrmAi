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
}

export const taskRepository = new TaskRepository();
