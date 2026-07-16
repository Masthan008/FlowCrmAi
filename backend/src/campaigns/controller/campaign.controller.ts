import { Request, Response, NextFunction } from 'express';
import { campaignService } from '../service/campaign.service';
import { ResponseHelper } from '../../helpers/response';

export const campaignController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const type = req.query.type as string;

      const result = await campaignService.getCampaigns({ page, limit, search, status, type });
      ResponseHelper.sendSuccess(req, res, 200, 'Campaigns retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await campaignService.getCampaignById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign details retrieved successfully.', campaign);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await campaignService.createCampaign(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Campaign created successfully.', campaign);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await campaignService.updateCampaign(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign updated successfully.', campaign);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await campaignService.deleteCampaign(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign deleted successfully.');
    } catch (error) { next(error); }
  },

  launch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await campaignService.updateCampaignStatus(req.params.id as string, 'Running', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign launched successfully.', campaign);
    } catch (error) { next(error); }
  },

  pause: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await campaignService.updateCampaignStatus(req.params.id as string, 'Paused', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign paused successfully.', campaign);
    } catch (error) { next(error); }
  },

  getAnalytics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await campaignService.getCampaignAnalytics(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign analytics retrieved successfully.', analytics);
    } catch (error) { next(error); }
  },

  getLists: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lists = await campaignService.getCampaignLists(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign lists retrieved successfully.', lists);
    } catch (error) { next(error); }
  },

  createList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await campaignService.createCampaignList(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Campaign list created successfully.', list);
    } catch (error) { next(error); }
  },

  deleteList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await campaignService.deleteCampaignList(req.params.id as string, req.params.listId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign list deleted successfully.');
    } catch (error) { next(error); }
  },

  getEmails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emails = await campaignService.getCampaignEmails(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign emails retrieved successfully.', emails);
    } catch (error) { next(error); }
  },

  createEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = await campaignService.createCampaignEmail(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Campaign email created successfully.', email);
    } catch (error) { next(error); }
  },

  updateEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = await campaignService.updateCampaignEmail(req.params.id as string, req.params.emailId as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign email updated successfully.', email);
    } catch (error) { next(error); }
  },

  deleteEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await campaignService.deleteCampaignEmail(req.params.id as string, req.params.emailId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Campaign email deleted successfully.');
    } catch (error) { next(error); }
  },
};

export default campaignController;
