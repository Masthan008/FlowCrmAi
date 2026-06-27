"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenRepository = exports.RefreshTokenRepository = void 0;
const base_repository_1 = require("./base.repository");
const db_1 = require("../database/db");
class RefreshTokenRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.refreshToken);
    }
    /**
     * Find a refresh token and load user details
     */
    async findByToken(token) {
        return db_1.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
        });
    }
    /**
     * Revoke a refresh token
     */
    async revokeToken(token, replacedByToken) {
        return db_1.prisma.refreshToken.update({
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
    async revokeAllUserTokens(userId) {
        return db_1.prisma.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true }
        });
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
exports.refreshTokenRepository = new RefreshTokenRepository();
exports.default = exports.refreshTokenRepository;
