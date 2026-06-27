import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../database/db';
import { userRepository } from '../repositories/user.repository';
import { sessionRepository } from '../repositories/session.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { loginHistoryRepository } from '../repositories/loginHistory.repository';
import { passwordResetRepository } from '../repositories/passwordReset.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { PasswordUtility } from '../utils/password';
import { JwtUtility, TokenClaims } from '../utils/jwt';
import { logger } from '../middlewares/logger';

interface ClientInfo {
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: any) {
    const { email, password, firstName, lastName, phone, department, jobTitle } = data;

    // 1. Check duplicate email
    const duplicateEmail = await prisma.user.findUnique({ where: { email } });
    if (duplicateEmail) {
      const err = new Error('Email is already registered') as any;
      err.statusCode = 409;
      throw err;
    }

    // 2. Check duplicate phone
    if (phone) {
      const duplicatePhone = await prisma.user.findFirst({
        where: { phone, deletedAt: null }
      });
      if (duplicatePhone) {
        const err = new Error('Phone number is already registered') as any;
        err.statusCode = 409;
        throw err;
      }
    }

    // 3. Validate password strength
    const isStrong = PasswordUtility.validatePasswordStrength(password);
    if (!isStrong) {
      const err = new Error('Password is too weak. Requirements: 8+ characters, uppercase, lowercase, numbers, and special characters.') as any;
      err.statusCode = 422;
      throw err;
    }

    // 4. Resolve default role
    // Default to 'Viewer' if not Super Admin or custom
    let defaultRole = await prisma.role.findUnique({ where: { name: 'Viewer' } });
    if (!defaultRole) {
      defaultRole = await prisma.role.findFirst();
    }

    // 5. Create user
    const hashedPassword = await PasswordUtility.hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phone: phone || null,
        department: department || null,
        jobTitle: jobTitle || null,
        roleId: defaultRole!.id,
        preferences: {
          create: {
            theme: 'white-glossy',
            language: 'en',
            timezone: 'UTC',
          }
        }
      },
      include: { role: true }
    });

    // Write audit log
    await auditLogRepository.logEvent({
      userId: user.id,
      action: 'USER_REGISTRATION',
      module: 'auth',
      details: { email: user.email, name: user.fullName }
    });

    return user;
  }

  /**
   * Login user and issue JWTs
   */
  async login(credentials: any, clientInfo: ClientInfo) {
    const { email, password } = credentials;

    // 1. Fetch user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password') as any;
      err.statusCode = 401;
      throw err;
    }

    // 2. Verify status
    if (user.status !== 'active') {
      const err = new Error('User account is currently suspended') as any;
      err.statusCode = 403;
      throw err;
    }

    // 3. Verify password
    const passwordMatch = await PasswordUtility.verifyPassword(password, user.password);
    if (!passwordMatch) {
      const err = new Error('Invalid email or password') as any;
      err.statusCode = 401;
      throw err;
    }

    // 4. Resolve roles & permissions
    const roleName = user.role.name;
    
    // Eager load permissions linked to this role
    const rolePerms = await prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true }
    });
    const permissions = rolePerms.map((rp) => rp.permission.name);

    // 5. Generate Access & Refresh Tokens
    const claims: TokenClaims = {
      id: user.id,
      email: user.email,
      role: roleName,
      permissions
    };

    const accessToken = JwtUtility.generateAccessToken(claims);
    const refreshToken = JwtUtility.generateRefreshToken({ id: user.id });

    // 6. Save Refresh Token in Database
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 7); // 7 days matching config

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: tokenExpires
      }
    });

    // 7. Track Login Session History
    const history = await loginHistoryRepository.recordLogin({
      userId: user.id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      browser: clientInfo.browser,
      os: clientInfo.os,
      device: clientInfo.device,
      country: clientInfo.country
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Write audit log
    await auditLogRepository.logEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      module: 'auth',
      ipAddress: clientInfo.ipAddress,
      browser: clientInfo.browser,
      details: { historyId: history.id }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        profileImage: user.profileImage,
        department: user.department,
        jobTitle: user.jobTitle,
        timezone: user.timezone,
        language: user.language,
        themePreference: user.themePreference
      },
      role: roleName,
      permissions
    };
  }

  /**
   * Rotate JWT Refresh Token
   */
  async refresh(token: string, clientInfo: ClientInfo) {
    // 1. Fetch token
    const dbToken = await refreshTokenRepository.findByToken(token);
    if (!dbToken) {
      const err = new Error('Refresh token is invalid') as any;
      err.statusCode = 401;
      throw err;
    }

    // 2. Detect reuse / theft (Token Rotation breach)
    if (dbToken.isRevoked) {
      // Compomised: Revoke all tokens for this user immediately!
      await refreshTokenRepository.revokeAllUserTokens(dbToken.userId);
      logger.warn(`Security breach detected: Revoked refresh token reuse for User: ${dbToken.userId}`);
      
      const err = new Error('Security Alert: Session compromised. Please re-authenticate.') as any;
      err.statusCode = 401;
      throw err;
    }

    // 3. Verify expiration
    if (dbToken.expiresAt < new Date()) {
      const err = new Error('Refresh token expired. Please log in again.') as any;
      err.statusCode = 401;
      throw err;
    }

    // 4. Generate new tokens
    const user = dbToken.user;
    const roleName = user.role.name;
    const rolePerms = await prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true }
    });
    const permissions = rolePerms.map((rp) => rp.permission.name);

    const claims: TokenClaims = {
      id: user.id,
      email: user.email,
      role: roleName,
      permissions
    };

    const newAccessToken = JwtUtility.generateAccessToken(claims);
    const newRefreshToken = JwtUtility.generateRefreshToken({ id: user.id });

    // 5. Invalidate old token and link to the new rotated token
    await refreshTokenRepository.revokeToken(token, newRefreshToken);

    // 6. Save new Refresh Token
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: tokenExpires
      }
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Logout user from session
   */
  async logout(token: string) {
    const dbToken = await refreshTokenRepository.findByToken(token);
    if (dbToken) {
      // Invalidate refresh token
      await refreshTokenRepository.revokeToken(token);

      // Invalidate active login history logs
      const activeHistories = await prisma.loginHistory.findMany({
        where: { userId: dbToken.userId, logoutTime: null }
      });
      for (const h of activeHistories) {
        await loginHistoryRepository.recordLogout(h.id);
      }

      // Write audit log
      await auditLogRepository.logEvent({
        userId: dbToken.userId,
        action: 'USER_LOGOUT',
        module: 'auth',
        details: { tokenRevoked: dbToken.id }
      });
    }
    return true;
  }

  /**
   * Invalidate specific active session device
   */
  async logoutDevice(userId: string, historyId: string) {
    const log = await prisma.loginHistory.findFirst({
      where: { id: historyId, userId }
    });
    if (log) {
      await loginHistoryRepository.recordLogout(log.id);
      
      // Revoke newest refresh token for safety
      const newestToken = await prisma.refreshToken.findFirst({
        where: { userId, isRevoked: false },
        orderBy: { createdAt: 'desc' }
      });
      if (newestToken) {
        await refreshTokenRepository.revokeToken(newestToken.token);
      }

      await auditLogRepository.logEvent({
        userId,
        action: 'DEVICE_LOGOUT',
        module: 'auth',
        details: { historyId }
      });
      return true;
    }
    return false;
  }

  /**
   * Invalidate all sessions/devices for user
   */
  async logoutAllDevices(userId: string) {
    // Revoke all refresh tokens
    await refreshTokenRepository.revokeAllUserTokens(userId);

    // Mark logout time on all histories
    await prisma.loginHistory.updateMany({
      where: { userId, logoutTime: null },
      data: { logoutTime: new Date() }
    });

    // Write audit log
    await auditLogRepository.logEvent({
      userId,
      action: 'ALL_DEVICES_LOGOUT',
      module: 'auth'
    });

    return true;
  }

  /**
   * Request password reset token
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const err = new Error('User not found') as any;
      err.statusCode = 404;
      throw err;
    }

    // Invalidate existing reset tokens
    await passwordResetRepository.invalidateAllUserTokens(user.id);

    // Create reset token (UUID) valid for 1 hour
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Write audit log
    await auditLogRepository.logEvent({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      module: 'auth',
      details: { token }
    });

    return token;
  }

  /**
   * Reset user password using token
   */
  async resetPassword(token: string, data: any) {
    const { newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      const err = new Error('Passwords do not match') as any;
      err.statusCode = 400;
      throw err;
    }

    // 1. Find active token
    const dbToken = await passwordResetRepository.findActiveToken(token);
    if (!dbToken) {
      const err = new Error('Password reset token is invalid or has expired') as any;
      err.statusCode = 400;
      throw err;
    }

    // 2. Validate password strength
    const isStrong = PasswordUtility.validatePasswordStrength(newPassword);
    if (!isStrong) {
      const err = new Error('Password is too weak. Requirements: 8+ characters, uppercase, lowercase, numbers, and special characters.') as any;
      err.statusCode = 422;
      throw err;
    }

    // 3. Update password
    const hashedPassword = await PasswordUtility.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: dbToken.userId },
      data: { password: hashedPassword }
    });

    // 4. Mark token as used
    await passwordResetRepository.markAsUsed(dbToken.id);

    // 5. Revoke all user refresh tokens to force re-auth across all devices
    await refreshTokenRepository.revokeAllUserTokens(dbToken.userId);

    // Write audit log
    await auditLogRepository.logEvent({
      userId: dbToken.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      module: 'auth',
      details: { tokenId: dbToken.id }
    });

    return true;
  }
}

export const authService = new AuthService();
export default authService;
