import { z } from 'zod';

const priorityEnum = z.enum(['Critical', 'High', 'Medium', 'Low']);
const statusEnum = z.enum(['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled', 'Overdue']);
const taskTypeEnum = z.enum([
  'Call',
  'Meeting',
  'Email',
  'Follow-up',
  'Documentation',
  'Sales',
  'Support',
  'General',
  'Custom',
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  priority: priorityEnum.default('Medium'),
  status: statusEnum.default('Pending'),
  taskType: taskTypeEnum.default('General'),
  relatedModule: z.string().optional().nullable(),
  relatedRecordId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid('Invalid assignedToId format'),
  assignedById: z.string().uuid().optional().nullable(),
  department: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
  estimatedHours: z.number().nonnegative().optional().nullable(),
  actualHours: z.number().nonnegative().optional().nullable(),
  reminderDate: z.string().optional().nullable(),
  reminderTime: z.string().optional().nullable(),
  progressPercentage: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  title: z.string().min(1).optional(),
});

export const patchStatusSchema = z.object({
  taskId: z.string().uuid().optional(),
  status: statusEnum,
  completedDate: z.string().optional().nullable(),
});

export const patchProgressSchema = z.object({
  taskId: z.string().uuid().optional(),
  progressPercentage: z.number().int().min(0).max(100),
});

export const patchAssignSchema = z.object({
  taskId: z.string().uuid().optional(),
  assignedToId: z.string().uuid('Invalid assignedToId format'),
  department: z.string().optional().nullable(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty'),
});
