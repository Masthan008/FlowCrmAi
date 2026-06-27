import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ResponseHelper } from '../helpers/response';
import { prisma } from '../database/db';
import { PasswordUtility } from '../utils/password';
import { auditLogRepository } from '../repositories/auditLog.repository';

// Lightweight, robust user agent parser
const parseUserAgent = (userAgentStr?: string) => {
  if (!userAgentStr) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  }
  const ua = userAgentStr.toLowerCase();
  
  let browser = 'Other';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  let os = 'Other';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  let device = 'Desktop';
  if (ua.includes('mobi') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }

  return { browser, os, device };
};

export const authController = {
  /**
   * POST /auth/register
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.register(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'User registered successfully. Default role: Viewer.', {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/login
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.headers['user-agent'] as string;
      const uaDetails = parseUserAgent(userAgent);
      
      const clientInfo = {
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent,
        ...uaDetails
      };

      const result = await authService.login(req.body, clientInfo);
      ResponseHelper.sendSuccess(req, res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/refresh
   */
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Refresh token is required in request body.');
        return;
      }

      const userAgent = req.headers['user-agent'] as string;
      const uaDetails = parseUserAgent(userAgent);
      const clientInfo = {
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent,
        ...uaDetails
      };

      const result = await authService.refresh(refreshToken, clientInfo);
      ResponseHelper.sendSuccess(req, res, 200, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/logout
   */
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      ResponseHelper.sendSuccess(req, res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /auth/me
   */
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401);
        ResponseHelper.sendError(req, res, 401, 'Unauthorized access.');
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { role: true, preferences: true }
      });

      if (!user) {
        res.status(404);
        ResponseHelper.sendError(req, res, 404, 'User profile not found.');
        return;
      }

      // Format claims permissions list
      const rolePerms = await prisma.rolePermission.findMany({
        where: { roleId: user.roleId },
        include: { permission: true }
      });
      const permissions = rolePerms.map((rp) => rp.permission.name);

      ResponseHelper.sendSuccess(req, res, 200, 'Current profile retrieved successfully', {
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          profileImage: user.profileImage,
          department: user.department,
          jobTitle: user.jobTitle,
          status: user.status,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          timezone: user.timezone,
          language: user.language,
          themePreference: user.themePreference,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        role: user.role.name,
        permissions
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /auth/profile
   */
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401);
        ResponseHelper.sendError(req, res, 401, 'Unauthorized.');
        return;
      }

      const { firstName, lastName, phone, profileImage, language, timezone, themePreference } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          firstName,
          lastName,
          fullName: (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : undefined,
          phone,
          profileImage,
          language,
          timezone,
          themePreference
        }
      });

      // Write audit log
      await auditLogRepository.logEvent({
        userId: user.id,
        action: 'PROFILE_UPDATE',
        module: 'auth',
        details: { fieldsChanged: Object.keys(req.body) }
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Profile updated successfully', {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        language: user.language,
        timezone: user.timezone,
        themePreference: user.themePreference
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /auth/change-password
   */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401);
        ResponseHelper.sendError(req, res, 401, 'Unauthorized.');
        return;
      }

      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'New passwords do not match.');
        return;
      }

      // Check user existence & password match
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!dbUser) {
        res.status(404);
        ResponseHelper.sendError(req, res, 404, 'User profile not found.');
        return;
      }

      const oldPasswordMatch = await PasswordUtility.verifyPassword(oldPassword, dbUser.password);
      if (!oldPasswordMatch) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Incorrect old password.');
        return;
      }

      // Validate new password strength
      const isStrong = PasswordUtility.validatePasswordStrength(newPassword);
      if (!isStrong) {
        res.status(422);
        ResponseHelper.sendError(req, res, 422, 'Password is too weak. Requirements: 8+ characters, uppercase, lowercase, numbers, and special characters.');
        return;
      }

      const hashedNewPassword = await PasswordUtility.hashPassword(newPassword);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword }
      });

      // Revoke older refresh tokens to force re-auth
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.id, isRevoked: false },
        data: { isRevoked: true }
      });

      // Write audit log
      await auditLogRepository.logEvent({
        userId: req.user.id,
        action: 'PASSWORD_CHANGE',
        module: 'auth'
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Password updated successfully. Active sessions revoked.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/forgot-password
   */
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Email address is required.');
        return;
      }

      const token = await authService.forgotPassword(email);
      
      // Email delivery logic disabled in base setup
      ResponseHelper.sendSuccess(req, res, 200, 'Password reset token generated successfully. Email delivery disabled for now.', {
        token
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/reset-password
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      if (!token) {
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Reset token is required.');
        return;
      }

      await authService.resetPassword(token, { newPassword, confirmPassword });
      ResponseHelper.sendSuccess(req, res, 200, 'Password has been reset successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /auth/sessions
   */
  getSessions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401);
        ResponseHelper.sendError(req, res, 401, 'Unauthorized.');
        return;
      }

      // Fetch active devices login log histories
      const activeHistories = await prisma.loginHistory.findMany({
        where: {
          userId: req.user.id,
          logoutTime: null,
          deletedAt: null
        },
        orderBy: { loginTime: 'desc' }
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Active sessions list retrieved successfully', {
        sessions: activeHistories.map((h) => ({
          sessionId: h.id,
          loginTime: h.loginTime,
          ipAddress: h.ipAddress,
          browser: h.browser,
          os: h.os,
          device: h.device,
          country: h.country
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /auth/sessions/:id
   */
  logoutSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401);
        ResponseHelper.sendError(req, res, 401, 'Unauthorized.');
        return;
      }

      const { id } = req.params;
      const success = await authService.logoutDevice(req.user.id, id as string);
      if (success) {
        ResponseHelper.sendSuccess(req, res, 200, 'Target device session revoked.');
      } else {
        res.status(404);
        ResponseHelper.sendError(req, res, 404, 'Active device session not found.');
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /auth/sessions
   */
  logoutAllSessions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401);
        ResponseHelper.sendError(req, res, 401, 'Unauthorized.');
        return;
      }

      await authService.logoutAllDevices(req.user.id);
      ResponseHelper.sendSuccess(req, res, 200, 'All device sessions revoked successfully.');
    } catch (error) {
      next(error);
    }
  }
};
export default authController;
