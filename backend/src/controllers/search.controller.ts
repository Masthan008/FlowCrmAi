import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/db';
import { ResponseHelper } from '../helpers/response';

export const searchController = {
  globalSearch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = String(req.query.query || '').trim();

      if (!query || query.length < 2) {
        return ResponseHelper.sendSuccess(req, res, 200, 'Search query too short.', {
          leads: [],
          contacts: [],
          deals: [],
          companies: [],
        });
      }

      const [leads, contacts, deals, companies] = await Promise.all([
        prisma.lead.findMany({
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
        prisma.contact.findMany({
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
        prisma.deal.findMany({
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
        prisma.company.findMany({
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

      ResponseHelper.sendSuccess(req, res, 200, 'Search results retrieved successfully.', {
        leads,
        contacts,
        deals,
        companies,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default searchController;
