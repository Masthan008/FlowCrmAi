import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Users2 } from 'lucide-react';

const Leads: React.FC = () => {
  const breadcrumbs = [{ label: 'Leads' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Leads</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Leads Found"
          description="Your leads represent sales prospects. Once you connect your incoming channels, new prospects will show up here."
          icon={<Users2 className="w-12 h-12 text-slate-350" />}
          actionLabel="Create Lead"
          onAction={() => console.log('Create Lead clicked')}
        />
      </div>
    </div>
  );
};

export default Leads;
