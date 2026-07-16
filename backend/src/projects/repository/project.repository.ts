import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class ProjectRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }) {
    return prisma.project.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async count(where?: Prisma.ProjectWhereInput) {
    return prisma.project.count({ where });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async create(data: Prisma.ProjectUncheckedCreateInput) {
    return prisma.project.create({
      data,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ProjectUncheckedUpdateInput) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const projectRepository = new ProjectRepository();
export default projectRepository;
