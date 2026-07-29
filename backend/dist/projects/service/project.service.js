"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const project_repository_1 = require("../repository/project.repository");
const db_1 = require("../../database/db");
exports.projectService = {
    getProjects: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.name = { contains: params.search, mode: 'insensitive' };
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.priority) {
            where.priority = params.priority;
        }
        if (params.ownerId) {
            where.ownerId = params.ownerId;
        }
        const [items, total] = await Promise.all([
            project_repository_1.projectRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            project_repository_1.projectRepository.count(where),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },
    getProjectById: async (id) => {
        const project = await project_repository_1.projectRepository.findById(id);
        if (!project || project.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        return project;
    },
    createProject: async (data, userId) => {
        return project_repository_1.projectRepository.create({
            ...data,
            code: `PRJ-${Date.now()}`,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            createdBy: userId || null,
        });
    },
    updateProject: async (id, data, userId) => {
        const existing = await project_repository_1.projectRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.startDate)
            updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined)
            updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        return project_repository_1.projectRepository.update(id, updateData);
    },
    deleteProject: async (id, userId) => {
        const existing = await project_repository_1.projectRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        return project_repository_1.projectRepository.softDelete(id, userId);
    },
    updateProjectStatus: async (id, status, userId) => {
        const existing = await project_repository_1.projectRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        return project_repository_1.projectRepository.update(id, { status, updatedBy: userId || null });
    },
    getProjectMilestones: async (id) => {
        const project = await project_repository_1.projectRepository.findById(id);
        if (!project || project.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        return db_1.prisma.projectMilestone.findMany({
            where: { projectId: id, deletedAt: null },
            orderBy: { dueDate: 'asc' },
        });
    },
    createProjectMilestone: async (projectId, data, userId) => {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project || project.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        return db_1.prisma.projectMilestone.create({
            data: {
                projectId,
                name: data.name,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                status: data.status,
                createdBy: userId || null,
            },
        });
    },
    updateProjectMilestone: async (projectId, milestoneId, data, userId) => {
        const milestone = await db_1.prisma.projectMilestone.findUnique({ where: { id: milestoneId } });
        if (!milestone || milestone.deletedAt || milestone.projectId !== projectId) {
            throw Object.assign(new Error('Milestone not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.dueDate)
            updateData.dueDate = new Date(data.dueDate);
        return db_1.prisma.projectMilestone.update({
            where: { id: milestoneId },
            data: updateData,
        });
    },
    deleteProjectMilestone: async (projectId, milestoneId, userId) => {
        const milestone = await db_1.prisma.projectMilestone.findUnique({ where: { id: milestoneId } });
        if (!milestone || milestone.deletedAt || milestone.projectId !== projectId) {
            throw Object.assign(new Error('Milestone not found'), { statusCode: 404 });
        }
        return db_1.prisma.projectMilestone.update({
            where: { id: milestoneId },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
    getProjectTeam: async (id) => {
        const project = await project_repository_1.projectRepository.findById(id);
        if (!project || project.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        return db_1.prisma.projectTeamMember.findMany({
            where: { projectId: id, deletedAt: null },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    },
    addProjectTeamMember: async (projectId, employeeId, userId) => {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project || project.deletedAt) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        const employee = await db_1.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) {
            throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
        }
        return db_1.prisma.projectTeamMember.create({
            data: {
                projectId,
                employeeId,
                createdBy: userId || null,
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    },
    removeProjectTeamMember: async (projectId, memberId, userId) => {
        const member = await db_1.prisma.projectTeamMember.findUnique({ where: { id: memberId } });
        if (!member || member.deletedAt || member.projectId !== projectId) {
            throw Object.assign(new Error('Team member not found'), { statusCode: 404 });
        }
        return db_1.prisma.projectTeamMember.update({
            where: { id: memberId },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
};
exports.default = exports.projectService;
