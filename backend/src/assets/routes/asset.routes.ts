import { Router } from 'express';
import { assetController } from '../controller/asset.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createAssetSchema, updateAssetSchema, assignAssetSchema } from '../validators/asset.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('assets:view'), assetController.list);
router.get('/:id', requirePermission('assets:view'), assetController.getById);
router.post('/', requirePermission('assets:create'), validateRequest(createAssetSchema), assetController.create);
router.put('/:id', requirePermission('assets:edit'), validateRequest(updateAssetSchema), assetController.update);
router.delete('/:id', requirePermission('assets:delete'), assetController.delete);
router.patch('/:id/assign', requirePermission('assets:edit'), validateRequest(assignAssetSchema), assetController.assign);
router.patch('/:id/retire', requirePermission('assets:edit'), assetController.retire);

export default router;
