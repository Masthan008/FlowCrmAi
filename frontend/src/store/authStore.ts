import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  login: (token, user) => set({ isAuthenticated: true, token, user }),
  logout: () => set({ isAuthenticated: false, token: null, user: null }),
}));
