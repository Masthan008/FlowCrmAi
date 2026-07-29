"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailRepository = exports.EmailRepository = void 0;
const db_1 = require("../../database/db");
class EmailRepository {
    async findAccounts(where) {
        return db_1.prisma.emailAccount.findMany({
            where: { ...where, deletedAt: null },
            orderBy: { email: 'asc' },
        });
    }
    async findAccountById(id) {
        return db_1.prisma.emailAccount.findUnique({
            where: { id },
        });
    }
    async findMessages(params) {
        return db_1.prisma.emailMessage.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
        });
    }
    async countMessages(where) {
        return db_1.prisma.emailMessage.count({ where });
    }
    async findMessageById(id) {
        return db_1.prisma.emailMessage.findUnique({
            where: { id },
        });
    }
    async createMessage(data) {
        return db_1.prisma.emailMessage.create({
            data,
        });
    }
    async updateMessage(id, data) {
        return db_1.prisma.emailMessage.update({
            where: { id },
            data,
        });
    }
    async softDeleteMessage(id, userId) {
        return db_1.prisma.emailMessage.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.EmailRepository = EmailRepository;
exports.emailRepository = new EmailRepository();
exports.default = exports.emailRepository;
