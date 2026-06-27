import { create } from 'zustand';

interface AppSettings {
  sidebarCollapsed: boolean;
  compactMode: boolean;
  notificationsEnabled: boolean;
}

interface SettingsState {
  settings: AppSettings;
  toggleSidebar: () => void;
  toggleCompactMode: () => void;
  toggleNotifications: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    sidebarCollapsed: false,
    compactMode: false,
    notificationsEnabled: true,
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
}));
