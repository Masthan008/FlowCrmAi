import { BaseRepository } from './base.repository';
import { prisma } from '../database/db';

export class PasswordResetRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.passwordReset);
  }

  /**
   * Find an active, unexpired, and unused password reset token
   */
  async findActiveToken(token: string) {
    return prisma.passwordReset.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: { gt: new Date() },
        deletedAt: null
      },
      include: { user: true }
    });
  }

  /**
   * Mark a reset token as used
   */
  async markAsUsed(id: string) {
    return prisma.passwordReset.update({
      where: { id },
      data: { usedAt: new Date() }
    });
  }

  /**
   * Invalidate all other reset tokens for a user
   */
  async invalidateAllUserTokens(userId: string) {
    return prisma.passwordReset.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() } // Mark as used / expired
    });
  }
}

export const passwordResetRepository = new PasswordResetRepository();
export default passwordResetRepository;
