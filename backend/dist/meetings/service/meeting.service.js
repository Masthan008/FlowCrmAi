"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingService = void 0;
const meeting_repository_1 = require("../repository/meeting.repository");
const db_1 = require("../../database/db");
exports.meetingService = {
    getMeetings: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.title = { contains: params.search, mode: 'insensitive' };
        }
        if (params.organizerId) {
            where.organizerId = params.organizerId;
        }
        if (params.customerId) {
            where.customerId = params.customerId;
        }
        if (params.dealId) {
            where.dealId = params.dealId;
        }
        const [items, total] = await Promise.all([
            meeting_repository_1.meetingRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { startTime: 'asc' },
            }),
            meeting_repository_1.meetingRepository.count(where),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },
    getMeetingById: async (id) => {
        const meeting = await meeting_repository_1.meetingRepository.findById(id);
        if (!meeting || meeting.deletedAt) {
            throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
        }
        return meeting;
    },
    createMeeting: async (data, userId) => {
        if (new Date(data.startTime) >= new Date(data.endTime)) {
            throw Object.assign(new Error('Start time must be before end time'), { statusCode: 400 });
        }
        // Verify organizer
        const organizer = await db_1.prisma.employee.findUnique({ where: { id: data.organizerId } });
        if (!organizer) {
            throw Object.assign(new Error('Organizer Employee not found'), { statusCode: 400 });
        }
        if (data.customerId) {
            const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
            if (!customer) {
                throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
            }
        }
        if (data.dealId) {
            const deal = await db_1.prisma.deal.findUnique({ where: { id: data.dealId } });
            if (!deal) {
                throw Object.assign(new Error('Deal not found'), { statusCode: 400 });
            }
        }
        return meeting_repository_1.meetingRepository.create({
            ...data,
            createdBy: userId || null,
        });
    },
    updateMeeting: async (id, data, userId) => {
        const existing = await meeting_repository_1.meetingRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
        }
        const newStart = data.startTime ? new Date(data.startTime) : new Date(existing.startTime);
        const newEnd = data.endTime ? new Date(data.endTime) : new Date(existing.endTime);
        if (newStart >= newEnd) {
            throw Object.assign(new Error('Start time must be before end time'), { statusCode: 400 });
        }
        if (data.organizerId) {
            const organizer = await db_1.prisma.employee.findUnique({ where: { id: data.organizerId } });
            if (!organizer) {
                throw Object.assign(new Error('Organizer Employee not found'), { statusCode: 400 });
            }
        }
        return meeting_repository_1.meetingRepository.update(id, {
            ...data,
            updatedBy: userId || null,
        });
    },
    deleteMeeting: async (id, userId) => {
        const existing = await meeting_repository_1.meetingRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
        }
        return meeting_repository_1.meetingRepository.softDelete(id, userId);
    },
};
exports.default = exports.meetingService;
