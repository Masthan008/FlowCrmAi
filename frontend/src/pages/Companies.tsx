import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Building2 } from 'lucide-react';

const Companies: React.FC = () => {
  const breadcrumbs = [{ label: 'Companies' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Companies</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Companies Added"
          description="Group your contacts under business accounts. Configure corporate profiles and track organizational deals."
          icon={<Building2 className="w-12 h-12 text-slate-350" />}
          actionLabel="Add Company"
          onAction={() => console.log('Add Company clicked')}
        />
      </div>
    </div>
  );
};

export default Companies;
