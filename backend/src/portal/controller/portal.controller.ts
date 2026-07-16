import { Request, Response, NextFunction } from 'express';
import { portalService } from '../service/portal.service';
import { ResponseHelper } from '../../helpers/response';

export const portalController = {
  listUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;

      const result = await portalService.getPortalUsers({ page, limit, search });
      ResponseHelper.sendSuccess(req, res, 200, 'Portal users retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await portalService.getPortalUserById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Portal user details retrieved successfully.', user);
    } catch (error) { next(error); }
  },

  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await portalService.createPortalUser(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Portal user created successfully.', user);
    } catch (error) { next(error); }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await portalService.updatePortalUser(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Portal user updated successfully.', user);
    } catch (error) { next(error); }
  },

  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await portalService.deletePortalUser(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Portal user deleted successfully.');
    } catch (error) { next(error); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await portalService.login(req.body.email, req.body.password);
      ResponseHelper.sendSuccess(req, res, 200, 'Login successful.', result);
    } catch (error) { next(error); }
  },

  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await portalService.register(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Registration successful.', user);
    } catch (error) { next(error); }
  },

  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await portalService.getProfile(req.user?.id || '');
      ResponseHelper.sendSuccess(req, res, 200, 'Profile retrieved successfully.', user);
    } catch (error) { next(error); }
  },
};

export default portalController;
