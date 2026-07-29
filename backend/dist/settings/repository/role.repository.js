"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRepository = exports.RoleRepository = void 0;
const db_1 = require("../../database/db");
class RoleRepository {
    async listRoles() {
        return db_1.prisma.role.findMany({
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
    async getRoleById(id) {
        return db_1.prisma.role.findFirst({
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
    async createRole(data) {
        return db_1.prisma.role.create({
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
    async updateRole(id, data) {
        return db_1.prisma.role.update({
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
    async deleteRole(id) {
        return db_1.prisma.role.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async listPermissions() {
        return db_1.prisma.permission.findMany({
            where: { deletedAt: null },
            orderBy: [{ module: 'asc' }, { action: 'asc' }],
        });
    }
    async updateRolePermissions(roleId, permissionIds) {
        // Transaction to replace all permissions for role
        return db_1.prisma.$transaction(async (tx) => {
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
exports.RoleRepository = RoleRepository;
exports.roleRepository = new RoleRepository();
