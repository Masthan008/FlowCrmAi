"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalService = void 0;
const portal_repository_1 = require("../repository/portal.repository");
const db_1 = require("../../database/db");
const config_1 = require("../../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.portalService = {
    getPortalUsers: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.OR = [
                { firstName: { contains: params.search, mode: 'insensitive' } },
                { lastName: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            portal_repository_1.portalUserRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            portal_repository_1.portalUserRepository.count(where),
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
    getPortalUserById: async (id) => {
        const user = await portal_repository_1.portalUserRepository.findById(id);
        if (!user || user.deletedAt) {
            throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
        }
        return user;
    },
    createPortalUser: async (data, userId) => {
        const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
        if (!customer) {
            throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
        }
        const existing = await portal_repository_1.portalUserRepository.findByEmail(data.email);
        if (existing) {
            throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        return portal_repository_1.portalUserRepository.create({
            customerId: data.customerId,
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            permissions: data.permissions || [],
            createdBy: userId || null,
        });
    },
    updatePortalUser: async (id, data, userId) => {
        const existing = await portal_repository_1.portalUserRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.password) {
            updateData.password = await bcrypt_1.default.hash(data.password, 12);
        }
        if (data.email && data.email !== existing.email) {
            const dup = await portal_repository_1.portalUserRepository.findByEmail(data.email);
            if (dup) {
                throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
            }
        }
        return portal_repository_1.portalUserRepository.update(id, updateData);
    },
    deletePortalUser: async (id, userId) => {
        const existing = await portal_repository_1.portalUserRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
        }
        return portal_repository_1.portalUserRepository.softDelete(id, userId);
    },
    login: async (email, password) => {
        const user = await portal_repository_1.portalUserRepository.findByEmail(email);
        if (!user || user.deletedAt || !user.isActive) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }
        await portal_repository_1.portalUserRepository.update(user.id, { lastLogin: new Date() });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, customerId: user.customerId, type: 'portal' }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    },
    register: async (data) => {
        const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
        if (!customer) {
            throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
        }
        const existing = await portal_repository_1.portalUserRepository.findByEmail(data.email);
        if (existing) {
            throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        const user = await portal_repository_1.portalUserRepository.create({
            customerId: data.customerId,
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
        });
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
    getProfile: async (id) => {
        const user = await portal_repository_1.portalUserRepository.findById(id);
        if (!user || user.deletedAt) {
            throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
};
exports.default = exports.portalService;
