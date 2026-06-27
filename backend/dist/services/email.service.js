"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.MockEmailService = void 0;
const logger_1 = require("../middlewares/logger");
class MockEmailService {
    async send(options) {
        logger_1.logger.info(`[Email Service] Mock Send triggered. To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to} | Subject: "${options.subject}"`);
        return true;
    }
    async sendWithTemplate(to, templateName, variables) {
        logger_1.logger.info(`[Email Service] Mock Send With Template triggered. To: ${to} | Template: "${templateName}" | Variables: ${JSON.stringify(variables)}`);
        return true;
    }
}
exports.MockEmailService = MockEmailService;
exports.emailService = new MockEmailService();
exports.default = exports.emailService;
