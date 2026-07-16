"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const response_1 = require("../../helpers/response");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const zod_1 = require("zod");
const validate_1 = require("../../middlewares/validate");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const createGlobalActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        companyId: zod_1.z.string().uuid('Invalid company ID'),
        type: zod_1.z.enum(['Call', 'Meeting', 'Email', 'WhatsApp']),
        title: zod_1.z.string().min(1, 'Title is required').max(200),
        description: zod_1.z.string().max(2000).optional(),
        activityDate: zod_1.z.string(),
        status: zod_1.z.enum(['Planned', 'Completed', 'Cancelled']).default('Planned'),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).default('Medium'),
    }),
});
// GET all activities
router.get('/', (0, permission_1.requirePermission)('companies:view'), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            db_1.prisma.companyActivity.findMany({
                where: { deletedAt: null },
                include: {
                    company: { select: { id: true, name: true } },
                    assignedTo: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { activityDate: 'desc' },
                skip,
                take: limit,
            }),
            db_1.prisma.companyActivity.count({
                where: { deletedAt: null },
            }),
        ]);
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Global activities retrieved successfully.', items, {
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        next(error);
    }
});
// POST global activity
router.post('/', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(createGlobalActivitySchema), async (req, res, next) => {
    try {
        const { companyId, type, title, description, activityDate, status, priority } = req.body;
        const activity = await db_1.prisma.companyActivity.create({
            data: {
                companyId,
                type,
                title,
                description,
                activityDate: new Date(activityDate),
                status,
                priority,
                createdBy: req.user?.id,
            },
            include: {
                company: { select: { id: true, name: true } },
            },
        });
        response_1.ResponseHelper.sendSuccess(req, res, 201, 'Activity logged successfully.', activity);
    }
    catch (error) {
        next(error);
    }
});
// DELETE activity
router.delete('/:id', (0, permission_1.requirePermission)('companies:edit'), async (req, res, next) => {
    try {
        await db_1.prisma.companyActivity.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date(), deletedBy: req.user?.id },
        });
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activity deleted successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
