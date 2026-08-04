import { portalUserRepository } from '../repository/portal.repository';
import { prisma } from '../../database/db';
import { config } from '../../config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Prisma } from '@prisma/client';

export const portalService = {
  getPortalUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PortalUserWhereInput = {
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
      portalUserRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      portalUserRepository.count(where),
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

  getPortalUserById: async (id: string) => {
    const user = await portalUserRepository.findById(id);
    if (!user || user.deletedAt) {
      throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
    }
    return user;
  },

  createPortalUser: async (
    data: {
      customerId?: string | null;
      email: string;
      password?: string | null;
      name?: string | null;
      company?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      permissions?: string[];
    },
    userId?: string
  ) => {
    let custId = data.customerId;
    if (!custId) {
      const firstCust = await prisma.customer.findFirst();
      if (firstCust) {
        custId = firstCust.id;
      } else {
        const newCust = await prisma.customer.create({
          data: {
            name: data.company || 'Enterprise Portal Client',
            type: 'client',
            status: 'active',
            createdBy: userId || 'system',
          },
        });
        custId = newCust.id;
      }
    }

    const existing = await portalUserRepository.findByEmail(data.email);
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    const rawPassword = data.password || 'Portal@12345';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    let firstName = data.firstName || '';
    let lastName = data.lastName || '';
    if (!firstName && data.name) {
      const parts = data.name.trim().split(' ');
      firstName = parts[0] || 'Portal';
      lastName = parts.slice(1).join(' ') || 'User';
    }
    if (!firstName) firstName = 'Portal';
    if (!lastName) lastName = 'User';

    return portalUserRepository.create({
      customerId: custId,
      email: data.email,
      password: hashedPassword,
      firstName,
      lastName,
      permissions: data.permissions || [],
      createdBy: userId || null,
    });
  },

  updatePortalUser: async (
    id: string,
    data: Partial<{
      email: string;
      password: string;
      name: string;
      company: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      permissions: string[];
    }>,
    userId?: string
  ) => {
    const existing = await portalUserRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    delete updateData.name;
    delete updateData.company;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    if (data.name && !data.firstName) {
      const parts = data.name.trim().split(' ');
      updateData.firstName = parts[0] || 'Portal';
      updateData.lastName = parts.slice(1).join(' ') || 'User';
    }

    if (data.email && data.email !== existing.email) {
      const dup = await portalUserRepository.findByEmail(data.email);
      if (dup) {
        throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
      }
    }

    return portalUserRepository.update(id, updateData);
  },

  deletePortalUser: async (id: string, userId?: string) => {
    const existing = await portalUserRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
    }
    return portalUserRepository.softDelete(id, userId);
  },

  login: async (email: string, password: string) => {
    const user = await portalUserRepository.findByEmail(email);
    if (!user || user.deletedAt || !user.isActive) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    await portalUserRepository.update(user.id, { lastLogin: new Date() });

    const token = jwt.sign(
      { id: user.id, email: user.email, customerId: user.customerId, type: 'portal' },
      config.jwt.secret as jwt.Secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },

  register: async (data: {
    customerId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
    }

    const existing = await portalUserRepository.findByEmail(data.email);
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await portalUserRepository.create({
      customerId: data.customerId,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getProfile: async (id: string) => {
    const user = await portalUserRepository.findById(id);
    if (!user || user.deletedAt) {
      throw Object.assign(new Error('Portal user not found'), { statusCode: 404 });
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

export default portalService;
