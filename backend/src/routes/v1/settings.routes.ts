import { Router } from 'express';
import { ResponseHelper } from '../../helpers/response';
import { requireAuth } from '../../middlewares/auth';
import { settingsRepository } from '../../settings/repository/settings.repository';

const router = Router();

router.use(requireAuth);

// GET workspace settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await settingsRepository.getSettings();
    ResponseHelper.sendSuccess(req, res, 200, 'System settings retrieved successfully', settings);
  } catch (error) {
    next(error);
  }
});

// PUT update workspace settings
router.put('/', async (req, res, next) => {
  try {
    const updated = await settingsRepository.updateSettings(req.body);
    ResponseHelper.sendSuccess(req, res, 200, 'System settings updated successfully', updated);
  } catch (error) {
    next(error);
  }
});

export default router;
