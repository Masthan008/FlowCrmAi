import { Request, Response, NextFunction } from 'express';
import { knowledgeService } from '../service/knowledge.service';
import { ResponseHelper } from '../../helpers/response';

export const knowledgeController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const status = req.query.status as string;
      const tags = req.query.tags as string;

      const result = await knowledgeService.getArticles({ page, limit, search, category, status, tags });
      ResponseHelper.sendSuccess(req, res, 200, 'Articles retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await knowledgeService.getArticleById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Article details retrieved successfully.', article);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await knowledgeService.createArticle(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Article created successfully.', article);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await knowledgeService.updateArticle(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Article updated successfully.', article);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await knowledgeService.deleteArticle(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Article deleted successfully.');
    } catch (error) { next(error); }
  },

  publish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await knowledgeService.updateArticleStatus(req.params.id as string, 'Published', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Article published successfully.', article);
    } catch (error) { next(error); }
  },

  archive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await knowledgeService.updateArticleStatus(req.params.id as string, 'Archived', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Article archived successfully.', article);
    } catch (error) { next(error); }
  },

  vote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await knowledgeService.voteArticle(req.params.id as string, req.body.helpful, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Vote recorded successfully.', result);
    } catch (error) { next(error); }
  },

  getCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await knowledgeService.getCategories();
      ResponseHelper.sendSuccess(req, res, 200, 'Categories retrieved successfully.', categories);
    } catch (error) { next(error); }
  },

  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await knowledgeService.createCategory(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Category created successfully.', category);
    } catch (error) { next(error); }
  },

  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await knowledgeService.updateCategory(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Category updated successfully.', category);
    } catch (error) { next(error); }
  },

  deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await knowledgeService.deleteCategory(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Category deleted successfully.');
    } catch (error) { next(error); }
  },
};

export default knowledgeController;
