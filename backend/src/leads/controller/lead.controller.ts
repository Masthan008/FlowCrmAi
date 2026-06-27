import { Request, Response, NextFunction } from 'express';
import { leadService } from '../service/lead.service';
import { leadAutomationService } from '../service/leadAutomation.service';
import { prisma } from '../../database/db';
import { ResponseHelper } from '../../helpers/response';

export const leadController = {
  /**
   * GET /leads
   */
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.list({
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        source: req.query.source as string | undefined,
        priority: req.query.priority as string | undefined,
        owner: req.query.owner as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortDir: req.query.sortDir as string | undefined,
      } as any);

      ResponseHelper.sendSuccess(req, res, 200, 'Leads retrieved successfully.', result.items, {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/statistics
   */
  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await leadService.getStatistics();
      ResponseHelper.sendSuccess(req, res, 200, 'Lead statistics retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/sources
   */
  getSources: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await leadService.getSources();
      ResponseHelper.sendSuccess(req, res, 200, 'Lead sources retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/statuses
   */
  getStatuses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await leadService.getStatuses();
      ResponseHelper.sendSuccess(req, res, 200, 'Lead statuses retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/employees
   */
  getEmployees: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await leadService.getEmployees();
      ResponseHelper.sendSuccess(req, res, 200, 'Employees retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/:id
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.getById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead retrieved successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * GET /leads/:id/profile
   */
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await leadService.getProfile(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead profile retrieved successfully.', profile);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * POST /leads
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.create(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Lead created successfully.', lead);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /leads/:id
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.update(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * DELETE /leads/:id
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await leadService.delete(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead deleted successfully.');
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/status
   */
  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateStatus(req.params.id as string, req.body.statusId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead status updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/owner
   */
  updateOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateOwner(req.params.id as string, req.body.assignedToId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead owner updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/priority
   */
  updatePriority: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updatePriority(req.params.id as string, req.body.priority, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead priority updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/rating
   */
  updateRating: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateRating(req.params.id as string, req.body.rating, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead rating updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * GET /leads/search
   */
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, page, limit } = req.query;
      const result = await leadService.globalSearch({
        query: String(query || ''),
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      ResponseHelper.sendSuccess(req, res, 200, 'Search results retrieved.', result.items, {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/filter
   */
  filter: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};
      const { page, limit, sortBy, sortDir } = req.query;
      const result = await leadService.advancedFilter({
        filters,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        sortBy: sortBy as string,
        sortDir: sortDir as string,
      });
      ResponseHelper.sendSuccess(req, res, 200, 'Filtered leads retrieved.', result.items, {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /leads/bulk-update
   */
  bulkUpdate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, statusId, priority, rating, assignedToId, sourceId, industry, tags } = req.body;
      await leadService.bulkUpdate({
        ids,
        statusId,
        priority,
        rating,
        assignedToId,
        sourceId,
        industry,
        tags,
        userId: req.user?.id,
      });
      ResponseHelper.sendSuccess(req, res, 200, 'Bulk update completed successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /leads/archive
   */
  archive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;
      await leadService.archiveLeads(ids, req.user?.id || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Leads archived successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /leads/restore
   */
  restore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;
      await leadService.restoreLeads(ids);
      ResponseHelper.sendSuccess(req, res, 200, 'Leads restored successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /leads/merge
   */
  merge: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { primaryId, secondaryIds, fieldValues } = req.body;
      await leadService.mergeLeads({
        primaryId,
        secondaryIds,
        fieldValues,
        userId: req.user?.id || 'system',
      });
      ResponseHelper.sendSuccess(req, res, 200, 'Leads merged successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /leads/save-view
   */
  saveView: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const view = await leadService.saveView(req.user?.id as string, req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Saved view configuration recorded.', view);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/views
   */
  getViews: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const views = await leadService.getViews(req.user?.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Saved views retrieved.', views);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /leads/views/:id
   */
  deleteView: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await leadService.deleteView(req.params.id as string, req.user?.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Saved view configuration removed.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /leads/import
   */
  importLeads: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileName, rows, mapping } = req.body;
      const result = await leadService.importLeads(req.user?.id as string, fileName, rows, mapping);
      ResponseHelper.sendSuccess(req, res, 200, 'CSV import operation completed successfully.', result);
    } catch (error: any) {
      ResponseHelper.sendError(req, res, 400, error.message || 'Import transaction failed.');
    }
  },

  /**
   * GET /leads/export
   */
  exportLeads: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const type = (req.query.type as string) || 'csv';
      const selectedIds = req.query.selectedIds ? String(req.query.selectedIds).split(',') : undefined;
      const pageLeads = req.query.pageLeads ? String(req.query.pageLeads).split(',') : undefined;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;

      const leads = await leadService.exportLeads(req.user?.id as string, type, {
        selectedIds,
        filters,
        pageLeads,
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Export dataset compiled successfully.', leads);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /leads/:id/assign
   */
  /**
   * POST /leads/:id/assign
   */
  assign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { assignedToId, ruleType, reason } = req.body;
      let lead;

      if (ruleType === 'ROUND_ROBIN' || ruleType === 'LOAD_BASED') {
        lead = await leadAutomationService.autoAssignLead(id, ruleType, (req.user?.id as string) || 'system');
      } else {
        lead = await leadAutomationService.assignLead({
          leadId: id,
          assignedToId: assignedToId as string,
          reason: reason as string,
          userId: (req.user?.id as string) || 'system',
        });
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Lead owner assigned successfully.', lead);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /leads/:id/convert
   */
  convert: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await leadAutomationService.convertLead(id, req.body, (req.user?.id as string) || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Lead converted successfully.', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /leads/:id/follow-up
   */
  createFollowup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { type, followupDate, assignedToId, notes, reminderMinutes } = req.body;

      const followup = await prisma.leadFollowup.create({
        data: {
          leadId: id,
          type: type as string,
          followupDate: new Date(followupDate),
          assignedToId: assignedToId as string,
          notes: notes as string,
          reminderMinutes: reminderMinutes ? Number(reminderMinutes) : 15,
          createdBy: (req.user?.id as string) || 'system',
        },
      });

      ResponseHelper.sendSuccess(req, res, 201, 'Lead follow-up scheduled.', followup);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/:id/follow-ups
   */
  getFollowups: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const followups = await prisma.leadFollowup.findMany({
        where: { leadId: id, deletedAt: null },
        orderBy: { followupDate: 'asc' },
      });
      ResponseHelper.sendSuccess(req, res, 200, 'Lead follow-ups retrieved.', followups);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/workflow
   */
  workflow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { name, trigger, conditions, actions, isActive } = req.body;

      const workflow = await prisma.leadWorkflow.create({
        data: {
          leadId: id,
          name: name as string,
          trigger: trigger as string,
          conditions: conditions || {},
          actions: actions || {},
          isActive: isActive !== false,
          createdBy: (req.user?.id as string) || 'system',
        },
      });

      ResponseHelper.sendSuccess(req, res, 201, 'Lead workflow rule saved.', workflow);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/:id/score
   */
  score: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const score = await leadAutomationService.calculateLeadScore(id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead score calculated.', score);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/:id/health
   */
  health: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const health = await leadAutomationService.evaluateLeadHealth(id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead health indicators retrieved.', health);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/:id/sla
   */
  sla: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { responseMinutes } = req.body;
      const sla = await leadAutomationService.updateSlaStatus(id, Number(responseMinutes || 0));
      ResponseHelper.sendSuccess(req, res, 200, 'SLA tracking status updated.', sla);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /leads/:id/approval
   */
  approval: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { type, approverId, comments } = req.body;

      const approval = await prisma.leadApproval.create({
        data: {
          leadId: id,
          type: type as string,
          approverId: approverId as string,
          comments: comments as string,
          status: 'Pending',
          createdBy: (req.user?.id as string) || 'system',
        },
      });

      ResponseHelper.sendSuccess(req, res, 201, 'Approval request submitted.', approval);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/reassign
   */
  reassign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { assignedToId, reason } = req.body;

      const lead = await leadAutomationService.assignLead({
        leadId: id,
        assignedToId: assignedToId as string,
        type: 'Manual Reassign',
        reason: (reason as string) || 'Lead Ownership Transfer',
        userId: (req.user?.id as string) || 'system',
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Lead ownership reassigned successfully.', lead);
    } catch (error) {
      next(error);
    }
  },
};

export default leadController;
