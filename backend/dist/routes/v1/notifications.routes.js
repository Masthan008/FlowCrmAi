"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const response_1 = require("../../helpers/response");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// GET all notifications for logged-in user
router.get('/', async (req, res, next) => {
    try {
        const notifications = await db_1.prisma.notification.findMany({
            where: {
                userId: req.user?.id,
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Notifications retrieved successfully.', notifications);
    }
    catch (error) {
        next(error);
    }
});
// PUT mark notification as read
router.put('/:id/read', async (req, res, next) => {
    try {
        const updated = await db_1.prisma.notification.updateMany({
            where: {
                id: req.params.id,
                userId: req.user?.id,
            },
            data: {
                readAt: new Date(),
                updatedBy: req.user?.id,
            },
        });
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Notification marked as read successfully.');
    }
    catch (error) {
        next(error);
    }
});
// PUT mark all notifications as read
router.put('/read-all', async (req, res, next) => {
    try {
        await db_1.prisma.notification.updateMany({
            where: {
                userId: req.user?.id,
                readAt: null,
                deletedAt: null,
            },
            data: {
                readAt: new Date(),
                updatedBy: req.user?.id,
            },
        });
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'All notifications marked as read.');
    }
    catch (error) {
        next(error);
    }
});
// DELETE single notification
router.delete('/:id', async (req, res, next) => {
    try {
        await db_1.prisma.notification.updateMany({
            where: {
                id: req.params.id,
                userId: req.user?.id,
            },
            data: {
                deletedAt: new Date(),
                deletedBy: req.user?.id,
            },
        });
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Notification deleted successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
