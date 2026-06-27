"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadByIdSchema = exports.listLeadsSchema = exports.updateRatingSchema = exports.updatePrioritySchema = exports.updateOwnerSchema = exports.updateStatusSchema = exports.updateLeadSchema = exports.createLeadSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation: Create Lead
 */
exports.createLeadSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required').max(100),
        lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
        email: zod_1.z.string().email('Invalid email format').optional().or(zod_1.z.literal('')),
        phone: zod_1.z
            .string()
            .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
            .optional()
            .or(zod_1.z.literal('')),
        alternatePhone: zod_1.z
            .string()
            .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
            .optional()
            .or(zod_1.z.literal('')),
        companyName: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        jobTitle: zod_1.z.string().max(150).optional().or(zod_1.z.literal('')),
        industry: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        website: zod_1.z
            .string()
            .url('Invalid website URL')
            .optional()
            .or(zod_1.z.literal('')),
        address: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        city: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        state: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        country: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        postalCode: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        sourceId: zod_1.z.string().uuid('Invalid source ID').optional().or(zod_1.z.literal('')),
        statusId: zod_1.z.string().uuid('Invalid status ID').optional().or(zod_1.z.literal('')),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        priority: zod_1.z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
        rating: zod_1.z.number().int().min(0).max(5).optional(),
        value: zod_1.z.number().min(0).optional(),
        expectedClosingDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(5000).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: Update Lead
 */
exports.updateLeadSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1).max(100).optional(),
        lastName: zod_1.z.string().min(1).max(100).optional(),
        email: zod_1.z.string().email('Invalid email format').optional().or(zod_1.z.literal('')),
        phone: zod_1.z
            .string()
            .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
            .optional()
            .or(zod_1.z.literal('')),
        alternatePhone: zod_1.z
            .string()
            .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
            .optional()
            .or(zod_1.z.literal('')),
        companyName: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        jobTitle: zod_1.z.string().max(150).optional().or(zod_1.z.literal('')),
        industry: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        website: zod_1.z
            .string()
            .url('Invalid website URL')
            .optional()
            .or(zod_1.z.literal('')),
        address: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        city: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        state: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        country: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        postalCode: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        sourceId: zod_1.z.string().uuid('Invalid source ID').optional().or(zod_1.z.literal('')),
        statusId: zod_1.z.string().uuid('Invalid status ID').optional().or(zod_1.z.literal('')),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        priority: zod_1.z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
        rating: zod_1.z.number().int().min(0).max(5).optional(),
        value: zod_1.z.number().min(0).optional(),
        expectedClosingDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(5000).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: Update Status
 */
exports.updateStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        statusId: zod_1.z.string().uuid('Invalid status ID'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: Update Owner
 */
exports.updateOwnerSchema = zod_1.z.object({
    body: zod_1.z.object({
        assignedToId: zod_1.z.string().uuid('Invalid owner ID'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: Update Priority
 */
exports.updatePrioritySchema = zod_1.z.object({
    body: zod_1.z.object({
        priority: zod_1.z.enum(['Critical', 'High', 'Medium', 'Low']),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: Update Rating
 */
exports.updateRatingSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number().int().min(0).max(5),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: List Leads Query Params
 */
exports.listLeadsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).optional(),
        search: zod_1.z.string().optional(),
        status: zod_1.z.string().uuid().optional(),
        source: zod_1.z.string().uuid().optional(),
        priority: zod_1.z.string().optional(),
        owner: zod_1.z.string().uuid().optional(),
        sortBy: zod_1.z.string().optional(),
        sortDir: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
/**
 * Validation: Get by ID param
 */
exports.getLeadByIdSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
