import { Router } from 'express';
import { ResponseHelper } from '../../helpers/response';
import { requireAuth } from '../../middlewares/auth';
import { roleRepository } from '../../settings/repository/role.repository';

const router = Router();

router.use(requireAuth);

// GET list roles
router.get('/', async (req, res, next) => {
  try {
    const roles = await roleRepository.listRoles();
    ResponseHelper.sendSuccess(req, res, 200, 'Roles retrieved successfully', roles);
  } catch (error) {
    next(error);
  }
});

// GET single role
router.get('/:id', async (req, res, next) => {
  try {
    const role = await roleRepository.getRoleById(req.params.id as string);
    if (!role) {
      return ResponseHelper.sendError(req, res, 404, 'Role not found');
    }
    ResponseHelper.sendSuccess(req, res, 200, 'Role details retrieved', role);
  } catch (error) {
    next(error);
  }
});

// POST create role
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return ResponseHelper.sendError(req, res, 400, 'Role name is required');
    }
    const role = await roleRepository.createRole({ name, description });
    ResponseHelper.sendSuccess(req, res, 201, 'Role created successfully', role);
  } catch (error) {
    next(error);
  }
});

// PUT update role
router.put('/:id', async (req, res, next) => {
  try {
    const role = await roleRepository.updateRole(req.params.id as string, req.body);
    ResponseHelper.sendSuccess(req, res, 200, 'Role updated successfully', role);
  } catch (error) {
    next(error);
  }
});

// PUT update role permissions matrix
router.put('/:id/permissions', async (req, res, next) => {
  try {
    const { permissionIds } = req.body;
    if (!Array.isArray(permissionIds)) {
      return ResponseHelper.sendError(req, res, 400, 'permissionIds must be an array');
    }
    const updated = await roleRepository.updateRolePermissions(req.params.id as string, permissionIds);
    ResponseHelper.sendSuccess(req, res, 200, 'Role permissions updated successfully', updated);
  } catch (error) {
    next(error);
  }
});

// DELETE role
router.delete('/:id', async (req, res, next) => {
  try {
    await roleRepository.deleteRole(req.params.id as string);
    ResponseHelper.sendSuccess(req, res, 200, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
