import { BaseRepository } from './base.repository';
import { prisma } from '../database/db';

export class RefreshTokenRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.refreshToken);
  }

  /**
   * Find a refresh token and load user details
   */
  async findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
    });
  }

  /**
   * Revoke a refresh token
   */
  async revokeToken(token: string, replacedByToken?: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: {
        isRevoked: true,
        replacedByToken: replacedByToken || null
      }
    });
  }

  /**
   * Revoke all tokens for a user (useful on password change or logout all)
   */
  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true }
    });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
export default refreshTokenRepository;
