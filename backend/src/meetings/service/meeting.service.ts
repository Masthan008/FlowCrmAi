import { meetingRepository } from '../repository/meeting.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const meetingService = {
  getMeetings: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    organizerId?: string;
    customerId?: string;
    dealId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MeetingWhereInput = {
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
      meetingRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { startTime: 'asc' },
      }),
      meetingRepository.count(where),
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

  getMeetingById: async (id: string) => {
    const meeting = await meetingRepository.findById(id);
    if (!meeting || meeting.deletedAt) {
      throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
    }
    return meeting;
  },

  createMeeting: async (
    data: {
      organizerId: string;
      customerId?: string;
      dealId?: string;
      title: string;
      description?: string;
      startTime: Date;
      endTime: Date;
      location?: string;
    },
    userId?: string
  ) => {
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw Object.assign(new Error('Start time must be before end time'), { statusCode: 400 });
    }

    // Verify organizer
    const organizer = await prisma.employee.findUnique({ where: { id: data.organizerId } });
    if (!organizer) {
      throw Object.assign(new Error('Organizer Employee not found'), { statusCode: 400 });
    }

    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
      }
    }

    if (data.dealId) {
      const deal = await prisma.deal.findUnique({ where: { id: data.dealId } });
      if (!deal) {
        throw Object.assign(new Error('Deal not found'), { statusCode: 400 });
      }
    }

    return meetingRepository.create({
      ...data,
      createdBy: userId || null,
    });
  },

  updateMeeting: async (
    id: string,
    data: Partial<{
      organizerId: string;
      customerId: string | null;
      dealId: string | null;
      title: string;
      description: string | null;
      startTime: Date;
      endTime: Date;
      location: string | null;
    }>,
    userId?: string
  ) => {
    const existing = await meetingRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
    }

    const newStart = data.startTime ? new Date(data.startTime) : new Date(existing.startTime);
    const newEnd = data.endTime ? new Date(data.endTime) : new Date(existing.endTime);
    if (newStart >= newEnd) {
      throw Object.assign(new Error('Start time must be before end time'), { statusCode: 400 });
    }

    if (data.organizerId) {
      const organizer = await prisma.employee.findUnique({ where: { id: data.organizerId } });
      if (!organizer) {
        throw Object.assign(new Error('Organizer Employee not found'), { statusCode: 400 });
      }
    }

    return meetingRepository.update(id, {
      ...data,
      updatedBy: userId || null,
    });
  },

  deleteMeeting: async (id: string, userId?: string) => {
    const existing = await meetingRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
    }
    return meetingRepository.softDelete(id, userId);
  },
};

export default meetingService;
