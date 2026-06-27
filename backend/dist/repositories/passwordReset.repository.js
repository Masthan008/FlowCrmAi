"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetRepository = exports.PasswordResetRepository = void 0;
const base_repository_1 = require("./base.repository");
const db_1 = require("../database/db");
class PasswordResetRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.passwordReset);
    }
    /**
     * Find an active, unexpired, and unused password reset token
     */
    async findActiveToken(token) {
        return db_1.prisma.passwordReset.findFirst({
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
    async markAsUsed(id) {
        return db_1.prisma.passwordReset.update({
            where: { id },
            data: { usedAt: new Date() }
        });
    }
    /**
     * Invalidate all other reset tokens for a user
     */
    async invalidateAllUserTokens(userId) {
        return db_1.prisma.passwordReset.updateMany({
            where: { userId, usedAt: null },
            data: { usedAt: new Date() } // Mark as used / expired
        });
    }
}
exports.PasswordResetRepository = PasswordResetRepository;
exports.passwordResetRepository = new PasswordResetRepository();
exports.default = exports.passwordResetRepository;
