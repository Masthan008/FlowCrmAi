import { Request, Response, NextFunction } from 'express';
import { dealAutomationService } from '../service/dealAutomation.service';
import { ResponseHelper } from '../../helpers/response';

export const dealAutomationController = {
  getScore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getScore(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal score calculated.', data);
    } catch (error) {
      next(error);
    }
  },

  getWinProbability: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getWinProbability(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Win probability calculated.', data);
    } catch (error) {
      next(error);
    }
  },

  getHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getHealth(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal health metrics loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getRisk: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getRisk(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Risk analysis completed.', data);
    } catch (error) {
      next(error);
    }
  },

  getRecommendations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getRecommendations(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Recommendations generated.', data);
    } catch (error) {
      next(error);
    }
  },

  getSLA: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getSLA(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'SLA status loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getPlaybooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getPlaybooks(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Playbooks loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getFollowups: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getFollowups(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Follow-up schedules loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createFollowup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.createFollowup(
        req.params.id as string,
        req.body,
        req.user?.email || 'system'
      );
      ResponseHelper.sendSuccess(req, res, 201, 'Follow-up created successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  updateLifecycle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.updateLifecycle(req.params.id as string, req.body);
      ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle status updated.', data);
    } catch (error) {
      next(error);
    }
  },

  getExecutiveInsights: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getExecutiveInsights();
      ResponseHelper.sendSuccess(req, res, 200, 'Executive insights loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getWorkflows: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.getWorkflows(req.query.module as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Workflows loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createWorkflow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealAutomationService.createWorkflow(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Workflow created successfully.', data);
    } catch (error) {
      next(error);
    }
  }
};
