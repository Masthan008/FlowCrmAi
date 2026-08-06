import { calendarRepository } from '../repository/calendar.repository';
import { prisma } from '../../database/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (val: any) => typeof val === 'string' && UUID_REGEX.test(val);

export const calendarService = {
  list: async (params: any) => {
    return calendarRepository.findMany(params);
  },

  getById: async (id: string) => {
    const event = await calendarRepository.findById(id);
    if (!event) {
      throw Object.assign(new Error('Calendar event not found'), { statusCode: 404 });
    }
    return event;
  },

  create: async (data: any, userId?: string) => {
    let organizerId = isUuid(data.organizerId) ? data.organizerId : null;

    if (!organizerId) {
      const firstEmp = await prisma.employee.findFirst();
      if (firstEmp) {
        organizerId = firstEmp.id;
      } else {
        const defaultCompany = await prisma.company.findFirst() || await prisma.company.create({
          data: { companyNumber: 'COMP-001', name: 'Default Enterprise Company' }
        });
        const newEmp = await prisma.employee.create({
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

    return calendarRepository.create(payload);
  },

  update: async (id: string, data: any, userId?: string) => {
    await calendarService.getById(id);
    const payload: any = { ...data, updatedBy: userId || null };
    if (payload.startTime) payload.startTime = new Date(payload.startTime);
    if (payload.endTime) payload.endTime = new Date(payload.endTime);
    if (payload.organizerId && !isUuid(payload.organizerId)) delete payload.organizerId;
    if (payload.customerId && !isUuid(payload.customerId)) delete payload.customerId;
    if (payload.dealId && !isUuid(payload.dealId)) delete payload.dealId;

    return calendarRepository.update(id, payload);
  },

  delete: async (id: string, userId?: string) => {
    await calendarService.getById(id);
    return calendarRepository.delete(id, userId);
  },
};
