"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHistoryRepository = exports.LoginHistoryRepository = void 0;
const base_repository_1 = require("./base.repository");
const db_1 = require("../database/db");
class LoginHistoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.loginHistory);
    }
    /**
     * Log an active login session
     */
    async recordLogin(data) {
        return db_1.prisma.loginHistory.create({
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
    async recordLogout(id) {
        return db_1.prisma.loginHistory.update({
            where: { id },
            data: { logoutTime: new Date() }
        });
    }
    /**
     * Fetch active login history logs for a user
     */
    async getActiveSessions(userId) {
        return db_1.prisma.loginHistory.findMany({
            where: {
                userId,
                logoutTime: null,
                deletedAt: null
            },
            orderBy: { loginTime: 'desc' }
        });
    }
}
exports.LoginHistoryRepository = LoginHistoryRepository;
exports.loginHistoryRepository = new LoginHistoryRepository();
exports.default = exports.loginHistoryRepository;
