import { logger } from '../middlewares/logger';
import { prisma } from '../database/db';

export interface INotificationService {
  sendInApp(userId: string, title: string, message: string, type?: string): Promise<boolean>;
  sendSMS(phone: string, message: string): Promise<boolean>;
  sendWhatsApp(phone: string, message: string): Promise<boolean>;
  sendPush(userId: string, title: string, message: string): Promise<boolean>;
}

export class MockNotificationService implements INotificationService {
  /**
   * Log notification in the database (In-App)
   */
  async sendInApp(userId: string, title: string, message: string, type: string = 'info'): Promise<boolean> {
    try {
      // In-app notifications are persisted in the PostgreSQL database directly
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          createdBy: 'system',
        }
      });
      logger.info(`[Notification Service] In-App Notification sent to User: ${userId} | Title: "${title}"`);
      return true;
    } catch (error) {
      logger.error(`[Notification Service] Failed to send In-App Notification to User: ${userId}`, error);
      return false;
    }
  }

  async sendSMS(phone: string, message: string): Promise<boolean> {
    logger.info(`[Notification Service] Mock SMS sent. Phone: ${phone} | Msg: "${message}"`);
    return true;
  }

  async sendWhatsApp(phone: string, message: string): Promise<boolean> {
    logger.info(`[Notification Service] Mock WhatsApp sent. Phone: ${phone} | Msg: "${message}"`);
    return true;
  }

  async sendPush(userId: string, title: string, message: string): Promise<boolean> {
    logger.info(`[Notification Service] Mock Push Notification sent to User: ${userId} | Title: "${title}" | Msg: "${message}"`);
    return true;
  }
}

export const notificationService = new MockNotificationService();
export default notificationService;
