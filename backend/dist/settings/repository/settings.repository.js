"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRepository = exports.SettingsRepository = void 0;
const db_1 = require("../../database/db");
const defaultSettings = {
    companyName: 'FlowCRM Enterprise',
    supportEmail: 'support@flowcrm.ai',
    defaultCurrency: 'USD',
    cacheExpiry: 300,
    rateLimit: 60,
    webhooksEnabled: true,
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: false,
    leadAssignments: true,
    dealUpdates: true,
    taskReminders: true,
};
class SettingsRepository {
    async getSettings() {
        const existing = await db_1.prisma.systemSetting.findFirst();
        if (existing) {
            return {
                companyName: existing.companyName,
                supportEmail: existing.supportEmail,
                defaultCurrency: existing.defaultCurrency,
                cacheExpiry: existing.cacheExpiry,
                rateLimit: existing.rateLimit,
                webhooksEnabled: existing.webhooksEnabled,
                emailAlerts: existing.emailAlerts,
                pushNotifications: existing.pushNotifications,
                weeklyDigest: existing.weeklyDigest,
                leadAssignments: existing.leadAssignments,
                dealUpdates: existing.dealUpdates,
                taskReminders: existing.taskReminders,
            };
        }
        const created = await db_1.prisma.systemSetting.create({
            data: defaultSettings,
        });
        return {
            companyName: created.companyName,
            supportEmail: created.supportEmail,
            defaultCurrency: created.defaultCurrency,
            cacheExpiry: created.cacheExpiry,
            rateLimit: created.rateLimit,
            webhooksEnabled: created.webhooksEnabled,
            emailAlerts: created.emailAlerts,
            pushNotifications: created.pushNotifications,
            weeklyDigest: created.weeklyDigest,
            leadAssignments: created.leadAssignments,
            dealUpdates: created.dealUpdates,
            taskReminders: created.taskReminders,
        };
    }
    async updateSettings(data) {
        const existing = await db_1.prisma.systemSetting.findFirst();
        if (existing) {
            const updated = await db_1.prisma.systemSetting.update({
                where: { id: existing.id },
                data,
            });
            return {
                companyName: updated.companyName,
                supportEmail: updated.supportEmail,
                defaultCurrency: updated.defaultCurrency,
                cacheExpiry: updated.cacheExpiry,
                rateLimit: updated.rateLimit,
                webhooksEnabled: updated.webhooksEnabled,
                emailAlerts: updated.emailAlerts,
                pushNotifications: updated.pushNotifications,
                weeklyDigest: updated.weeklyDigest,
                leadAssignments: updated.leadAssignments,
                dealUpdates: updated.dealUpdates,
                taskReminders: updated.taskReminders,
            };
        }
        const created = await db_1.prisma.systemSetting.create({
            data: {
                ...defaultSettings,
                ...data,
            },
        });
        return {
            companyName: created.companyName,
            supportEmail: created.supportEmail,
            defaultCurrency: created.defaultCurrency,
            cacheExpiry: created.cacheExpiry,
            rateLimit: created.rateLimit,
            webhooksEnabled: created.webhooksEnabled,
            emailAlerts: created.emailAlerts,
            pushNotifications: created.pushNotifications,
            weeklyDigest: created.weeklyDigest,
            leadAssignments: created.leadAssignments,
            dealUpdates: created.dealUpdates,
            taskReminders: created.taskReminders,
        };
    }
}
exports.SettingsRepository = SettingsRepository;
exports.settingsRepository = new SettingsRepository();
