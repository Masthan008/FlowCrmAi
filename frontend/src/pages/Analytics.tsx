import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { TrendingUp } from 'lucide-react';

const Analytics: React.FC = () => {
  const breadcrumbs = [{ label: 'Analytics' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Analytics</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Analytics Data Available"
          description="Visual charts of sales velocities, conversion metrics, and key performance indices will appear here."
          icon={<TrendingUp className="w-12 h-12 text-slate-350" />}
          actionLabel="Configure Dashboards"
          onAction={() => console.log('Configure Dashboards clicked')}
        />
      </div>
    </div>
  );
};

export default Analytics;
