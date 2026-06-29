import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BellRing, Check, CheckSquare, MailOpen, Inbox } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

const Notifications: React.FC = () => {
  const breadcrumbs = [{ label: 'Notifications' }];
  const { systemNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = systemNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 text-slate-700 text-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            className="bg-brand-550 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
          >
            <MailOpen size={14} />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      <div className="glass-card p-6 min-h-[400px] flex flex-col justify-start">
        {systemNotifications.length === 0 ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <EmptyState
              title="All Caught Up!"
              description="Your notifications represent system events, deal mentions, and activities updates. You have no unread items."
              icon={<BellRing className="w-12 h-12 text-slate-350" />}
            />
          </div>
        ) : (
          <div className="space-y-3.5 max-w-3xl w-full mx-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                System Messages Inbox ({systemNotifications.length})
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-black rounded-lg">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {systemNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-4 flex gap-4 items-start transition-all ${
                    !n.read ? 'bg-brand-50/10' : 'opacity-70'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                    !n.read
                      ? 'bg-brand-50 border-brand-100 text-brand-550'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {n.type === 'task' ? <CheckSquare size={16} /> : <Inbox size={16} />}
                  </div>

                  <div className="min-w-0 flex-grow text-left">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className={`text-xs ${!n.read ? 'font-black text-slate-800' : 'font-semibold text-slate-655'}`}>
                        {n.title}
                      </h4>
                      <Badge variant={n.type === 'lead' ? 'info' : n.type === 'deal' ? 'success' : 'warning'}>
                        {n.type}
                      </Badge>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(n.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                      {n.description}
                    </p>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 bg-slate-50 hover:bg-brand-50 border border-slate-150 hover:border-brand-200 text-slate-400 hover:text-brand-600 rounded-lg transition-colors flex-shrink-0"
                      title="Mark as Read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
