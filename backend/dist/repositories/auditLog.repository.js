"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogRepository = exports.AuditLogRepository = void 0;
const base_repository_1 = require("./base.repository");
const db_1 = require("../database/db");
class AuditLogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.auditLog);
    }
    /**
     * Log an audit event
     */
    async logEvent(data) {
        return db_1.prisma.auditLog.create({
            data: {
                userId: data.userId || null,
                action: data.action,
                module: data.module,
                ipAddress: data.ipAddress || null,
                browser: data.browser || null,
                details: data.details || null,
                createdBy: data.createdBy || null,
            },
        });
    }
}
exports.AuditLogRepository = AuditLogRepository;
exports.auditLogRepository = new AuditLogRepository();
exports.default = exports.auditLogRepository;
