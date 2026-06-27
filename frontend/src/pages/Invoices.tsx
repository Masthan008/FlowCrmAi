import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Receipt } from 'lucide-react';

const Invoices: React.FC = () => {
  const breadcrumbs = [{ label: 'Invoices' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Invoices</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Invoices Issued"
          description="Send payment requests for closed deals. Issue multi-item bills, configure net payments terms, and log collections."
          icon={<Receipt className="w-12 h-12 text-slate-350" />}
          actionLabel="New Invoice"
          onAction={() => console.log('New Invoice clicked')}
        />
      </div>
    </div>
  );
};

export default Invoices;
