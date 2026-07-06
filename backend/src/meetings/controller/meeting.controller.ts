import { Request, Response, NextFunction } from 'express';
import { meetingService } from '../service/meeting.service';
import { ResponseHelper } from '../../helpers/response';

export const meetingController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const organizerId = req.query.organizerId as string;
      const customerId = req.query.customerId as string;
      const dealId = req.query.dealId as string;

      const result = await meetingService.getMeetings({ page, limit, search, organizerId, customerId, dealId });
      ResponseHelper.sendSuccess(req, res, 200, 'Meetings retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Meeting details retrieved successfully.', meeting);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.createMeeting(
        {
          ...req.body,
          startTime: new Date(req.body.startTime),
          endTime: new Date(req.body.endTime),
        },
        req.user?.id
      );
      ResponseHelper.sendSuccess(req, res, 201, 'Meeting created successfully.', meeting);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateData = { ...req.body };
      if (req.body.startTime) updateData.startTime = new Date(req.body.startTime);
      if (req.body.endTime) updateData.endTime = new Date(req.body.endTime);

      const meeting = await meetingService.updateMeeting(req.params.id as string, updateData, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Meeting updated successfully.', meeting);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await meetingService.deleteMeeting(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Meeting deleted successfully.');
    } catch (error) { next(error); }
  },
};

export default meetingController;
