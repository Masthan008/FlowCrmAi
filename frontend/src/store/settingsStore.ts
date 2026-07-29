import { create } from 'zustand';
import { api } from '../services/api';

interface AppSettings {
  sidebarCollapsed: boolean;
  compactMode: boolean;
  notificationsEnabled: boolean;
  companyName: string;
}

interface SettingsState {
  settings: AppSettings;
  toggleSidebar: () => void;
  toggleCompactMode: () => void;
  toggleNotifications: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  fetchCompanySettings: () => Promise<void>;
  updateCompanyName: (name: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    sidebarCollapsed: false,
    compactMode: false,
    notificationsEnabled: true,
    companyName: 'FlowCRM Enterprise',
  },
  toggleSidebar: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        sidebarCollapsed: !state.settings.sidebarCollapsed,
      },
    })),
  toggleCompactMode: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        compactMode: !state.settings.compactMode,
      },
    })),
  toggleNotifications: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        notificationsEnabled: !state.settings.notificationsEnabled,
      },
    })),
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    })),
  fetchCompanySettings: async () => {
    try {
      const res = await api.get('/settings');
      const data = res.data.data;
      if (data && data.companyName) {
        set((state) => ({
          settings: { ...state.settings, companyName: data.companyName },
        }));
      }
    } catch {
      // Keep default
    }
  },
  updateCompanyName: async (name: string) => {
    try {
      await api.put('/settings', { companyName: name });
      set((state) => ({
        settings: { ...state.settings, companyName: name },
      }));
    } catch (err) {
      throw err;
    }
  },
}));
