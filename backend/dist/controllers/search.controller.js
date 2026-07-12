"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const db_1 = require("../database/db");
const response_1 = require("../helpers/response");
exports.searchController = {
    globalSearch: async (req, res, next) => {
        try {
            const query = String(req.query.query || '').trim();
            if (!query || query.length < 2) {
                return response_1.ResponseHelper.sendSuccess(req, res, 200, 'Search query too short.', {
                    leads: [],
                    contacts: [],
                    deals: [],
                    companies: [],
                });
            }
            const [leads, contacts, deals, companies] = await Promise.all([
                db_1.prisma.lead.findMany({
                    where: {
                        deletedAt: null,
                        OR: [
                            { fullName: { contains: query, mode: 'insensitive' } },
                            { companyName: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } },
                            { phone: { contains: query, mode: 'insensitive' } },
                            { leadNumber: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    select: {
                        id: true,
                        fullName: true,
                        companyName: true,
                        email: true,
                        phone: true,
                        leadNumber: true,
                    },
                    take: 5,
                }),
                db_1.prisma.contact.findMany({
                    where: {
                        deletedAt: null,
                        OR: [
                            { fullName: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } },
                            { phone: { contains: query, mode: 'insensitive' } },
                            { contactNumber: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        contactNumber: true,
                    },
                    take: 5,
                }),
                db_1.prisma.deal.findMany({
                    where: {
                        deletedAt: null,
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { dealNumber: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    select: {
                        id: true,
                        name: true,
                        dealNumber: true,
                        value: true,
                        status: true,
                    },
                    take: 5,
                }),
                db_1.prisma.company.findMany({
                    where: {
                        deletedAt: null,
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { legalName: { contains: query, mode: 'insensitive' } },
                            { displayName: { contains: query, mode: 'insensitive' } },
                            { primaryEmail: { contains: query, mode: 'insensitive' } },
                            { primaryPhone: { contains: query, mode: 'insensitive' } },
                            { companyNumber: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    select: {
                        id: true,
                        name: true,
                        companyNumber: true,
                        primaryEmail: true,
                        primaryPhone: true,
                    },
                    take: 5,
                }),
            ]);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Search results retrieved successfully.', {
                leads,
                contacts,
                deals,
                companies,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.searchController;
