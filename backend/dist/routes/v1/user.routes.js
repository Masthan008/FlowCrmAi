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
const createEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Invalid email address'),
        department: zod_1.z.string().optional(),
        designation: zod_1.z.string().optional(),
    }),
});
// GET all team members (employees)
router.get('/', (0, permission_1.requirePermission)('companies:view'), async (req, res, next) => {
    try {
        const employees = await db_1.prisma.employee.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Team members retrieved successfully.', employees);
    }
    catch (error) {
        next(error);
    }
});
// POST register new team member (employee)
router.post('/', (0, permission_1.requirePermission)('companies:edit'), (0, validate_1.validateRequest)(createEmployeeSchema), async (req, res, next) => {
    try {
        const { firstName, lastName, email, department, designation } = req.body;
        const firstCompany = await db_1.prisma.company.findFirst({
            where: { deletedAt: null }
        });
        const companyId = firstCompany?.id;
        if (!companyId) {
            throw Object.assign(new Error('No company account exists to assign team member to.'), { statusCode: 400 });
        }
        const employee = await db_1.prisma.employee.create({
            data: {
                firstName,
                lastName,
                email,
                department: department || 'Sales',
                designation: designation || 'Sales Executive',
                companyId,
                createdBy: req.user?.id,
            }
        });
        response_1.ResponseHelper.sendSuccess(req, res, 201, 'Team member added successfully.', employee);
    }
    catch (error) {
        next(error);
    }
});
// DELETE team member
router.delete('/:id', (0, permission_1.requirePermission)('companies:edit'), async (req, res, next) => {
    try {
        await db_1.prisma.employee.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date(), deletedBy: req.user?.id }
        });
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Team member removed successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
