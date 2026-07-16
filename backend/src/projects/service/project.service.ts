import { projectRepository } from '../repository/project.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const projectService = {
  getProjects: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    ownerId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
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
      projectRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      projectRepository.count(where),
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

  getProjectById: async (id: string) => {
    const project = await projectRepository.findById(id);
    if (!project || project.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return project;
  },

  createProject: async (
    data: {
      name: string;
      description?: string;
      status?: string;
      priority?: string;
      ownerId?: string;
      startDate?: string;
      endDate?: string;
      budget?: number;
    },
    userId?: string
  ) => {
    return projectRepository.create({
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdBy: userId || null,
    });
  },

  updateProject: async (
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      status: string;
      priority: string;
      ownerId: string;
      startDate: string;
      endDate: string | null;
      budget: number;
    }>,
    userId?: string
  ) => {
    const existing = await projectRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    return projectRepository.update(id, updateData);
  },

  deleteProject: async (id: string, userId?: string) => {
    const existing = await projectRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return projectRepository.softDelete(id, userId);
  },

  updateProjectStatus: async (id: string, status: string, userId?: string) => {
    const existing = await projectRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return projectRepository.update(id, { status, updatedBy: userId || null });
  },

  getProjectMilestones: async (id: string) => {
    const project = await projectRepository.findById(id);
    if (!project || project.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return prisma.projectMilestone.findMany({
      where: { projectId: id, deletedAt: null },
      orderBy: { dueDate: 'asc' },
    });
  },

  createProjectMilestone: async (
    projectId: string,
    data: { name: string; description?: string; dueDate?: string; status?: string },
    userId?: string
  ) => {
    const project = await projectRepository.findById(projectId);
    if (!project || project.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return prisma.projectMilestone.create({
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

  updateProjectMilestone: async (
    projectId: string,
    milestoneId: string,
    data: { name?: string; description?: string | null; dueDate?: string; status?: string },
    userId?: string
  ) => {
    const milestone = await prisma.projectMilestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.deletedAt || milestone.projectId !== projectId) {
      throw Object.assign(new Error('Milestone not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

    return prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });
  },

  deleteProjectMilestone: async (projectId: string, milestoneId: string, userId?: string) => {
    const milestone = await prisma.projectMilestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.deletedAt || milestone.projectId !== projectId) {
      throw Object.assign(new Error('Milestone not found'), { statusCode: 404 });
    }
    return prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },

  getProjectTeam: async (id: string) => {
    const project = await projectRepository.findById(id);
    if (!project || project.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }
    return prisma.projectTeamMember.findMany({
      where: { projectId: id, deletedAt: null },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  },

  addProjectTeamMember: async (projectId: string, employeeId: string, userId?: string) => {
    const project = await projectRepository.findById(projectId);
    if (!project || project.deletedAt) {
      throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
    }

    return prisma.projectTeamMember.create({
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

  removeProjectTeamMember: async (projectId: string, memberId: string, userId?: string) => {
    const member = await prisma.projectTeamMember.findUnique({ where: { id: memberId } });
    if (!member || member.deletedAt || member.projectId !== projectId) {
      throw Object.assign(new Error('Team member not found'), { statusCode: 404 });
    }
    return prisma.projectTeamMember.update({
      where: { id: memberId },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },
};

export default projectService;
