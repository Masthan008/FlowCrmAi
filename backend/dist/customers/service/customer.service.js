"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = void 0;
const customer_repository_1 = require("../repository/customer.repository");
exports.customerService = {
    list: async (params) => {
        return customer_repository_1.customerRepository.findMany(params);
    },
    getById: async (id) => {
        const customer = await customer_repository_1.customerRepository.findById(id);
        if (!customer) {
            throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
        }
        return customer;
    },
    create: async (data, userId) => {
        const payload = {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            type: data.type || 'client',
            status: data.status || 'active',
            companyId: data.companyId || null,
            createdBy: userId || null,
        };
        return customer_repository_1.customerRepository.create(payload);
    },
    update: async (id, data, userId) => {
        await exports.customerService.getById(id);
        const payload = {
            ...data,
            updatedBy: userId || null,
        };
        return customer_repository_1.customerRepository.update(id, payload);
    },
    delete: async (id, userId) => {
        await exports.customerService.getById(id);
        return customer_repository_1.customerRepository.delete(id, userId);
    },
};
