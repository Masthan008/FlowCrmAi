import { prisma } from '../../database/db';

export class RoleRepository {
  async listRoles() {
    return prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRoleById(id: string) {
    return prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async createRole(data: { name: string; description?: string }) {
    return prisma.role.create({
      data: {
        name: data.name,
        description: data.description || '',
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string }) {
    return prisma.role.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(id: string) {
    return prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async listPermissions() {
    return prisma.permission.findMany({
      where: { deletedAt: null },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    // Transaction to replace all permissions for role
    return prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }
}

export const roleRepository = new RoleRepository();
