import { Request, Response, NextFunction } from 'express';
import { taskService } from '../service/task.service';
import { ResponseHelper } from '../../helpers/response';
import { prisma } from '../../database/db';

export class TaskController {
  /**
   * Helper to get employee ID for logged-in user
   */
  private async getEmployeeId(userId: string): Promise<string | null> {
    const emp = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });
    return emp ? emp.id : null;
  }

  /**
   * GET /api/v1/tasks
   */
  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const priority = req.query.priority as string;
      const status = req.query.status as string;
      const assignedToId = req.query.assignedToId as string;
      const department = req.query.department as string;
      const taskType = req.query.taskType as string;
      const dueDateStart = req.query.dueDateStart as string;
      const dueDateEnd = req.query.dueDateEnd as string;
      const sortBy = req.query.sortBy as string;
      const sortDir = req.query.sortDir as 'asc' | 'desc';
      
      let myTasksOnlyUserId: string | undefined;
      if (req.query.myTasks === 'true' && req.user?.id) {
        const empId = await this.getEmployeeId(req.user.id);
        if (empId) {
          myTasksOnlyUserId = empId;
        }
      }

      const result = await taskService.getTasks({
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

      ResponseHelper.sendSuccess(req, res, 200, 'Tasks retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/tasks/statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let myTasksOnlyUserId: string | undefined;
      if (req.query.myTasks === 'true' && req.user?.id) {
        const empId = await this.getEmployeeId(req.user.id);
        if (empId) {
          myTasksOnlyUserId = empId;
        }
      }

      const stats = await taskService.getStatistics(myTasksOnlyUserId);
      ResponseHelper.sendSuccess(req, res, 200, 'Task statistics retrieved successfully.', stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/tasks/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.getTask(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Task retrieved successfully.', task);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/tasks
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      
      // Auto assign assignedById if not present
      if (!req.body.assignedById && req.user?.id) {
        const empId = await this.getEmployeeId(req.user.id);
        if (empId) {
          req.body.assignedById = empId;
        }
      }

      const task = await taskService.createTask(req.body, author);
      ResponseHelper.sendSuccess(req, res, 201, 'Task created successfully.', task);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/tasks/:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const task = await taskService.updateTask(req.params.id as string, req.body, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Task updated successfully.', task);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/tasks/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskService.deleteTask(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Task deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/tasks/status or PATCH /api/v1/tasks/:id/status
   */
  patchStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = (req.params.id || req.body.taskId) as string;
      const { status } = req.body;
      const author = req.user?.email || 'System';

      if (!id) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Task ID is required.');
        return;
      }

      const task = await taskService.patchStatus(id, status, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Task status updated successfully.', task);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/tasks/progress or PATCH /api/v1/tasks/:id/progress
   */
  patchProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = (req.params.id || req.body.taskId) as string;
      const { progressPercentage } = req.body;
      const author = req.user?.email || 'System';

      if (!id) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Task ID is required.');
        return;
      }

      const task = await taskService.patchProgress(id, progressPercentage, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Task progress updated successfully.', task);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/tasks/assign or PATCH /api/v1/tasks/:id/assign
   */
  patchAssign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = (req.params.id || req.body.taskId) as string;
      const { assignedToId, department } = req.body;
      const author = req.user?.email || 'System';

      if (!id) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Task ID is required.');
        return;
      }

      const task = await taskService.patchAssign(id, assignedToId, department || null, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Task assignment updated successfully.', task);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Comments Endpoint Controls
   */
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const comment = await taskService.addComment(req.params.id as string, req.body.content, author);
      ResponseHelper.sendSuccess(req, res, 201, 'Comment added successfully.', comment);
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const comment = await taskService.updateComment(req.params.commentId as string, req.body.content, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Comment updated successfully.', comment);
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskService.deleteComment(req.params.commentId as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Comment deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Attachments Endpoint Controls
   */
  addAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      if (!req.file) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'No file attachment provided.');
        return;
      }

      const attachment = await taskService.addAttachment({
        taskId: req.params.id as string,
        name: req.file.originalname,
        path: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        createdBy: author,
      });

      ResponseHelper.sendSuccess(req, res, 201, 'Attachment uploaded successfully.', attachment);
    } catch (error) {
      next(error);
    }
  };

  deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskService.deleteAttachment(req.params.attachmentId as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Attachment removed successfully.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Calendar View
   * GET /api/v1/tasks/calendar
   */
  getCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const start = req.query.start as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const end = req.query.end as string || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
      const result = await taskService.getCalendar(start, end);
      ResponseHelper.sendSuccess(req, res, 200, 'Calendar tasks retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Workload Management
   * GET /api/v1/tasks/workload
   */
  getWorkload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await taskService.getWorkload();
      ResponseHelper.sendSuccess(req, res, 200, 'Team workload calculated successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Productivity Dashboard
   * GET /api/v1/tasks/productivity
   */
  getProductivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeframe = req.query.timeframe as string || 'week';
      const result = await taskService.getProductivity(timeframe);
      ResponseHelper.sendSuccess(req, res, 200, 'Productivity analytics retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Task Timeline Logs
   * GET /api/v1/tasks/:id/timeline
   */
  getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await taskService.getTimeline(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Task timeline history retrieved.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Subtasks
   * GET /api/v1/tasks/:id/subtasks
   * POST /api/v1/tasks/:id/subtasks
   */
  getSubtasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.getTask(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Subtasks retrieved.', task.subtasks || []);
    } catch (error) {
      next(error);
    }
  };

  addSubtask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const result = await taskService.addSubtask(req.params.id as string, req.body, author);
      ResponseHelper.sendSuccess(req, res, 201, 'Subtask created successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  updateSubtask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const result = await taskService.updateSubtask(req.params.subtaskId as string, req.body, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Subtask updated successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  deleteSubtask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.deleteSubtask(req.params.subtaskId as string, req.params.id as string, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Subtask removed successfully.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Checklists
   */
  addChecklistItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const result = await taskService.addChecklistItem(req.params.id as string, req.body.title, req.body.order || 0, author);
      ResponseHelper.sendSuccess(req, res, 201, 'Checklist item added.', result);
    } catch (error) {
      next(error);
    }
  };

  updateChecklistItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const result = await taskService.updateChecklistItem(req.params.itemId as string, req.body, req.params.id as string, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Checklist item updated.', result);
    } catch (error) {
      next(error);
    }
  };

  deleteChecklistItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.deleteChecklistItem(req.params.itemId as string, req.params.id as string, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Checklist item deleted.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Time Logs / Worklogs
   * GET /api/v1/tasks/:id/time
   * POST /api/v1/tasks/:id/time
   */
  getTimeLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.getTask(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Time logs retrieved.', task.timeLogs || []);
    } catch (error) {
      next(error);
    }
  };

  addTimeLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const empId = await this.getEmployeeId(req.user?.id as string) || '';
      const result = await taskService.addTimeLog(req.params.id as string, req.body, author, empId);
      ResponseHelper.sendSuccess(req, res, 201, 'Time entry logged.', result);
    } catch (error) {
      next(error);
    }
  };

  deleteTimeLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.deleteTimeLog(req.params.logId as string, req.params.id as string, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Time log deleted.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Watchers
   */
  addWatcher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.addWatcher(req.params.id as string, req.body.employeeId, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Watcher added successfully.');
    } catch (error) {
      next(error);
    }
  };

  removeWatcher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.removeWatcher(req.params.id as string, req.params.employeeId as string, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Watcher removed successfully.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Dependencies
   */
  addDependency = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.addDependency(req.params.id as string, req.body.dependentTaskId, req.body.type, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Dependency linked successfully.');
    } catch (error) {
      next(error);
    }
  };

  removeDependency = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.removeDependency(req.params.id as string, req.params.dependentTaskId as string, req.params.type as string, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Dependency linkage removed.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Recurrence
   */
  upsertRecurrence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const result = await taskService.upsertRecurrence(req.params.id as string, req.body, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Recurrence options updated.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Approvals
   * POST /api/v1/tasks/:id/approve/request
   * PATCH /api/v1/tasks/:id/approve
   * PATCH /api/v1/tasks/:id/reject
   */
  requestApproval = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      const result = await taskService.requestApproval(req.params.id as string, req.body.approverId, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Approval workflow request initiated.', result);
    } catch (error) {
      next(error);
    }
  };

  approveTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.approveTask(req.params.id as string, req.body.comments || null, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Task approved.');
    } catch (error) {
      next(error);
    }
  };

  rejectTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const author = req.user?.email || 'System';
      await taskService.rejectTask(req.params.id as string, req.body.comments || null, author);
      ResponseHelper.sendSuccess(req, res, 200, 'Task approval rejected.');
    } catch (error) {
      next(error);
    }
  };
}

export const taskController = new TaskController();

