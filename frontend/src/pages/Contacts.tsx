import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Contact2 } from 'lucide-react';

const Contacts: React.FC = () => {
  const breadcrumbs = [{ label: 'Contacts' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Contacts</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Contacts Configured"
          description="Build out your customer book. Add contacts to track names, emails, phones and interaction history."
          icon={<Contact2 className="w-12 h-12 text-slate-350" />}
          actionLabel="Add Contact"
          onAction={() => console.log('Add Contact clicked')}
        />
      </div>
    </div>
  );
};

export default Contacts;
