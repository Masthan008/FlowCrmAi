import { Router } from 'express';
import { prisma } from '../../database/db';
import { ResponseHelper } from '../../helpers/response';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { z } from 'zod';
import { validateRequest } from '../../middlewares/validate';

const router = Router();

router.use(requireAuth);

const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    department: z.string().optional(),
    designation: z.string().optional(),
  }),
});

// GET all team members (employees)
router.get('/', requirePermission('companies:view'), async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    ResponseHelper.sendSuccess(req, res, 200, 'Team members retrieved successfully.', employees);
  } catch (error) {
    next(error);
  }
});

// POST register new team member (employee)
router.post('/', requirePermission('companies:edit'), validateRequest(createEmployeeSchema), async (req, res, next) => {
  try {
    const { firstName, lastName, email, department, designation } = req.body;

    const firstCompany = await prisma.company.findFirst({
      where: { deletedAt: null }
    });
    const companyId = firstCompany?.id;

    if (!companyId) {
      throw Object.assign(new Error('No company account exists to assign team member to.'), { statusCode: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        department: department || 'Sales',
        designation: designation || 'Sales Executive',
        companyId,
        createdBy: req.user?.id as string,
      }
    });

    ResponseHelper.sendSuccess(req, res, 201, 'Team member added successfully.', employee);
  } catch (error) {
    next(error);
  }
});

// DELETE team member
router.delete('/:id', requirePermission('companies:edit'), async (req, res, next) => {
  try {
    await prisma.employee.update({
      where: { id: req.params.id as string },
      data: { deletedAt: new Date(), deletedBy: req.user?.id as string }
    });
    ResponseHelper.sendSuccess(req, res, 200, 'Team member removed successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
