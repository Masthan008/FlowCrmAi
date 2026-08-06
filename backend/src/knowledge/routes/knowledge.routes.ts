import { Router } from 'express';
import { knowledgeController } from '../controller/knowledge.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createArticleSchema, updateArticleSchema, createCategorySchema, updateCategorySchema, voteArticleSchema } from '../validators/knowledge.validator';

const router = Router();

router.use(requireAuth);

router.get('/categories', requirePermission('knowledge:view'), knowledgeController.getCategories);
router.post('/categories', requirePermission('knowledge:create'), validateRequest(createCategorySchema), knowledgeController.createCategory);
router.put('/categories/:id', requirePermission('knowledge:edit'), validateRequest(updateCategorySchema), knowledgeController.updateCategory);
router.delete('/categories/:id', requirePermission('knowledge:delete'), knowledgeController.deleteCategory);

router.get('/articles', requirePermission('knowledge:view'), knowledgeController.list);
router.post('/articles', requirePermission('knowledge:create'), validateRequest(createArticleSchema), knowledgeController.create);
router.get('/articles/:id', requirePermission('knowledge:view'), knowledgeController.getById);
router.put('/articles/:id', requirePermission('knowledge:edit'), validateRequest(updateArticleSchema), knowledgeController.update);
router.delete('/articles/:id', requirePermission('knowledge:delete'), knowledgeController.delete);
router.patch('/articles/:id/publish', requirePermission('knowledge:edit'), knowledgeController.publish);
router.patch('/articles/:id/archive', requirePermission('knowledge:edit'), knowledgeController.archive);
router.post('/articles/:id/vote', requirePermission('knowledge:view'), validateRequest(voteArticleSchema), knowledgeController.vote);

router.get('/', requirePermission('knowledge:view'), knowledgeController.list);
router.get('/:id', requirePermission('knowledge:view'), knowledgeController.getById);
router.post('/', requirePermission('knowledge:create'), validateRequest(createArticleSchema), knowledgeController.create);
router.put('/:id', requirePermission('knowledge:edit'), validateRequest(updateArticleSchema), knowledgeController.update);
router.delete('/:id', requirePermission('knowledge:delete'), knowledgeController.delete);
router.patch('/:id/publish', requirePermission('knowledge:edit'), knowledgeController.publish);
router.patch('/:id/archive', requirePermission('knowledge:edit'), knowledgeController.archive);
router.post('/:id/vote', requirePermission('knowledge:view'), validateRequest(voteArticleSchema), knowledgeController.vote);

export default router;
