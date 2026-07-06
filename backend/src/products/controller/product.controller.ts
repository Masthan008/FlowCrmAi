import { Request, Response, NextFunction } from 'express';
import { productService } from '../service/product.service';
import { ResponseHelper } from '../../helpers/response';

export const productController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      const result = await productService.getProducts({ page, limit, search, categoryId, isActive });
      ResponseHelper.sendSuccess(req, res, 200, 'Products retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.getProductById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Product details retrieved successfully.', product);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.createProduct(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Product created successfully.', product);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.updateProduct(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Product updated successfully.', product);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await productService.deleteProduct(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Product deleted successfully.');
    } catch (error) { next(error); }
  },

  listCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await productService.getCategories();
      ResponseHelper.sendSuccess(req, res, 200, 'Product categories retrieved successfully.', categories);
    } catch (error) { next(error); }
  },

  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await productService.createCategory(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Product category created successfully.', category);
    } catch (error) { next(error); }
  },
};

export default productController;
