"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRepository = exports.SettingsRepository = void 0;
let memorySettings = {
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
        return memorySettings;
    }
    async updateSettings(data) {
        memorySettings = {
            ...memorySettings,
            ...data,
        };
        return memorySettings;
    }
}
exports.SettingsRepository = SettingsRepository;
exports.settingsRepository = new SettingsRepository();
