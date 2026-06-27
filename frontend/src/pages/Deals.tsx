import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Briefcase } from 'lucide-react';

const Deals: React.FC = () => {
  const breadcrumbs = [{ label: 'Deals' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Deals</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Active Deals"
          description="Track your pipeline progress. Create opportunities, set stages, and forecast target revenues."
          icon={<Briefcase className="w-12 h-12 text-slate-350" />}
          actionLabel="New Deal"
          onAction={() => console.log('New Deal clicked')}
        />
      </div>
    </div>
  );
};

export default Deals;
