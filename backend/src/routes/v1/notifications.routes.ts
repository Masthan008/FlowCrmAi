import { Router } from 'express';
import { prisma } from '../../database/db';
import { ResponseHelper } from '../../helpers/response';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

// GET all notifications for logged-in user
router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user?.id as string,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    ResponseHelper.sendSuccess(req, res, 200, 'Notifications retrieved successfully.', notifications);
  } catch (error) {
    next(error);
  }
});

// PUT mark notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: {
        id: req.params.id as string,
        userId: req.user?.id as string,
      },
      data: {
        readAt: new Date(),
        updatedBy: req.user?.id as string,
      },
    });

    ResponseHelper.sendSuccess(req, res, 200, 'Notification marked as read successfully.');
  } catch (error) {
    next(error);
  }
});

// PUT mark all notifications as read
router.put('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user?.id as string,
        readAt: null,
        deletedAt: null,
      },
      data: {
        readAt: new Date(),
        updatedBy: req.user?.id as string,
      },
    });

    ResponseHelper.sendSuccess(req, res, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
});

// DELETE single notification
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        id: req.params.id as string,
        userId: req.user?.id as string,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: req.user?.id as string,
      },
    });

    ResponseHelper.sendSuccess(req, res, 200, 'Notification deleted successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
