"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controller/company.controller");
const companyNote_controller_1 = require("../controller/companyNote.controller");
const companyActivity_controller_1 = require("../controller/companyActivity.controller");
const companyFile_controller_1 = require("../controller/companyFile.controller");
const companyTimeline_controller_1 = require("../controller/companyTimeline.controller");
const companyHistory_controller_1 = require("../controller/companyHistory.controller");
const branch_controller_1 = require("../controller/branch.controller");
const department_controller_1 = require("../controller/department.controller");
const hierarchy_controller_1 = require("../controller/hierarchy.controller");
const businessNetwork_controller_1 = require("../controller/businessNetwork.controller");
const revenue_controller_1 = require("../controller/revenue.controller");
const customerJourney_controller_1 = require("../controller/customerJourney.controller");
const companyRelatedData_controller_1 = require("../controller/companyRelatedData.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const activityLogger_1 = require("../../middlewares/activityLogger");
const upload_1 = require("../../middlewares/upload");
const company_validator_1 = require("../validators/company.validator");
const companyNote_validator_1 = require("../validators/companyNote.validator");
const companyActivity_validator_1 = require("../validators/companyActivity.validator");
const branch_validator_1 = require("../validators/branch.validator");
const department_validator_1 = require("../validators/department.validator");
const businessNetwork_validator_1 = require("../validators/businessNetwork.validator");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/statistics', (0, permission_1.requirePermission)('companies:view'), company_controller_1.companyController.getStatistics);
router.get('/employees', (0, permission_1.requirePermission)('companies:view'), company_controller_1.companyController.getEmployees);
router.get('/', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.listCompaniesSchema), company_controller_1.companyController.list);
router.get('/:id', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), company_controller_1.companyController.getById);
router.post('/', (0, permission_1.requirePermission)('companies:create'), (0, validate_1.validateRequest)(company_validator_1.createCompanySchema), (0, activityLogger_1.logActivity)('companies', 'COMPANY_CREATED'), company_controller_1.companyController.create);
router.put('/:id', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(company_validator_1.updateCompanySchema), (0, activityLogger_1.logActivity)('companies', 'COMPANY_UPDATED'), company_controller_1.companyController.update);
router.delete('/:id', (0, permission_1.requirePermission)('companies:delete'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), (0, activityLogger_1.logActivity)('companies', 'COMPANY_DELETED'), company_controller_1.companyController.delete);
router.patch('/status', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(company_validator_1.updateStatusSchema), (0, activityLogger_1.logActivity)('companies', 'COMPANY_STATUS_UPDATED'), company_controller_1.companyController.bulkUpdateStatus);
router.patch('/owner', (0, permission_1.requirePermission)('companies:assign'), (0, activityLogger_1.logActivity)('companies', 'COMPANY_OWNER_UPDATED'), company_controller_1.companyController.bulkUpdateOwner);
// 360 Workspace: Timeline
router.get('/:id/timeline', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyTimeline_controller_1.companyTimelineController.list);
// 360 Workspace: Activities
router.get('/:id/activities', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyActivity_controller_1.companyActivityController.list);
router.post('/:id/activities', (0, permission_1.requirePermission)('companies:activities:create'), (0, validate_1.validateRequest)(companyActivity_validator_1.createCompanyActivitySchema), (0, activityLogger_1.logActivity)('companies', 'ACTIVITY_CREATED'), companyActivity_controller_1.companyActivityController.create);
router.put('/:id/activities/:activityId', (0, permission_1.requirePermission)('companies:activities:edit'), (0, validate_1.validateRequest)(companyActivity_validator_1.updateCompanyActivitySchema), (0, activityLogger_1.logActivity)('companies', 'ACTIVITY_UPDATED'), companyActivity_controller_1.companyActivityController.update);
router.delete('/:id/activities/:activityId', (0, permission_1.requirePermission)('companies:activities:delete'), (0, activityLogger_1.logActivity)('companies', 'ACTIVITY_DELETED'), companyActivity_controller_1.companyActivityController.delete);
// 360 Workspace: Notes
router.get('/:id/notes', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyNote_controller_1.companyNoteController.list);
router.post('/:id/notes', (0, permission_1.requirePermission)('companies:notes:create'), (0, validate_1.validateRequest)(companyNote_validator_1.createCompanyNoteSchema), (0, activityLogger_1.logActivity)('companies', 'NOTE_ADDED'), companyNote_controller_1.companyNoteController.create);
router.put('/:id/notes/:noteId', (0, permission_1.requirePermission)('companies:notes:edit'), (0, validate_1.validateRequest)(companyNote_validator_1.updateCompanyNoteSchema), (0, activityLogger_1.logActivity)('companies', 'NOTE_UPDATED'), companyNote_controller_1.companyNoteController.update);
router.delete('/:id/notes/:noteId', (0, permission_1.requirePermission)('companies:notes:delete'), (0, activityLogger_1.logActivity)('companies', 'NOTE_DELETED'), companyNote_controller_1.companyNoteController.delete);
// 360 Workspace: Files
router.get('/:id/files', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyFile_controller_1.companyFileController.list);
router.get('/:id/files/summary', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyFile_controller_1.companyFileController.getStorageSummary);
router.post('/:id/files', (0, permission_1.requirePermission)('companies:files:upload'), upload_1.upload.single('file'), (0, activityLogger_1.logActivity)('companies', 'FILE_UPLOADED'), companyFile_controller_1.companyFileController.create);
router.delete('/:id/files/:fileId', (0, permission_1.requirePermission)('companies:files:delete'), (0, activityLogger_1.logActivity)('companies', 'FILE_DELETED'), companyFile_controller_1.companyFileController.delete);
// 360 Workspace: History
router.get('/:id/history', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyHistory_controller_1.companyHistoryController.list);
// === PHASE 6: Enterprise Company Relationship Management ===
// Hierarchy
router.get('/:id/hierarchy', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), hierarchy_controller_1.hierarchyController.list);
router.get('/:id/hierarchy/tree', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), hierarchy_controller_1.hierarchyController.getTree);
router.post('/:id/hierarchy', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), (0, activityLogger_1.logActivity)('companies', 'HIERARCHY_CREATED'), hierarchy_controller_1.hierarchyController.create);
router.delete('/:id/hierarchy/:entryId', (0, permission_1.requirePermission)('companies:edit'), (0, activityLogger_1.logActivity)('companies', 'HIERARCHY_DELETED'), hierarchy_controller_1.hierarchyController.delete);
// Branches
router.get('/:id/branches', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), branch_controller_1.branchController.list);
router.get('/:id/branches/:branchId', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), branch_controller_1.branchController.getById);
router.post('/:id/branches', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(branch_validator_1.createBranchSchema), (0, activityLogger_1.logActivity)('companies', 'BRANCH_CREATED'), branch_controller_1.branchController.create);
router.put('/:id/branches/:branchId', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(branch_validator_1.updateBranchSchema), (0, activityLogger_1.logActivity)('companies', 'BRANCH_UPDATED'), branch_controller_1.branchController.update);
router.delete('/:id/branches/:branchId', (0, permission_1.requirePermission)('companies:edit'), (0, activityLogger_1.logActivity)('companies', 'BRANCH_DELETED'), branch_controller_1.branchController.delete);
// Departments
router.get('/:id/departments', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), department_controller_1.departmentController.list);
router.post('/:id/departments', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(department_validator_1.createDepartmentSchema), (0, activityLogger_1.logActivity)('companies', 'DEPARTMENT_CREATED'), department_controller_1.departmentController.create);
router.put('/:id/departments/:deptId', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(department_validator_1.updateDepartmentSchema), (0, activityLogger_1.logActivity)('companies', 'DEPARTMENT_UPDATED'), department_controller_1.departmentController.update);
router.delete('/:id/departments/:deptId', (0, permission_1.requirePermission)('companies:edit'), (0, activityLogger_1.logActivity)('companies', 'DEPARTMENT_DELETED'), department_controller_1.departmentController.delete);
// Contacts (company contacts)
router.get('/:id/contacts', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getContacts);
// Leads
router.get('/:id/leads', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getLeads);
router.get('/:id/leads/summary', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getLeadsSummary);
// Deals
router.get('/:id/deals', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getDeals);
router.get('/:id/deals/summary', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getDealsSummary);
// Quotes
router.get('/:id/quotes', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getQuotes);
// Invoices
router.get('/:id/invoices', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getInvoices);
// Payments
router.get('/:id/payments', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getPayments);
router.get('/:id/payments/summary', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), companyRelatedData_controller_1.companyRelatedDataController.getPaymentsSummary);
// Revenue
router.get('/:id/revenue', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), revenue_controller_1.revenueController.list);
router.get('/:id/revenue/summary', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), revenue_controller_1.revenueController.getSummary);
router.get('/:id/revenue/dashboard', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), revenue_controller_1.revenueController.getDashboard);
router.post('/:id/revenue', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), (0, activityLogger_1.logActivity)('companies', 'REVENUE_ADDED'), revenue_controller_1.revenueController.create);
router.delete('/:id/revenue/:entryId', (0, permission_1.requirePermission)('companies:edit'), (0, activityLogger_1.logActivity)('companies', 'REVENUE_DELETED'), revenue_controller_1.revenueController.delete);
// Business Network
router.get('/:id/business-network', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), businessNetwork_controller_1.businessNetworkController.list);
router.get('/:id/business-network/grouped', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), businessNetwork_controller_1.businessNetworkController.getGrouped);
router.post('/:id/business-network', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(businessNetwork_validator_1.createBusinessNetworkSchema), (0, activityLogger_1.logActivity)('companies', 'NETWORK_ADDED'), businessNetwork_controller_1.businessNetworkController.create);
router.put('/:id/business-network/:entryId', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(businessNetwork_validator_1.updateBusinessNetworkSchema), (0, activityLogger_1.logActivity)('companies', 'NETWORK_UPDATED'), businessNetwork_controller_1.businessNetworkController.update);
router.delete('/:id/business-network/:entryId', (0, permission_1.requirePermission)('companies:edit'), (0, activityLogger_1.logActivity)('companies', 'NETWORK_REMOVED'), businessNetwork_controller_1.businessNetworkController.delete);
// Customer Journey
router.get('/:id/customer-journey', (0, permission_1.requirePermission)('companies:view'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), customerJourney_controller_1.customerJourneyController.list);
router.post('/:id/customer-journey', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(company_validator_1.getCompanyByIdSchema), (0, activityLogger_1.logActivity)('companies', 'JOURNEY_ADDED'), customerJourney_controller_1.customerJourneyController.create);
router.delete('/:id/customer-journey/:entryId', (0, permission_1.requirePermission)('companies:edit'), (0, activityLogger_1.logActivity)('companies', 'JOURNEY_REMOVED'), customerJourney_controller_1.customerJourneyController.delete);
exports.default = router;
