import { Request, Response, NextFunction } from 'express';
import { orderService } from '../service/order.service';
import { ResponseHelper } from '../../helpers/response';

export const orderController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;

      const result = await orderService.getOrders({ page, limit, search, status, customerId });
      ResponseHelper.sendSuccess(req, res, 200, 'Orders retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.getOrderById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Order details retrieved successfully.', order);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.createOrder(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Order created successfully.', order);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.updateOrder(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Order updated successfully.', order);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await orderService.deleteOrder(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Order deleted successfully.');
    } catch (error) { next(error); }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.updateOrderStatus(req.params.id as string, req.body.status, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Order status updated successfully.', order);
    } catch (error) { next(error); }
  },
};

export default orderController;
