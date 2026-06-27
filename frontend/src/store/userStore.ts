import { create } from 'zustand';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  company: string;
  role: string;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {
    name: 'Alex Mercer',
    email: 'alex.mercer@flowcrm.ai',
    company: 'Acme Enterprise',
    role: 'Administrator',
  },
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));
