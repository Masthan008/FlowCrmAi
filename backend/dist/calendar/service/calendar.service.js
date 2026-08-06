"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarService = void 0;
const calendar_repository_1 = require("../repository/calendar.repository");
const db_1 = require("../../database/db");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === 'string' && UUID_REGEX.test(val);
exports.calendarService = {
    list: async (params) => {
        return calendar_repository_1.calendarRepository.findMany(params);
    },
    getById: async (id) => {
        const event = await calendar_repository_1.calendarRepository.findById(id);
        if (!event) {
            throw Object.assign(new Error('Calendar event not found'), { statusCode: 404 });
        }
        return event;
    },
    create: async (data, userId) => {
        let organizerId = isUuid(data.organizerId) ? data.organizerId : null;
        if (!organizerId) {
            const firstEmp = await db_1.prisma.employee.findFirst();
            if (firstEmp) {
                organizerId = firstEmp.id;
            }
            else {
                const defaultCompany = await db_1.prisma.company.findFirst() || await db_1.prisma.company.create({
                    data: { companyNumber: 'COMP-001', name: 'Default Enterprise Company' }
                });
                const newEmp = await db_1.prisma.employee.create({
                    data: {
                        companyId: defaultCompany.id,
                        firstName: 'System',
                        lastName: 'Organizer',
                        email: 'organizer@flowcrm.ai',
                    }
                });
                organizerId = newEmp.id;
            }
        }
        const startTime = data.startTime ? new Date(data.startTime) : new Date();
        const endTime = data.endTime ? new Date(data.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
        const payload = {
            title: data.title || 'Untitled Meeting',
            description: data.description || null,
            location: data.location || null,
            startTime,
            endTime,
            organizerId,
            customerId: isUuid(data.customerId) ? data.customerId : null,
            dealId: isUuid(data.dealId) ? data.dealId : null,
            createdBy: userId || null,
        };
        return calendar_repository_1.calendarRepository.create(payload);
    },
    update: async (id, data, userId) => {
        await exports.calendarService.getById(id);
        const payload = { ...data, updatedBy: userId || null };
        if (payload.startTime)
            payload.startTime = new Date(payload.startTime);
        if (payload.endTime)
            payload.endTime = new Date(payload.endTime);
        if (payload.organizerId && !isUuid(payload.organizerId))
            delete payload.organizerId;
        if (payload.customerId && !isUuid(payload.customerId))
            delete payload.customerId;
        if (payload.dealId && !isUuid(payload.dealId))
            delete payload.dealId;
        return calendar_repository_1.calendarRepository.update(id, payload);
    },
    delete: async (id, userId) => {
        await exports.calendarService.getById(id);
        return calendar_repository_1.calendarRepository.delete(id, userId);
    },
};
