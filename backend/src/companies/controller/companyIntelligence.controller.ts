import { Request, Response, NextFunction } from 'express';
import { companyIntelligenceService } from '../service/companyIntelligence.service';
import { ResponseHelper } from '../../helpers/response';

export const companyIntelligenceController = {
  getLifecycle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lifecycle = await companyIntelligenceService.getLifecycle(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle retrieved successfully.', lifecycle);
    } catch (error) { next(error); }
  },

  updateLifecycle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lifecycle = await companyIntelligenceService.updateLifecycle(
        req.params.id as string, req.body, req.user?.id
      );
      ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle updated successfully.', lifecycle);
    } catch (error) { next(error); }
  },

  getStageHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await companyIntelligenceService.getStageHistory(req.params.id as string, page, limit);
      const { items, totalItems, totalPages } = history;
      ResponseHelper.sendSuccess(req, res, 200, 'Stage history retrieved successfully.', items, {
        page, limit, totalItems, totalPages,
      });
    } catch (error) { next(error); }
  },

  getScore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const score = await companyIntelligenceService.getScore(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Score retrieved successfully.', score);
    } catch (error) { next(error); }
  },

  calculateScore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const score = await companyIntelligenceService.calculateScore(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Score calculated successfully.', score);
    } catch (error) { next(error); }
  },

  getHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const health = await companyIntelligenceService.getHealth(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Health retrieved successfully.', health);
    } catch (error) { next(error); }
  },

  calculateHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const health = await companyIntelligenceService.calculateHealth(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Health calculated successfully.', health);
    } catch (error) { next(error); }
  },

  getRisk: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const risk = await companyIntelligenceService.getRisk(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Risk retrieved successfully.', risk);
    } catch (error) { next(error); }
  },

  calculateRisk: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const risk = await companyIntelligenceService.calculateRisk(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Risk calculated successfully.', risk);
    } catch (error) { next(error); }
  },

  listSegments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };
      const result = await companyIntelligenceService.listSegments(params);
      ResponseHelper.sendSuccess(req, res, 200, 'Segments retrieved successfully.', result.items, {
        page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  },

  createSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const segment = await companyIntelligenceService.createSegment(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Segment created successfully.', segment);
    } catch (error) { next(error); }
  },

  getSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const segment = await companyIntelligenceService.getSegment(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Segment retrieved successfully.', segment);
    } catch (error) { next(error); }
  },

  updateSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const segment = await companyIntelligenceService.updateSegment(req.params.id as string, req.body);
      ResponseHelper.sendSuccess(req, res, 200, 'Segment updated successfully.', segment);
    } catch (error) { next(error); }
  },

  deleteSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await companyIntelligenceService.deleteSegment(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Segment deleted successfully.');
    } catch (error) { next(error); }
  },

  evaluateSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await companyIntelligenceService.evaluateSegment(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Segment evaluated successfully.', companies);
    } catch (error) { next(error); }
  },

  listTags: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };
      const result = await companyIntelligenceService.listTags(params);
      ResponseHelper.sendSuccess(req, res, 200, 'Tags retrieved successfully.', result.items, {
        page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  },

  createTag: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await companyIntelligenceService.createTag(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Tag created successfully.', tag);
    } catch (error) { next(error); }
  },

  updateTag: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await companyIntelligenceService.updateTag(req.params.id as string, req.body);
      ResponseHelper.sendSuccess(req, res, 200, 'Tag updated successfully.', tag);
    } catch (error) { next(error); }
  },

  deleteTag: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await companyIntelligenceService.deleteTag(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Tag deleted successfully.');
    } catch (error) { next(error); }
  },

  getCompanyTags: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await companyIntelligenceService.getCompanyTags(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Company tags retrieved successfully.', tags);
    } catch (error) { next(error); }
  },

  assignTagsToCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await companyIntelligenceService.assignTagsToCompany(
        req.params.id as string, req.body.tagIds, req.user?.id
      );
      ResponseHelper.sendSuccess(req, res, 200, 'Tags assigned successfully.', tags);
    } catch (error) { next(error); }
  },

  removeTagFromCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await companyIntelligenceService.removeTagFromCompany(req.params.id as string, req.params.tagId as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Tag removed from company successfully.');
    } catch (error) { next(error); }
  },

  listWorkflows: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        triggerType: req.query.triggerType as string,
      };
      const result = await companyIntelligenceService.listWorkflows(params);
      ResponseHelper.sendSuccess(req, res, 200, 'Workflows retrieved successfully.', result.items, {
        page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  },

  createWorkflow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workflow = await companyIntelligenceService.createWorkflow(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Workflow created successfully.', workflow);
    } catch (error) { next(error); }
  },

  updateWorkflow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workflow = await companyIntelligenceService.updateWorkflow(req.params.id as string, req.body);
      ResponseHelper.sendSuccess(req, res, 200, 'Workflow updated successfully.', workflow);
    } catch (error) { next(error); }
  },

  deleteWorkflow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await companyIntelligenceService.deleteWorkflow(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Workflow deleted successfully.');
    } catch (error) { next(error); }
  },

  listRecommendations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        type: req.query.type as string,
        priority: req.query.priority as string,
        isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
        isActioned: req.query.isActioned !== undefined ? req.query.isActioned === 'true' : undefined,
      };
      const result = await companyIntelligenceService.listRecommendations(req.params.id as string, params);
      ResponseHelper.sendSuccess(req, res, 200, 'Recommendations retrieved successfully.', result.items, {
        page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  },

  createRecommendation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendation = await companyIntelligenceService.createRecommendation({
        ...req.body,
        companyId: req.params.id as string,
      });
      ResponseHelper.sendSuccess(req, res, 201, 'Recommendation created successfully.', recommendation);
    } catch (error) { next(error); }
  },

  markRecommendationRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendation = await companyIntelligenceService.markRecommendationRead(req.params.recId as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Recommendation marked as read.', recommendation);
    } catch (error) { next(error); }
  },

  markRecommendationActioned: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendation = await companyIntelligenceService.markRecommendationActioned(req.params.recId as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Recommendation marked as actioned.', recommendation);
    } catch (error) { next(error); }
  },

  listFollowups: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as string,
        type: req.query.type as string,
        priority: req.query.priority as string,
      };
      const result = await companyIntelligenceService.listFollowups(req.params.id as string, params);
      ResponseHelper.sendSuccess(req, res, 200, 'Follow-ups retrieved successfully.', result.items, {
        page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  },

  createFollowup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const followup = await companyIntelligenceService.createFollowup({
        ...req.body,
        companyId: req.params.id as string,
        dueDate: new Date(req.body.dueDate),
      });
      ResponseHelper.sendSuccess(req, res, 201, 'Follow-up created successfully.', followup);
    } catch (error) { next(error); }
  },

  updateFollowup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: any = { ...req.body };
      if (data.dueDate) data.dueDate = new Date(data.dueDate);
      const followup = await companyIntelligenceService.updateFollowup(req.params.followupId as string, data);
      ResponseHelper.sendSuccess(req, res, 200, 'Follow-up updated successfully.', followup);
    } catch (error) { next(error); }
  },

  deleteFollowup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await companyIntelligenceService.deleteFollowup(req.params.followupId as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Follow-up deleted successfully.');
    } catch (error) { next(error); }
  },

  getInsights: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insights = await companyIntelligenceService.getInsights();
      ResponseHelper.sendSuccess(req, res, 200, 'Insights retrieved successfully.', insights);
    } catch (error) { next(error); }
  },

  getAnalytics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        period: req.query.period as string || 'monthly',
        year: parseInt(req.query.year as string) || new Date().getFullYear(),
      };
      const analytics = await companyIntelligenceService.getAnalytics(params);
      ResponseHelper.sendSuccess(req, res, 200, 'Analytics retrieved successfully.', analytics);
    } catch (error) { next(error); }
  },
};
