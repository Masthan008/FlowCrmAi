import { Router } from 'express';
import { companyController } from '../controller/company.controller';
import { companyNoteController } from '../controller/companyNote.controller';
import { companyActivityController } from '../controller/companyActivity.controller';
import { companyFileController } from '../controller/companyFile.controller';
import { companyTimelineController } from '../controller/companyTimeline.controller';
import { companyHistoryController } from '../controller/companyHistory.controller';
import { branchController } from '../controller/branch.controller';
import { departmentController } from '../controller/department.controller';
import { hierarchyController } from '../controller/hierarchy.controller';
import { businessNetworkController } from '../controller/businessNetwork.controller';
import { revenueController } from '../controller/revenue.controller';
import { customerJourneyController } from '../controller/customerJourney.controller';
import { companyRelatedDataController } from '../controller/companyRelatedData.controller';
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
import {
  createBranchSchema, updateBranchSchema,
} from '../validators/branch.validator';
import {
  createDepartmentSchema, updateDepartmentSchema,
} from '../validators/department.validator';
import {
  createBusinessNetworkSchema, updateBusinessNetworkSchema,
} from '../validators/businessNetwork.validator';

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

// === PHASE 6: Enterprise Company Relationship Management ===

// Hierarchy
router.get('/:id/hierarchy', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), hierarchyController.list);
router.get('/:id/hierarchy/tree', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), hierarchyController.getTree);
router.post('/:id/hierarchy', requirePermission('companies:edit'), validateRequest(getCompanyByIdSchema), logActivity('companies', 'HIERARCHY_CREATED'), hierarchyController.create);
router.delete('/:id/hierarchy/:entryId', requirePermission('companies:edit'), logActivity('companies', 'HIERARCHY_DELETED'), hierarchyController.delete);

// Branches
router.get('/:id/branches', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), branchController.list);
router.get('/:id/branches/:branchId', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), branchController.getById);
router.post('/:id/branches', requirePermission('companies:edit'), validateRequest(createBranchSchema), logActivity('companies', 'BRANCH_CREATED'), branchController.create);
router.put('/:id/branches/:branchId', requirePermission('companies:edit'), validateRequest(updateBranchSchema), logActivity('companies', 'BRANCH_UPDATED'), branchController.update);
router.delete('/:id/branches/:branchId', requirePermission('companies:edit'), logActivity('companies', 'BRANCH_DELETED'), branchController.delete);

// Departments
router.get('/:id/departments', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), departmentController.list);
router.post('/:id/departments', requirePermission('companies:edit'), validateRequest(createDepartmentSchema), logActivity('companies', 'DEPARTMENT_CREATED'), departmentController.create);
router.put('/:id/departments/:deptId', requirePermission('companies:edit'), validateRequest(updateDepartmentSchema), logActivity('companies', 'DEPARTMENT_UPDATED'), departmentController.update);
router.delete('/:id/departments/:deptId', requirePermission('companies:edit'), logActivity('companies', 'DEPARTMENT_DELETED'), departmentController.delete);

// Contacts (company contacts)
router.get('/:id/contacts', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getContacts);

// Leads
router.get('/:id/leads', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getLeads);
router.get('/:id/leads/summary', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getLeadsSummary);

// Deals
router.get('/:id/deals', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getDeals);
router.get('/:id/deals/summary', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getDealsSummary);

// Quotes
router.get('/:id/quotes', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getQuotes);

// Invoices
router.get('/:id/invoices', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getInvoices);

// Payments
router.get('/:id/payments', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getPayments);
router.get('/:id/payments/summary', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), companyRelatedDataController.getPaymentsSummary);

// Revenue
router.get('/:id/revenue', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), revenueController.list);
router.get('/:id/revenue/summary', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), revenueController.getSummary);
router.get('/:id/revenue/dashboard', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), revenueController.getDashboard);
router.post('/:id/revenue', requirePermission('companies:edit'), validateRequest(getCompanyByIdSchema), logActivity('companies', 'REVENUE_ADDED'), revenueController.create);
router.delete('/:id/revenue/:entryId', requirePermission('companies:edit'), logActivity('companies', 'REVENUE_DELETED'), revenueController.delete);

// Business Network
router.get('/:id/business-network', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), businessNetworkController.list);
router.get('/:id/business-network/grouped', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), businessNetworkController.getGrouped);
router.post('/:id/business-network', requirePermission('companies:edit'), validateRequest(createBusinessNetworkSchema), logActivity('companies', 'NETWORK_ADDED'), businessNetworkController.create);
router.put('/:id/business-network/:entryId', requirePermission('companies:edit'), validateRequest(updateBusinessNetworkSchema), logActivity('companies', 'NETWORK_UPDATED'), businessNetworkController.update);
router.delete('/:id/business-network/:entryId', requirePermission('companies:edit'), logActivity('companies', 'NETWORK_REMOVED'), businessNetworkController.delete);

// Customer Journey
router.get('/:id/customer-journey', requirePermission('companies:view'), validateRequest(getCompanyByIdSchema), customerJourneyController.list);
router.post('/:id/customer-journey', requirePermission('companies:edit'), validateRequest(getCompanyByIdSchema), logActivity('companies', 'JOURNEY_ADDED'), customerJourneyController.create);
router.delete('/:id/customer-journey/:entryId', requirePermission('companies:edit'), logActivity('companies', 'JOURNEY_REMOVED'), customerJourneyController.delete);

export default router;
