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

const defaultSettings: SystemSettings = {
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
    const existing = await prisma.systemSetting.findFirst();
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
    const created = await prisma.systemSetting.create({
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

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const existing = await prisma.systemSetting.findFirst();
    if (existing) {
      const updated = await prisma.systemSetting.update({
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
    const created = await prisma.systemSetting.create({
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

export const settingsRepository = new SettingsRepository();
