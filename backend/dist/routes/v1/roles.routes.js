"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../helpers/response");
const auth_1 = require("../../middlewares/auth");
const role_repository_1 = require("../../settings/repository/role.repository");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// GET list roles
router.get('/', async (req, res, next) => {
    try {
        const roles = await role_repository_1.roleRepository.listRoles();
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Roles retrieved successfully', roles);
    }
    catch (error) {
        next(error);
    }
});
// GET single role
router.get('/:id', async (req, res, next) => {
    try {
        const role = await role_repository_1.roleRepository.getRoleById(req.params.id);
        if (!role) {
            return response_1.ResponseHelper.sendError(req, res, 404, 'Role not found');
        }
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Role details retrieved', role);
    }
    catch (error) {
        next(error);
    }
});
// POST create role
router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return response_1.ResponseHelper.sendError(req, res, 400, 'Role name is required');
        }
        const role = await role_repository_1.roleRepository.createRole({ name, description });
        response_1.ResponseHelper.sendSuccess(req, res, 201, 'Role created successfully', role);
    }
    catch (error) {
        next(error);
    }
});
// PUT update role
router.put('/:id', async (req, res, next) => {
    try {
        const role = await role_repository_1.roleRepository.updateRole(req.params.id, req.body);
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Role updated successfully', role);
    }
    catch (error) {
        next(error);
    }
});
// PUT update role permissions matrix
router.put('/:id/permissions', async (req, res, next) => {
    try {
        const { permissionIds } = req.body;
        if (!Array.isArray(permissionIds)) {
            return response_1.ResponseHelper.sendError(req, res, 400, 'permissionIds must be an array');
        }
        const updated = await role_repository_1.roleRepository.updateRolePermissions(req.params.id, permissionIds);
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Role permissions updated successfully', updated);
    }
    catch (error) {
        next(error);
    }
});
// DELETE role
router.delete('/:id', async (req, res, next) => {
    try {
        await role_repository_1.roleRepository.deleteRole(req.params.id);
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Role deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
