import { logger } from '../middlewares/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface IEmailService {
  send(options: EmailOptions): Promise<boolean>;
  sendWithTemplate(to: string, templateName: string, variables: Record<string, any>): Promise<boolean>;
}

export class MockEmailService implements IEmailService {
  async send(options: EmailOptions): Promise<boolean> {
    logger.info(`[Email Service] Mock Send triggered. To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to} | Subject: "${options.subject}"`);
    return true;
  }

  async sendWithTemplate(to: string, templateName: string, variables: Record<string, any>): Promise<boolean> {
    logger.info(`[Email Service] Mock Send With Template triggered. To: ${to} | Template: "${templateName}" | Variables: ${JSON.stringify(variables)}`);
    return true;
  }
}

export const emailService = new MockEmailService();
export default emailService;
