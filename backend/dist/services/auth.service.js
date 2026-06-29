"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const user_repository_1 = require("../repositories/user.repository");
const refreshToken_repository_1 = require("../repositories/refreshToken.repository");
const loginHistory_repository_1 = require("../repositories/loginHistory.repository");
const passwordReset_repository_1 = require("../repositories/passwordReset.repository");
const auditLog_repository_1 = require("../repositories/auditLog.repository");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../middlewares/logger");
class AuthService {
    /**
     * Register a new user
     */
    async register(data) {
        const { email, password, firstName, lastName, phone, department, jobTitle } = data;
        // 1. Check duplicate email
        const duplicateEmail = await db_1.prisma.user.findUnique({ where: { email } });
        if (duplicateEmail) {
            const err = new Error('Email is already registered');
            err.statusCode = 409;
            throw err;
        }
        // 2. Check duplicate phone
        if (phone) {
            const duplicatePhone = await db_1.prisma.user.findFirst({
                where: { phone, deletedAt: null }
            });
            if (duplicatePhone) {
                const err = new Error('Phone number is already registered');
                err.statusCode = 409;
                throw err;
            }
        }
        // 3. Validate password strength
        const isStrong = password_1.PasswordUtility.validatePasswordStrength(password);
        if (!isStrong) {
            const err = new Error('Password is too weak. Requirements: 8+ characters, uppercase, lowercase, numbers, and special characters.');
            err.statusCode = 422;
            throw err;
        }
        // 4. Resolve default role
        let defaultRole = await db_1.prisma.role.findUnique({ where: { name: 'Admin' } });
        if (!defaultRole) {
            defaultRole = await db_1.prisma.role.findFirst();
        }
        // 5. Create user
        const hashedPassword = await password_1.PasswordUtility.hashPassword(password);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                phone: phone || null,
                department: department || null,
                jobTitle: jobTitle || null,
                roleId: defaultRole.id,
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
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    async login(credentials, clientInfo) {
        const { email, password } = credentials;
        // 1. Fetch user
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }
        // 2. Verify status
        if (user.status !== 'active') {
            const err = new Error('User account is currently suspended');
            err.statusCode = 403;
            throw err;
        }
        // 3. Verify password
        const passwordMatch = await password_1.PasswordUtility.verifyPassword(password, user.password);
        if (!passwordMatch) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }
        // 4. Resolve roles & permissions
        const roleName = user.role.name;
        // Eager load permissions linked to this role
        const rolePerms = await db_1.prisma.rolePermission.findMany({
            where: { roleId: user.roleId },
            include: { permission: true }
        });
        const permissions = rolePerms.map((rp) => rp.permission.name);
        // 5. Generate Access & Refresh Tokens
        const claims = {
            id: user.id,
            email: user.email,
            role: roleName,
            permissions
        };
        const accessToken = jwt_1.JwtUtility.generateAccessToken(claims);
        const refreshToken = jwt_1.JwtUtility.generateRefreshToken({ id: user.id });
        // 6. Save Refresh Token in Database
        const tokenExpires = new Date();
        tokenExpires.setDate(tokenExpires.getDate() + 7); // 7 days matching config
        await db_1.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: tokenExpires
            }
        });
        // 7. Track Login Session History
        const history = await loginHistory_repository_1.loginHistoryRepository.recordLogin({
            userId: user.id,
            ipAddress: clientInfo.ipAddress,
            userAgent: clientInfo.userAgent,
            browser: clientInfo.browser,
            os: clientInfo.os,
            device: clientInfo.device,
            country: clientInfo.country
        });
        // Update user's last login
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    async refresh(token, clientInfo) {
        // 1. Fetch token
        const dbToken = await refreshToken_repository_1.refreshTokenRepository.findByToken(token);
        if (!dbToken) {
            const err = new Error('Refresh token is invalid');
            err.statusCode = 401;
            throw err;
        }
        // 2. Detect reuse / theft (Token Rotation breach)
        if (dbToken.isRevoked) {
            // Compomised: Revoke all tokens for this user immediately!
            await refreshToken_repository_1.refreshTokenRepository.revokeAllUserTokens(dbToken.userId);
            logger_1.logger.warn(`Security breach detected: Revoked refresh token reuse for User: ${dbToken.userId}`);
            const err = new Error('Security Alert: Session compromised. Please re-authenticate.');
            err.statusCode = 401;
            throw err;
        }
        // 3. Verify expiration
        if (dbToken.expiresAt < new Date()) {
            const err = new Error('Refresh token expired. Please log in again.');
            err.statusCode = 401;
            throw err;
        }
        // 4. Generate new tokens
        const user = dbToken.user;
        const roleName = user.role.name;
        const rolePerms = await db_1.prisma.rolePermission.findMany({
            where: { roleId: user.roleId },
            include: { permission: true }
        });
        const permissions = rolePerms.map((rp) => rp.permission.name);
        const claims = {
            id: user.id,
            email: user.email,
            role: roleName,
            permissions
        };
        const newAccessToken = jwt_1.JwtUtility.generateAccessToken(claims);
        const newRefreshToken = jwt_1.JwtUtility.generateRefreshToken({ id: user.id });
        // 5. Invalidate old token and link to the new rotated token
        await refreshToken_repository_1.refreshTokenRepository.revokeToken(token, newRefreshToken);
        // 6. Save new Refresh Token
        const tokenExpires = new Date();
        tokenExpires.setDate(tokenExpires.getDate() + 7);
        await db_1.prisma.refreshToken.create({
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
    async logout(token) {
        const dbToken = await refreshToken_repository_1.refreshTokenRepository.findByToken(token);
        if (dbToken) {
            // Invalidate refresh token
            await refreshToken_repository_1.refreshTokenRepository.revokeToken(token);
            // Invalidate active login history logs
            const activeHistories = await db_1.prisma.loginHistory.findMany({
                where: { userId: dbToken.userId, logoutTime: null }
            });
            for (const h of activeHistories) {
                await loginHistory_repository_1.loginHistoryRepository.recordLogout(h.id);
            }
            // Write audit log
            await auditLog_repository_1.auditLogRepository.logEvent({
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
    async logoutDevice(userId, historyId) {
        const log = await db_1.prisma.loginHistory.findFirst({
            where: { id: historyId, userId }
        });
        if (log) {
            await loginHistory_repository_1.loginHistoryRepository.recordLogout(log.id);
            // Revoke newest refresh token for safety
            const newestToken = await db_1.prisma.refreshToken.findFirst({
                where: { userId, isRevoked: false },
                orderBy: { createdAt: 'desc' }
            });
            if (newestToken) {
                await refreshToken_repository_1.refreshTokenRepository.revokeToken(newestToken.token);
            }
            await auditLog_repository_1.auditLogRepository.logEvent({
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
    async logoutAllDevices(userId) {
        // Revoke all refresh tokens
        await refreshToken_repository_1.refreshTokenRepository.revokeAllUserTokens(userId);
        // Mark logout time on all histories
        await db_1.prisma.loginHistory.updateMany({
            where: { userId, logoutTime: null },
            data: { logoutTime: new Date() }
        });
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'ALL_DEVICES_LOGOUT',
            module: 'auth'
        });
        return true;
    }
    /**
     * Request password reset token
     */
    async forgotPassword(email) {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }
        // Invalidate existing reset tokens
        await passwordReset_repository_1.passwordResetRepository.invalidateAllUserTokens(user.id);
        // Create reset token (UUID) valid for 1 hour
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await db_1.prisma.passwordReset.create({
            data: {
                userId: user.id,
                token,
                expiresAt
            }
        });
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    async resetPassword(token, data) {
        const { newPassword, confirmPassword } = data;
        if (newPassword !== confirmPassword) {
            const err = new Error('Passwords do not match');
            err.statusCode = 400;
            throw err;
        }
        // 1. Find active token
        const dbToken = await passwordReset_repository_1.passwordResetRepository.findActiveToken(token);
        if (!dbToken) {
            const err = new Error('Password reset token is invalid or has expired');
            err.statusCode = 400;
            throw err;
        }
        // 2. Validate password strength
        const isStrong = password_1.PasswordUtility.validatePasswordStrength(newPassword);
        if (!isStrong) {
            const err = new Error('Password is too weak. Requirements: 8+ characters, uppercase, lowercase, numbers, and special characters.');
            err.statusCode = 422;
            throw err;
        }
        // 3. Update password
        const hashedPassword = await password_1.PasswordUtility.hashPassword(newPassword);
        await db_1.prisma.user.update({
            where: { id: dbToken.userId },
            data: { password: hashedPassword }
        });
        // 4. Mark token as used
        await passwordReset_repository_1.passwordResetRepository.markAsUsed(dbToken.id);
        // 5. Revoke all user refresh tokens to force re-auth across all devices
        await refreshToken_repository_1.refreshTokenRepository.revokeAllUserTokens(dbToken.userId);
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId: dbToken.userId,
            action: 'PASSWORD_RESET_COMPLETED',
            module: 'auth',
            details: { tokenId: dbToken.id }
        });
        return true;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
exports.default = exports.authService;
