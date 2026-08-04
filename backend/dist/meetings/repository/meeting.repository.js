"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingRepository = exports.MeetingRepository = void 0;
const db_1 = require("../../database/db");
class MeetingRepository {
    async findMany(params) {
        return db_1.prisma.meeting.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                organizer: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                deal: {
                    select: { id: true, name: true, value: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.meeting.count({ where });
    }
    async findById(id) {
        return db_1.prisma.meeting.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                deal: {
                    select: { id: true, name: true, value: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.meeting.create({
            data,
            include: {
                organizer: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                deal: {
                    select: { id: true, name: true, value: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.meeting.update({
            where: { id },
            data,
            include: {
                organizer: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                deal: {
                    select: { id: true, name: true, value: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.meeting.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.MeetingRepository = MeetingRepository;
exports.meetingRepository = new MeetingRepository();
exports.default = exports.meetingRepository;
