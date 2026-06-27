import { Router } from 'express';
import { companyController } from '../controller/company.controller';
import { companyNoteController } from '../controller/companyNote.controller';
import { companyActivityController } from '../controller/companyActivity.controller';
import { companyFileController } from '../controller/companyFile.controller';
import { companyTimelineController } from '../controller/companyTimeline.controller';
import { companyHistoryController } from '../controller/companyHistory.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';
import { upload } from '../../middlewares/upload';
import {
  createCompanySchema, updateCompanySchema, updateStatusSchema,
  updateOwnerSchema, listCompaniesSchema, getCompanyByIdSchema,
} from '../validators/company.validator';
import {
  createCompanyNoteSchema, updateCompanyNoteSchema,
} from '../validators/companyNote.validator';
import {
  createCompanyActivitySchema, updateCompanyActivitySchema,
} from '../validators/companyActivity.validator';

const router = Router();

router.use(requireAuth);

router.get('/statistics', requirePermission('companies:view'), companyController.getStatistics);
router.get('/employees', requirePermission('companies:view'), companyController.getEmployees);

router.get('/', requirePermission('companies:view'), validateRequest(listCompaniesSchema), companyController.list);
router.get('/:id', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyController.getById);
router.post('/', requirePermission('companies:create'), validateRequest(createCompanySchema), logActivity('companies', 'COMPANY_CREATED'), companyController.create);
router.put('/:id', requirePermission('companies:edit'), validateRequest(updateCompanySchema), logActivity('companies', 'COMPANY_UPDATED'), companyController.update);
router.delete('/:id', requirePermission('companies:delete'), validateRequest(getCompanyByIdSchema), logActivity('companies', 'COMPANY_DELETED'), companyController.delete);
router.patch('/status', requirePermission('companies:edit'), validateRequest(updateStatusSchema), logActivity('companies', 'COMPANY_STATUS_UPDATED'), companyController.bulkUpdateStatus);
router.patch('/owner', requirePermission('companies:assign'), logActivity('companies', 'COMPANY_OWNER_UPDATED'), companyController.bulkUpdateOwner);

// 360 Workspace: Timeline
router.get('/:id/timeline', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyTimelineController.list);

// 360 Workspace: Activities
router.get('/:id/activities', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyActivityController.list);
router.post('/:id/activities', requirePermission('companies:activities:create'), validateRequest(createCompanyActivitySchema), logActivity('companies', 'ACTIVITY_CREATED'), companyActivityController.create);
router.put('/:id/activities/:activityId', requirePermission('companies:activities:edit'), validateRequest(updateCompanyActivitySchema), logActivity('companies', 'ACTIVITY_UPDATED'), companyActivityController.update);
router.delete('/:id/activities/:activityId', requirePermission('companies:activities:delete'), logActivity('companies', 'ACTIVITY_DELETED'), companyActivityController.delete);

// 360 Workspace: Notes
router.get('/:id/notes', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyNoteController.list);
router.post('/:id/notes', requirePermission('companies:notes:create'), validateRequest(createCompanyNoteSchema), logActivity('companies', 'NOTE_ADDED'), companyNoteController.create);
router.put('/:id/notes/:noteId', requirePermission('companies:notes:edit'), validateRequest(updateCompanyNoteSchema), logActivity('companies', 'NOTE_UPDATED'), companyNoteController.update);
router.delete('/:id/notes/:noteId', requirePermission('companies:notes:delete'), logActivity('companies', 'NOTE_DELETED'), companyNoteController.delete);

// 360 Workspace: Files
router.get('/:id/files', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyFileController.list);
router.get('/:id/files/summary', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyFileController.getStorageSummary);
router.post('/:id/files', requirePermission('companies:files:upload'), upload.single('file'), logActivity('companies', 'FILE_UPLOADED'), companyFileController.create);
router.delete('/:id/files/:fileId', requirePermission('companies:files:delete'), logActivity('companies', 'FILE_DELETED'), companyFileController.delete);

// 360 Workspace: History
router.get('/:id/history', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyHistoryController.list);

export default router;
