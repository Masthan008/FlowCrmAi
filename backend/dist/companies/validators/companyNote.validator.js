"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyNoteSchema = exports.createCompanyNoteSchema = void 0;
const zod_1 = require("zod");
exports.createCompanyNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Note content is required').max(10000),
        title: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        isPinned: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.updateCompanyNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Note content is required').max(10000),
        title: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        isPinned: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID'), noteId: zod_1.z.string().uuid('Invalid note ID') }),
    query: zod_1.z.object({}).optional(),
});
