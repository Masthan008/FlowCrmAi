"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRepository = exports.TaskRepository = void 0;
const db_1 = require("../../database/db");
class TaskRepository {
    /**
     * Generates next task number in sequence (e.g., TASK-00001)
     */
    async getNextTaskNumber() {
        const lastTask = await db_1.prisma.task.findFirst({
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
    async findMany(params) {
        return db_1.prisma.task.findMany({
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
    async count(where) {
        return db_1.prisma.task.count({ where });
    }
    /**
     * Find single task by ID
     */
    async findById(id) {
        return db_1.prisma.task.findUnique({
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
    async create(data) {
        const taskNumber = await this.getNextTaskNumber();
        return db_1.prisma.task.create({
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
    async update(id, data) {
        return db_1.prisma.task.update({
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
    async delete(id) {
        return db_1.prisma.task.delete({
            where: { id },
        });
    }
    /**
     * Get raw statistics grouped by status & priority
     */
    async getStatusStats(where) {
        return db_1.prisma.task.groupBy({
            by: ['status'],
            where,
            _count: { id: true },
        });
    }
    async getPriorityStats(where) {
        return db_1.prisma.task.groupBy({
            by: ['priority'],
            where,
            _count: { id: true },
        });
    }
    /**
     * Comment actions
     */
    async createComment(taskId, content, createdBy) {
        return db_1.prisma.taskComment.create({
            data: {
                taskId,
                content,
                createdBy,
            },
        });
    }
    async updateComment(commentId, content, updatedBy) {
        return db_1.prisma.taskComment.update({
            where: { id: commentId },
            data: {
                content,
                updatedBy,
            },
        });
    }
    async deleteComment(commentId) {
        return db_1.prisma.taskComment.delete({
            where: { id: commentId },
        });
    }
    /**
     * Attachment actions
     */
    async createAttachment(params) {
        return db_1.prisma.taskAttachment.create({
            data: params,
        });
    }
    async deleteAttachment(attachmentId) {
        return db_1.prisma.taskAttachment.delete({
            where: { id: attachmentId },
        });
    }
    /**
     * Subtask actions
     */
    async createSubtask(data) {
        return db_1.prisma.taskSubtask.create({
            data,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async updateSubtask(id, data) {
        return db_1.prisma.taskSubtask.update({
            where: { id },
            data,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async deleteSubtask(id) {
        return db_1.prisma.taskSubtask.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    /**
     * Checklist actions
     */
    async createChecklistItem(data) {
        return db_1.prisma.taskChecklist.create({
            data,
        });
    }
    async updateChecklistItem(id, data) {
        return db_1.prisma.taskChecklist.update({
            where: { id },
            data,
        });
    }
    async deleteChecklistItem(id) {
        return db_1.prisma.taskChecklist.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    /**
     * Time Log actions
     */
    async createTimeLog(data) {
        return db_1.prisma.taskTimeLog.create({
            data,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async updateTimeLog(id, data) {
        return db_1.prisma.taskTimeLog.update({
            where: { id },
            data,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async deleteTimeLog(id) {
        return db_1.prisma.taskTimeLog.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    /**
     * Watchers actions
     */
    async addWatcher(taskId, employeeId) {
        return db_1.prisma.taskWatcher.upsert({
            where: {
                taskId_employeeId: { taskId, employeeId },
            },
            create: { taskId, employeeId },
            update: {},
        });
    }
    async removeWatcher(taskId, employeeId) {
        return db_1.prisma.taskWatcher.delete({
            where: {
                taskId_employeeId: { taskId, employeeId },
            },
        });
    }
    /**
     * Dependency actions
     */
    async addDependency(taskId, dependentTaskId, type) {
        return db_1.prisma.taskDependency.upsert({
            where: {
                taskId_dependentTaskId_type: { taskId, dependentTaskId, type },
            },
            create: { taskId, dependentTaskId, type },
            update: {},
        });
    }
    async removeDependency(taskId, dependentTaskId, type) {
        return db_1.prisma.taskDependency.delete({
            where: {
                taskId_dependentTaskId_type: { taskId, dependentTaskId, type },
            },
        });
    }
    /**
     * Recurrence actions
     */
    async upsertRecurrence(taskId, data) {
        return db_1.prisma.taskRecurrence.upsert({
            where: { taskId },
            create: {
                ...data,
                taskId,
                frequency: data.frequency || 'Daily',
            },
            update: data,
        });
    }
    /**
     * Approvals actions
     */
    async upsertApproval(taskId, approverId) {
        return db_1.prisma.taskApproval.upsert({
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
    async updateApproval(id, data) {
        return db_1.prisma.taskApproval.update({
            where: { id },
            data,
        });
    }
    /**
     * Timeline actions
     */
    async createTimelineLog(taskId, action, notes, userId) {
        return db_1.prisma.taskTimeline.create({
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
    async createNotification(taskId, employeeId, title, message, type = 'info') {
        return db_1.prisma.taskNotification.create({
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
exports.TaskRepository = TaskRepository;
exports.taskRepository = new TaskRepository();
