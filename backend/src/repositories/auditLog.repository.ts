import { BaseRepository } from './base.repository';
import { prisma } from '../database/db';

export class AuditLogRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.auditLog);
  }

  /**
   * Log an audit event
   */
  async logEvent(data: {
    userId?: string;
    action: string;
    module: string;
    ipAddress?: string;
    browser?: string;
    details?: any;
    createdBy?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        module: data.module,
        ipAddress: data.ipAddress || null,
        browser: data.browser || null,
        details: data.details || null,
        createdBy: data.createdBy || null,
      },
    });
  }
}
export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;
