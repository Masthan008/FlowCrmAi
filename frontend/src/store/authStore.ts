import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  department?: string;
  jobTitle?: string;
  timezone?: string;
  language?: string;
  themePreference?: string;
  createdAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  status?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  role: string | null;
  permissions: string[];
  theme: string;
  loading: boolean;
  
  // Actions
  login: (accessToken: string, refreshToken: string, user: User, role: string, permissions: string[]) => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

// Helper to load persisted values from localStorage
const getLocalStorageItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const getPersistedUser = (): User | null => {
  try {
    const raw = getLocalStorageItem('flowcrm_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getPersistedPermissions = (): string[] => {
  try {
    const raw = getLocalStorageItem('flowcrm_permissions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistedAccessToken = getLocalStorageItem('flowcrm_access_token');
const persistedRefreshToken = getLocalStorageItem('flowcrm_refresh_token');
const persistedUser = getPersistedUser();
const persistedRole = getLocalStorageItem('flowcrm_role');
const persistedPermissions = getPersistedPermissions();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!persistedAccessToken,
  accessToken: persistedAccessToken,
  refreshToken: persistedRefreshToken,
  user: persistedUser,
  role: persistedRole,
  permissions: persistedPermissions,
  theme: getLocalStorageItem('flowcrm_theme') || 'white-glossy',
  loading: false,

  login: (accessToken, refreshToken, user, role, permissions) => {
    localStorage.setItem('flowcrm_access_token', accessToken);
    localStorage.setItem('flowcrm_refresh_token', refreshToken);
    localStorage.setItem('flowcrm_user', JSON.stringify(user));
    localStorage.setItem('flowcrm_role', role);
    localStorage.setItem('flowcrm_permissions', JSON.stringify(permissions));

    set({
      isAuthenticated: true,
      accessToken,
      refreshToken,
      user,
      role,
      permissions
    });
  },

  logout: () => {
    localStorage.removeItem('flowcrm_access_token');
    localStorage.removeItem('flowcrm_refresh_token');
    localStorage.removeItem('flowcrm_user');
    localStorage.removeItem('flowcrm_role');
    localStorage.removeItem('flowcrm_permissions');

    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      permissions: []
    });
  },

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('flowcrm_access_token', token);
    } else {
      localStorage.removeItem('flowcrm_access_token');
    }
    set({ accessToken: token });
  },

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem('flowcrm_refresh_token', token);
    } else {
      localStorage.removeItem('flowcrm_refresh_token');
    }
    set({ refreshToken: token });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updatedFields };
      localStorage.setItem('flowcrm_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  setLoading: (loading) => set({ loading })
}));

export default useAuthStore;
