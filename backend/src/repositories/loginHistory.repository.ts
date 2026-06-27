import { BaseRepository } from './base.repository';
import { prisma } from '../database/db';

export class LoginHistoryRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.loginHistory);
  }

  /**
   * Log an active login session
   */
  async recordLogin(data: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
    device?: string;
    country?: string;
    createdBy?: string;
  }) {
    return prisma.loginHistory.create({
      data: {
        userId: data.userId,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        browser: data.browser || null,
        os: data.os || null,
        device: data.device || null,
        country: data.country || null,
        createdBy: data.createdBy || 'system'
      }
    });
  }

  /**
   * Record logout timestamp on user session
   */
  async recordLogout(id: string) {
    return prisma.loginHistory.update({
      where: { id },
      data: { logoutTime: new Date() }
    });
  }

  /**
   * Fetch active login history logs for a user
   */
  async getActiveSessions(userId: string) {
    return prisma.loginHistory.findMany({
      where: {
        userId,
        logoutTime: null,
        deletedAt: null
      },
      orderBy: { loginTime: 'desc' }
    });
  }
}

export const loginHistoryRepository = new LoginHistoryRepository();
export default loginHistoryRepository;
