import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { BellRing } from 'lucide-react';

const Notifications: React.FC = () => {
  const breadcrumbs = [{ label: 'Notifications' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Notifications</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="All Caught Up!"
          description="Your notifications represent system events, deal mentions, and activities updates. You have no unread items."
          icon={<BellRing className="w-12 h-12 text-slate-350" />}
        />
      </div>
    </div>
  );
};

export default Notifications;
