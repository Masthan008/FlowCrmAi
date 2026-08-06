import { customerRepository } from '../repository/customer.repository';

export const customerService = {
  list: async (params: any) => {
    return customerRepository.findMany(params);
  },

  getById: async (id: string) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }
    return customer;
  },

  create: async (data: any, userId?: string) => {
    const payload = {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      type: data.type || 'client',
      status: data.status || 'active',
      companyId: data.companyId || null,
      createdBy: userId || null,
    };
    return customerRepository.create(payload);
  },

  update: async (id: string, data: any, userId?: string) => {
    await customerService.getById(id);
    const payload = {
      ...data,
      updatedBy: userId || null,
    };
    return customerRepository.update(id, payload);
  },

  delete: async (id: string, userId?: string) => {
    await customerService.getById(id);
    return customerRepository.delete(id, userId);
  },
};
