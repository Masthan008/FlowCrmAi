"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = exports.SessionRepository = void 0;
const base_repository_1 = require("./base.repository");
const db_1 = require("../database/db");
class SessionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.session);
    }
    /**
     * Fetch session details by unique token string
     */
    async findByToken(token) {
        return db_1.prisma.session.findUnique({
            where: { token },
            include: { user: { include: { role: true } } },
        });
    }
    /**
     * Invalidate user session
     */
    async invalidateSession(token) {
        return db_1.prisma.session.update({
            where: { token },
            data: { isValid: false },
        });
    }
    /**
     * Invalidate all sessions for a user
     */
    async invalidateAllUserSessions(userId) {
        return db_1.prisma.session.updateMany({
            where: { userId },
            data: { isValid: false },
        });
    }
}
exports.SessionRepository = SessionRepository;
exports.sessionRepository = new SessionRepository();
exports.default = exports.sessionRepository;
