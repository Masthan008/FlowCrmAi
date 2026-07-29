"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketRepository = exports.TicketRepository = void 0;
const db_1 = require("../../database/db");
class TicketRepository {
    async findMany(params) {
        return db_1.prisma.ticket.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.ticket.count({ where });
    }
    async findById(id) {
        return db_1.prisma.ticket.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.ticket.create({
            data,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.ticket.update({
            where: { id },
            data,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.ticket.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.TicketRepository = TicketRepository;
exports.ticketRepository = new TicketRepository();
exports.default = exports.ticketRepository;
