"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const project_service_1 = require("../service/project.service");
const response_1 = require("../../helpers/response");
exports.projectController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const priority = req.query.priority;
            const ownerId = req.query.ownerId;
            const result = await project_service_1.projectService.getProjects({ page, limit, search, status, priority, ownerId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Projects retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const project = await project_service_1.projectService.getProjectById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Project details retrieved successfully.', project);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const project = await project_service_1.projectService.createProject(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Project created successfully.', project);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const project = await project_service_1.projectService.updateProject(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Project updated successfully.', project);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await project_service_1.projectService.deleteProject(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Project deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    updateStatus: async (req, res, next) => {
        try {
            const project = await project_service_1.projectService.updateProjectStatus(req.params.id, req.body.status, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Project status updated successfully.', project);
        }
        catch (error) {
            next(error);
        }
    },
    getMilestones: async (req, res, next) => {
        try {
            const milestones = await project_service_1.projectService.getProjectMilestones(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Milestones retrieved successfully.', milestones);
        }
        catch (error) {
            next(error);
        }
    },
    createMilestone: async (req, res, next) => {
        try {
            const milestone = await project_service_1.projectService.createProjectMilestone(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Milestone created successfully.', milestone);
        }
        catch (error) {
            next(error);
        }
    },
    updateMilestone: async (req, res, next) => {
        try {
            const milestone = await project_service_1.projectService.updateProjectMilestone(req.params.id, req.params.milestoneId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Milestone updated successfully.', milestone);
        }
        catch (error) {
            next(error);
        }
    },
    deleteMilestone: async (req, res, next) => {
        try {
            await project_service_1.projectService.deleteProjectMilestone(req.params.id, req.params.milestoneId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Milestone deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getTeam: async (req, res, next) => {
        try {
            const team = await project_service_1.projectService.getProjectTeam(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Team members retrieved successfully.', team);
        }
        catch (error) {
            next(error);
        }
    },
    addTeamMember: async (req, res, next) => {
        try {
            const member = await project_service_1.projectService.addProjectTeamMember(req.params.id, req.body.employeeId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Team member added successfully.', member);
        }
        catch (error) {
            next(error);
        }
    },
    removeTeamMember: async (req, res, next) => {
        try {
            await project_service_1.projectService.removeProjectTeamMember(req.params.id, req.params.memberId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Team member removed successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.projectController;
