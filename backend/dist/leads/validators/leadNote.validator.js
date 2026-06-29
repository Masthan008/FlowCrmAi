"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoteSchema = exports.createNoteSchema = void 0;
const zod_1 = require("zod");
exports.createNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Note content is required').max(10000),
        title: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        isPinned: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.updateNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Note content is required').max(10000),
        title: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        isPinned: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
        noteId: zod_1.z.string().uuid('Invalid note ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
