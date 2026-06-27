import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

const Reports: React.FC = () => {
  const breadcrumbs = [{ label: 'Reports' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Reports</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Reports Generated"
          description="Prepare and schedule custom summary reports. Monitor pipeline flow, agent performance, and billing metrics."
          icon={<BarChart3 className="w-12 h-12 text-slate-350" />}
          actionLabel="Generate Report"
          onAction={() => console.log('Generate Report clicked')}
        />
      </div>
    </div>
  );
};

export default Reports;
