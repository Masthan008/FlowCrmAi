import { Request, Response, NextFunction } from 'express';
import { departmentService } from '../service/department.service';
import { ResponseHelper } from '../../helpers/response';

export const departmentController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const departments = await departmentService.getDepartments(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Departments retrieved successfully.', departments);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dept = await departmentService.createDepartment(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Department created successfully.', dept);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dept = await departmentService.updateDepartment(req.params.deptId as string, req.body, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Department updated successfully.', dept);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await departmentService.deleteDepartment(req.params.deptId as string, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Department deleted successfully.');
    } catch (error) { next(error); }
  },
};
