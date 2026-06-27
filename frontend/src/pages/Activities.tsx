import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Activity } from 'lucide-react';

const Activities: React.FC = () => {
  const breadcrumbs = [{ label: 'Activities' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Activities</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Recent Activities"
          description="Log customer calls, emails, and meetings here to build a comprehensive history."
          icon={<Activity className="w-12 h-12 text-slate-355" />}
          actionLabel="Log Activity"
          onAction={() => console.log('Log Activity clicked')}
        />
      </div>
    </div>
  );
};

export default Activities;
