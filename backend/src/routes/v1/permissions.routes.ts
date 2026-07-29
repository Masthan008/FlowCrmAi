import { Router } from 'express';
import { ResponseHelper } from '../../helpers/response';
import { requireAuth } from '../../middlewares/auth';
import { roleRepository } from '../../settings/repository/role.repository';

const router = Router();

router.use(requireAuth);

// GET all available permissions
router.get('/', async (req, res, next) => {
  try {
    const permissions = await roleRepository.listPermissions();
    ResponseHelper.sendSuccess(req, res, 200, 'Permissions retrieved successfully', permissions);
  } catch (error) {
    next(error);
  }
});

export default router;
