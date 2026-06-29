import { create } from 'zustand';

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
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  systemNotifications: [
    {
      id: 'notif-1',
      title: 'New lead assigned',
      description: 'Bruce Wayne from Wayne Enterprises has been added.',
      read: false,
      type: 'lead',
      timestamp: '2026-06-30T09:00:00Z',
    },
    {
      id: 'notif-2',
      title: 'Deal Proposal Qualified',
      description: 'Cyberdyne Systems pipeline value updated.',
      read: false,
      type: 'deal',
      timestamp: '2026-06-30T10:30:00Z',
    },
    {
      id: 'notif-3',
      title: 'Task Due Tomorrow',
      description: 'Follow up with Sarah Connor regarding enterprise contract.',
      read: false,
      type: 'task',
      timestamp: '2026-06-30T11:15:00Z',
    }
  ],
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
  markAsRead: (id) =>
    set((state) => ({
      systemNotifications: state.systemNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      systemNotifications: state.systemNotifications.map((n) => ({ ...n, read: true })),
    })),
}));
