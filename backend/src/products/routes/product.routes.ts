import { Router } from 'express';
import { productController } from '../controller/product.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createProductSchema, updateProductSchema, createCategorySchema } from '../validators/product.validator';

const router = Router();

router.use(requireAuth);

// Categories
router.get('/categories', requirePermission('products:view'), productController.listCategories);
router.post('/categories', requirePermission('products:create'), validateRequest(createCategorySchema), productController.createCategory);

// Products
router.get('/', requirePermission('products:view'), productController.list);
router.get('/:id', requirePermission('products:view'), productController.getById);
router.post('/', requirePermission('products:create'), validateRequest(createProductSchema), productController.create);
router.put('/:id', requirePermission('products:edit'), validateRequest(updateProductSchema), productController.update);
router.delete('/:id', requirePermission('products:delete'), productController.delete);

export default router;
