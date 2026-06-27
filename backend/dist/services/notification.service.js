"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.MockNotificationService = void 0;
const logger_1 = require("../middlewares/logger");
const db_1 = require("../database/db");
class MockNotificationService {
    /**
     * Log notification in the database (In-App)
     */
    async sendInApp(userId, title, message, type = 'info') {
        try {
            // In-app notifications are persisted in the PostgreSQL database directly
            await db_1.prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    createdBy: 'system',
                }
            });
            logger_1.logger.info(`[Notification Service] In-App Notification sent to User: ${userId} | Title: "${title}"`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`[Notification Service] Failed to send In-App Notification to User: ${userId}`, error);
            return false;
        }
    }
    async sendSMS(phone, message) {
        logger_1.logger.info(`[Notification Service] Mock SMS sent. Phone: ${phone} | Msg: "${message}"`);
        return true;
    }
    async sendWhatsApp(phone, message) {
        logger_1.logger.info(`[Notification Service] Mock WhatsApp sent. Phone: ${phone} | Msg: "${message}"`);
        return true;
    }
    async sendPush(userId, title, message) {
        logger_1.logger.info(`[Notification Service] Mock Push Notification sent to User: ${userId} | Title: "${title}" | Msg: "${message}"`);
        return true;
    }
}
exports.MockNotificationService = MockNotificationService;
exports.notificationService = new MockNotificationService();
exports.default = exports.notificationService;
