"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = exports.TaskController = void 0;
const task_service_1 = require("../service/task.service");
const response_1 = require("../../helpers/response");
const db_1 = require("../../database/db");
class TaskController {
    /**
     * Helper to get employee ID for logged-in user
     */
    async getEmployeeId(userId) {
        const emp = await db_1.prisma.employee.findUnique({
            where: { userId },
            select: { id: true },
        });
        return emp ? emp.id : null;
    }
    /**
     * GET /api/v1/tasks
     */
    getTasks = async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const search = req.query.search;
            const priority = req.query.priority;
            const status = req.query.status;
            const assignedToId = req.query.assignedToId;
            const department = req.query.department;
            const taskType = req.query.taskType;
            const dueDateStart = req.query.dueDateStart;
            const dueDateEnd = req.query.dueDateEnd;
            const sortBy = req.query.sortBy;
            const sortDir = req.query.sortDir;
            let myTasksOnlyUserId;
            if (req.query.myTasks === 'true' && req.user?.id) {
                const empId = await this.getEmployeeId(req.user.id);
                if (empId) {
                    myTasksOnlyUserId = empId;
                }
            }
            const result = await task_service_1.taskService.getTasks({
                page,
                limit,
                search,
                priority,
                status,
                assignedToId,
                department,
                taskType,
                dueDateStart,
                dueDateEnd,
                sortBy,
                sortDir,
                myTasksOnlyUserId,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Tasks retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * GET /api/v1/tasks/statistics
     */
    getStatistics = async (req, res, next) => {
        try {
            let myTasksOnlyUserId;
            if (req.query.myTasks === 'true' && req.user?.id) {
                const empId = await this.getEmployeeId(req.user.id);
                if (empId) {
                    myTasksOnlyUserId = empId;
                }
            }
            const stats = await task_service_1.taskService.getStatistics(myTasksOnlyUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task statistics retrieved successfully.', stats);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * GET /api/v1/tasks/:id
     */
    getById = async (req, res, next) => {
        try {
            const task = await task_service_1.taskService.getTask(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task retrieved successfully.', task);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * POST /api/v1/tasks
     */
    create = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            // Auto assign assignedById if not present
            if (!req.body.assignedById && req.user?.id) {
                const empId = await this.getEmployeeId(req.user.id);
                if (empId) {
                    req.body.assignedById = empId;
                }
            }
            const task = await task_service_1.taskService.createTask(req.body, author);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Task created successfully.', task);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * PUT /api/v1/tasks/:id
     */
    update = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const task = await task_service_1.taskService.updateTask(req.params.id, req.body, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task updated successfully.', task);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * DELETE /api/v1/tasks/:id
     */
    delete = async (req, res, next) => {
        try {
            await task_service_1.taskService.deleteTask(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * PATCH /api/v1/tasks/status or PATCH /api/v1/tasks/:id/status
     */
    patchStatus = async (req, res, next) => {
        try {
            const id = (req.params.id || req.body.taskId);
            const { status } = req.body;
            const author = req.user?.email || 'System';
            if (!id) {
                res.status(400);
                response_1.ResponseHelper.sendError(req, res, 400, 'Task ID is required.');
                return;
            }
            const task = await task_service_1.taskService.patchStatus(id, status, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task status updated successfully.', task);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * PATCH /api/v1/tasks/progress or PATCH /api/v1/tasks/:id/progress
     */
    patchProgress = async (req, res, next) => {
        try {
            const id = (req.params.id || req.body.taskId);
            const { progressPercentage } = req.body;
            const author = req.user?.email || 'System';
            if (!id) {
                res.status(400);
                response_1.ResponseHelper.sendError(req, res, 400, 'Task ID is required.');
                return;
            }
            const task = await task_service_1.taskService.patchProgress(id, progressPercentage, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task progress updated successfully.', task);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * PATCH /api/v1/tasks/assign or PATCH /api/v1/tasks/:id/assign
     */
    patchAssign = async (req, res, next) => {
        try {
            const id = (req.params.id || req.body.taskId);
            const { assignedToId, department } = req.body;
            const author = req.user?.email || 'System';
            if (!id) {
                res.status(400);
                response_1.ResponseHelper.sendError(req, res, 400, 'Task ID is required.');
                return;
            }
            const task = await task_service_1.taskService.patchAssign(id, assignedToId, department || null, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task assignment updated successfully.', task);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Comments Endpoint Controls
     */
    addComment = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const comment = await task_service_1.taskService.addComment(req.params.id, req.body.content, author);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Comment added successfully.', comment);
        }
        catch (error) {
            next(error);
        }
    };
    updateComment = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const comment = await task_service_1.taskService.updateComment(req.params.commentId, req.body.content, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Comment updated successfully.', comment);
        }
        catch (error) {
            next(error);
        }
    };
    deleteComment = async (req, res, next) => {
        try {
            await task_service_1.taskService.deleteComment(req.params.commentId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Comment deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Attachments Endpoint Controls
     */
    addAttachment = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            if (!req.file) {
                res.status(400);
                response_1.ResponseHelper.sendError(req, res, 400, 'No file attachment provided.');
                return;
            }
            const attachment = await task_service_1.taskService.addAttachment({
                taskId: req.params.id,
                name: req.file.originalname,
                path: req.file.filename,
                mimeType: req.file.mimetype,
                size: req.file.size,
                createdBy: author,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Attachment uploaded successfully.', attachment);
        }
        catch (error) {
            next(error);
        }
    };
    deleteAttachment = async (req, res, next) => {
        try {
            await task_service_1.taskService.deleteAttachment(req.params.attachmentId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Attachment removed successfully.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Calendar View
     * GET /api/v1/tasks/calendar
     */
    getCalendar = async (req, res, next) => {
        try {
            const start = req.query.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
            const end = req.query.end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
            const result = await task_service_1.taskService.getCalendar(start, end);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Calendar tasks retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Workload Management
     * GET /api/v1/tasks/workload
     */
    getWorkload = async (req, res, next) => {
        try {
            const result = await task_service_1.taskService.getWorkload();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Team workload calculated successfully.', result);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Productivity Dashboard
     * GET /api/v1/tasks/productivity
     */
    getProductivity = async (req, res, next) => {
        try {
            const timeframe = req.query.timeframe || 'week';
            const result = await task_service_1.taskService.getProductivity(timeframe);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Productivity analytics retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Task Timeline Logs
     * GET /api/v1/tasks/:id/timeline
     */
    getTimeline = async (req, res, next) => {
        try {
            const result = await task_service_1.taskService.getTimeline(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task timeline history retrieved.', result);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Subtasks
     * GET /api/v1/tasks/:id/subtasks
     * POST /api/v1/tasks/:id/subtasks
     */
    getSubtasks = async (req, res, next) => {
        try {
            const task = await task_service_1.taskService.getTask(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subtasks retrieved.', task.subtasks || []);
        }
        catch (error) {
            next(error);
        }
    };
    addSubtask = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const result = await task_service_1.taskService.addSubtask(req.params.id, req.body, author);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Subtask created successfully.', result);
        }
        catch (error) {
            next(error);
        }
    };
    updateSubtask = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const result = await task_service_1.taskService.updateSubtask(req.params.subtaskId, req.body, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subtask updated successfully.', result);
        }
        catch (error) {
            next(error);
        }
    };
    deleteSubtask = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.deleteSubtask(req.params.subtaskId, req.params.id, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subtask removed successfully.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Checklists
     */
    addChecklistItem = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const result = await task_service_1.taskService.addChecklistItem(req.params.id, req.body.title, req.body.order || 0, author);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Checklist item added.', result);
        }
        catch (error) {
            next(error);
        }
    };
    updateChecklistItem = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const result = await task_service_1.taskService.updateChecklistItem(req.params.itemId, req.body, req.params.id, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Checklist item updated.', result);
        }
        catch (error) {
            next(error);
        }
    };
    deleteChecklistItem = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.deleteChecklistItem(req.params.itemId, req.params.id, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Checklist item deleted.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Time Logs / Worklogs
     * GET /api/v1/tasks/:id/time
     * POST /api/v1/tasks/:id/time
     */
    getTimeLogs = async (req, res, next) => {
        try {
            const task = await task_service_1.taskService.getTask(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Time logs retrieved.', task.timeLogs || []);
        }
        catch (error) {
            next(error);
        }
    };
    addTimeLog = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const empId = await this.getEmployeeId(req.user?.id) || '';
            const result = await task_service_1.taskService.addTimeLog(req.params.id, req.body, author, empId);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Time entry logged.', result);
        }
        catch (error) {
            next(error);
        }
    };
    deleteTimeLog = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.deleteTimeLog(req.params.logId, req.params.id, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Time log deleted.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Watchers
     */
    addWatcher = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.addWatcher(req.params.id, req.body.employeeId, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Watcher added successfully.');
        }
        catch (error) {
            next(error);
        }
    };
    removeWatcher = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.removeWatcher(req.params.id, req.params.employeeId, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Watcher removed successfully.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Dependencies
     */
    addDependency = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.addDependency(req.params.id, req.body.dependentTaskId, req.body.type, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Dependency linked successfully.');
        }
        catch (error) {
            next(error);
        }
    };
    removeDependency = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.removeDependency(req.params.id, req.params.dependentTaskId, req.params.type, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Dependency linkage removed.');
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Recurrence
     */
    upsertRecurrence = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const result = await task_service_1.taskService.upsertRecurrence(req.params.id, req.body, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Recurrence options updated.', result);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Approvals
     * POST /api/v1/tasks/:id/approve/request
     * PATCH /api/v1/tasks/:id/approve
     * PATCH /api/v1/tasks/:id/reject
     */
    requestApproval = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            const result = await task_service_1.taskService.requestApproval(req.params.id, req.body.approverId, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Approval workflow request initiated.', result);
        }
        catch (error) {
            next(error);
        }
    };
    approveTask = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.approveTask(req.params.id, req.body.comments || null, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task approved.');
        }
        catch (error) {
            next(error);
        }
    };
    rejectTask = async (req, res, next) => {
        try {
            const author = req.user?.email || 'System';
            await task_service_1.taskService.rejectTask(req.params.id, req.body.comments || null, author);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Task approval rejected.');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.TaskController = TaskController;
exports.taskController = new TaskController();
