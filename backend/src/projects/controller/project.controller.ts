import { Request, Response, NextFunction } from 'express';
import { projectService } from '../service/project.service';
import { ResponseHelper } from '../../helpers/response';

export const projectController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const ownerId = req.query.ownerId as string;

      const result = await projectService.getProjects({ page, limit, search, status, priority, ownerId });
      ResponseHelper.sendSuccess(req, res, 200, 'Projects retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectService.getProjectById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Project details retrieved successfully.', project);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectService.createProject(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Project created successfully.', project);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectService.updateProject(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Project updated successfully.', project);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await projectService.deleteProject(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Project deleted successfully.');
    } catch (error) { next(error); }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectService.updateProjectStatus(req.params.id as string, req.body.status, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Project status updated successfully.', project);
    } catch (error) { next(error); }
  },

  getMilestones: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const milestones = await projectService.getProjectMilestones(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Milestones retrieved successfully.', milestones);
    } catch (error) { next(error); }
  },

  createMilestone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const milestone = await projectService.createProjectMilestone(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Milestone created successfully.', milestone);
    } catch (error) { next(error); }
  },

  updateMilestone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const milestone = await projectService.updateProjectMilestone(req.params.id as string, req.params.milestoneId as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Milestone updated successfully.', milestone);
    } catch (error) { next(error); }
  },

  deleteMilestone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await projectService.deleteProjectMilestone(req.params.id as string, req.params.milestoneId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Milestone deleted successfully.');
    } catch (error) { next(error); }
  },

  getTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const team = await projectService.getProjectTeam(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Team members retrieved successfully.', team);
    } catch (error) { next(error); }
  },

  addTeamMember: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const member = await projectService.addProjectTeamMember(req.params.id as string, req.body.employeeId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Team member added successfully.', member);
    } catch (error) { next(error); }
  },

  removeTeamMember: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await projectService.removeProjectTeamMember(req.params.id as string, req.params.memberId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Team member removed successfully.');
    } catch (error) { next(error); }
  },
};

export default projectController;
