import { create } from 'zustand';
import { api } from '../services/api';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  type: 'lead' | 'deal' | 'task' | 'general';
  timestamp: string;
}

interface NotificationState {
  notifications: ToastNotification[];
  systemNotifications: SystemNotification[];
  addNotification: (notification: Omit<ToastNotification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  fetchSystemNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  systemNotifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    
    const duration = notification.duration !== undefined ? notification.duration : 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  fetchSystemNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      const items = res.data.data || [];
      const mapped = items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.message,
        read: !!item.readAt,
        type: (item.type || 'general') as any,
        timestamp: item.createdAt,
      }));
      set({ systemNotifications: mapped });
    } catch (err) {
      console.error('Failed to fetch system notifications:', err);
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state
      set((state) => ({
        systemNotifications: state.systemNotifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      // Update local state
      set((state) => ({
        systemNotifications: state.systemNotifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },
}));
