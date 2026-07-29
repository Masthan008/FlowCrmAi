import { prisma } from '../../database/db';

export interface SystemSettings {
  companyName: string;
  supportEmail: string;
  defaultCurrency: string;
  cacheExpiry: number;
  rateLimit: number;
  webhooksEnabled: boolean;
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  leadAssignments: boolean;
  dealUpdates: boolean;
  taskReminders: boolean;
}

let memorySettings: SystemSettings = {
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

export class SettingsRepository {
  async getSettings(): Promise<SystemSettings> {
    return memorySettings;
  }

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    memorySettings = {
      ...memorySettings,
      ...data,
    };
    return memorySettings;
  }
}

export const settingsRepository = new SettingsRepository();
