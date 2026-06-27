import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export const useToast = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);

  const toast = {
    success: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'info', title, message, duration }),
    dismiss: (id: string) => dismissNotification(id),
  };

  return toast;
};

export const ToastProvider: React.FC = () => {
  const { notifications, dismissNotification } = useNotificationStore();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borders = {
    success: 'border-emerald-100',
    error: 'border-rose-100',
    warning: 'border-amber-100',
    info: 'border-blue-100',
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto w-full glass-card border ${borders[toast.type]} shadow-glossy-lg p-4 flex gap-3 items-start relative overflow-hidden`}
          >
            {/* Background Light Glow Accent */}
            <div className={`absolute inset-y-0 left-0 w-1 ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'error' ? 'bg-rose-500' :
              toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />

            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            
            <div className="flex-grow pr-4">
              <h4 className="text-sm font-semibold text-slate-800 leading-snug">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => dismissNotification(toast.id)}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1 rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
