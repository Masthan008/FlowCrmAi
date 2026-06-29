import { create } from 'zustand';

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem('flowcrm_theme') || 'white-glossy',
  setTheme: (theme) => {
    localStorage.setItem('flowcrm_theme', theme);
    set({ theme });
  },
}));
