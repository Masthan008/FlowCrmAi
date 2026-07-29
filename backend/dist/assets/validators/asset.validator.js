"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignAssetSchema = exports.updateAssetSchema = exports.createAssetSchema = void 0;
const zod_1 = require("zod");
exports.createAssetSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Asset name is required').max(200),
        type: zod_1.z.enum(['Hardware', 'Software', 'License', 'Equipment', 'Vehicle', 'Other']).optional().default('Hardware'),
        serialNumber: zod_1.z.string().max(200).optional().nullable(),
        assetTag: zod_1.z.string().max(200).optional().nullable(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        purchaseDate: zod_1.z.string().datetime('Invalid date format').optional().nullable(),
        purchasePrice: zod_1.z.number().min(0).optional().default(0),
        currentValue: zod_1.z.number().min(0).optional().default(0),
        currency: zod_1.z.string().max(3).optional().default('USD'),
        warrantyExpiry: zod_1.z.string().datetime('Invalid date format').optional().nullable(),
        location: zod_1.z.string().max(500).optional().nullable(),
        vendor: zod_1.z.string().max(200).optional().nullable(),
        notes: zod_1.z.string().max(5000).optional().nullable(),
        tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    }),
});
exports.updateAssetSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Asset name cannot be empty').max(200).optional(),
        type: zod_1.z.enum(['Hardware', 'Software', 'License', 'Equipment', 'Vehicle', 'Other']).optional(),
        serialNumber: zod_1.z.string().max(200).optional().nullable(),
        assetTag: zod_1.z.string().max(200).optional().nullable(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        purchaseDate: zod_1.z.string().datetime('Invalid date format').optional().nullable(),
        purchasePrice: zod_1.z.number().min(0).optional(),
        currentValue: zod_1.z.number().min(0).optional(),
        currency: zod_1.z.string().max(3).optional(),
        warrantyExpiry: zod_1.z.string().datetime('Invalid date format').optional().nullable(),
        location: zod_1.z.string().max(500).optional().nullable(),
        vendor: zod_1.z.string().max(200).optional().nullable(),
        notes: zod_1.z.string().max(5000).optional().nullable(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        status: zod_1.z.string().optional(),
    }),
});
exports.assignAssetSchema = zod_1.z.object({
    body: zod_1.z.object({
        assignedToId: zod_1.z.string().uuid('Invalid employee ID').optional().nullable(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
    }),
});
