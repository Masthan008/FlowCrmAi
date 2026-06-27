import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { CheckSquare } from 'lucide-react';

const Tasks: React.FC = () => {
  const breadcrumbs = [{ label: 'Tasks' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Tasks</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Tasks Assigned"
          description="Create checklist items for your deals, leads, and follow-ups. Keep your sales workflow organized."
          icon={<CheckSquare className="w-12 h-12 text-slate-350" />}
          actionLabel="New Task"
          onAction={() => console.log('New Task clicked')}
        />
      </div>
    </div>
  );
};

export default Tasks;
