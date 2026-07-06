import { Router } from 'express';
import { quoteController } from '../controller/quote.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createQuoteSchema, updateQuoteSchema } from '../validators/quote.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('quotes:view'), quoteController.list);
router.get('/:id', requirePermission('quotes:view'), quoteController.getById);
router.post('/', requirePermission('quotes:create'), validateRequest(createQuoteSchema), quoteController.create);
router.put('/:id', requirePermission('quotes:edit'), validateRequest(updateQuoteSchema), quoteController.update);
router.delete('/:id', requirePermission('quotes:delete'), quoteController.delete);

export default router;
