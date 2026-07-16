import { Request, Response, NextFunction } from 'express';
import { surveyService } from '../service/survey.service';
import { ResponseHelper } from '../../helpers/response';

export const surveyController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await surveyService.getSurveys({ page, limit, search, status });
      ResponseHelper.sendSuccess(req, res, 200, 'Surveys retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const survey = await surveyService.getSurveyById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Survey details retrieved successfully.', survey);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const survey = await surveyService.createSurvey(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Survey created successfully.', survey);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const survey = await surveyService.updateSurvey(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Survey updated successfully.', survey);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await surveyService.deleteSurvey(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Survey deleted successfully.');
    } catch (error) { next(error); }
  },

  activate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const survey = await surveyService.activateSurvey(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Survey activated successfully.', survey);
    } catch (error) { next(error); }
  },

  close: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const survey = await surveyService.closeSurvey(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Survey closed successfully.', survey);
    } catch (error) { next(error); }
  },

  getResponses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const result = await surveyService.getResponses(req.params.id as string, { page, limit });
      ResponseHelper.sendSuccess(req, res, 200, 'Survey responses retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getAnalytics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await surveyService.getAnalytics(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Survey analytics retrieved successfully.', analytics);
    } catch (error) { next(error); }
  },

  submitPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await surveyService.submitPublic(req.params.id as string, req.body, req.ip);
      ResponseHelper.sendSuccess(req, res, 201, 'Survey response submitted successfully.', response);
    } catch (error) { next(error); }
  },
};

export default surveyController;
