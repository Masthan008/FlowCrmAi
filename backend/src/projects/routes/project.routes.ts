import { Router } from 'express';
import { projectController } from '../controller/project.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { createProjectSchema, updateProjectSchema, createMilestoneSchema, updateMilestoneSchema } from '../validators/project.validator';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('projects:view'), projectController.list);
router.get('/:id', requirePermission('projects:view'), projectController.getById);
router.post('/', requirePermission('projects:create'), validateRequest(createProjectSchema), projectController.create);
router.put('/:id', requirePermission('projects:edit'), validateRequest(updateProjectSchema), projectController.update);
router.delete('/:id', requirePermission('projects:delete'), projectController.delete);
router.patch('/:id/status', requirePermission('projects:edit'), projectController.updateStatus);
router.get('/:id/milestones', requirePermission('projects:view'), projectController.getMilestones);
router.post('/:id/milestones', requirePermission('projects:create'), validateRequest(createMilestoneSchema), projectController.createMilestone);
router.put('/:id/milestones/:milestoneId', requirePermission('projects:edit'), validateRequest(updateMilestoneSchema), projectController.updateMilestone);
router.delete('/:id/milestones/:milestoneId', requirePermission('projects:delete'), projectController.deleteMilestone);
router.get('/:id/team', requirePermission('projects:view'), projectController.getTeam);
router.post('/:id/team', requirePermission('projects:create'), projectController.addTeamMember);
router.delete('/:id/team/:memberId', requirePermission('projects:delete'), projectController.removeTeamMember);

export default router;
