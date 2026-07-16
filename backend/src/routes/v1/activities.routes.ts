import { Router } from 'express';
import { prisma } from '../../database/db';
import { ResponseHelper } from '../../helpers/response';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { z } from 'zod';
import { validateRequest } from '../../middlewares/validate';

const router = Router();

router.use(requireAuth);

const createGlobalActivitySchema = z.object({
  body: z.object({
    companyId: z.string().uuid('Invalid company ID'),
    type: z.enum(['Call', 'Meeting', 'Email', 'WhatsApp']),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    activityDate: z.string(),
    status: z.enum(['Planned', 'Completed', 'Cancelled']).default('Planned'),
    priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  }),
});

// GET all activities
router.get('/', requirePermission('companies:view'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.companyActivity.findMany({
        where: { deletedAt: null },
        include: {
          company: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { activityDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.companyActivity.count({
        where: { deletedAt: null },
      }),
    ]);

    ResponseHelper.sendSuccess(req, res, 200, 'Global activities retrieved successfully.', items, {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// POST global activity
router.post('/', requirePermission('companies:edit'), validateRequest(createGlobalActivitySchema), async (req, res, next) => {
  try {
    const { companyId, type, title, description, activityDate, status, priority } = req.body;

    const activity = await prisma.companyActivity.create({
      data: {
        companyId,
        type,
        title,
        description,
        activityDate: new Date(activityDate),
        status,
        priority,
        createdBy: req.user?.id as string,
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    ResponseHelper.sendSuccess(req, res, 201, 'Activity logged successfully.', activity);
  } catch (error) {
    next(error);
  }
});

// DELETE activity
router.delete('/:id', requirePermission('companies:edit'), async (req, res, next) => {
  try {
    await prisma.companyActivity.update({
      where: { id: req.params.id as string },
      data: { deletedAt: new Date(), deletedBy: req.user?.id as string },
    });
    ResponseHelper.sendSuccess(req, res, 200, 'Activity deleted successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
