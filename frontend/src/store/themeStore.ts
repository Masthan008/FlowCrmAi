import { create } from 'zustand';

interface ThemeState {
  theme: 'white-glossy';
  setTheme: (theme: 'white-glossy') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'white-glossy',
  setTheme: (theme) => set({ theme }),
}));
