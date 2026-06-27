import { Router } from 'express';
import { companyController } from '../controller/company.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';
import {
  createCompanySchema,
  updateCompanySchema,
  updateStatusSchema,
  updateOwnerSchema,
  listCompaniesSchema,
  getCompanyByIdSchema,
} from '../validators/company.validator';

const router = Router();

router.use(requireAuth);

router.get('/statistics', requirePermission('companies:view'), companyController.getStatistics);
router.get('/employees', requirePermission('companies:view'), companyController.getEmployees);

router.get(
  '/',
  requirePermission('companies:view'),
  validateRequest(listCompaniesSchema),
  companyController.list
);

router.get(
  '/:id',
  requirePermission('companies:view'),
  validateRequest(getCompanyByIdSchema),
  companyController.getById
);

router.post(
  '/',
  requirePermission('companies:create'),
  validateRequest(createCompanySchema),
  logActivity('companies', 'COMPANY_CREATED'),
  companyController.create
);

router.put(
  '/:id',
  requirePermission('companies:edit'),
  validateRequest(updateCompanySchema),
  logActivity('companies', 'COMPANY_UPDATED'),
  companyController.update
);

router.delete(
  '/:id',
  requirePermission('companies:delete'),
  validateRequest(getCompanyByIdSchema),
  logActivity('companies', 'COMPANY_DELETED'),
  companyController.delete
);

router.patch(
  '/status',
  requirePermission('companies:edit'),
  validateRequest(updateStatusSchema),
  logActivity('companies', 'COMPANY_STATUS_UPDATED'),
  companyController.bulkUpdateStatus
);

router.patch(
  '/owner',
  requirePermission('companies:assign'),
  logActivity('companies', 'COMPANY_OWNER_UPDATED'),
  companyController.bulkUpdateOwner
);

export default router;
