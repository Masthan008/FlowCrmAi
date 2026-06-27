import { BaseRepository } from './base.repository';
import { prisma } from '../database/db';

export class SessionRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.session);
  }

  /**
   * Fetch session details by unique token string
   */
  async findByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: { include: { role: true } } },
    });
  }

  /**
   * Invalidate user session
   */
  async invalidateSession(token: string) {
    return prisma.session.update({
      where: { token },
      data: { isValid: false },
    });
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId },
      data: { isValid: false },
    });
  }
}
export const sessionRepository = new SessionRepository();
export default sessionRepository;
