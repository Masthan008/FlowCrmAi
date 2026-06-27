import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { FileText } from 'lucide-react';

const Quotes: React.FC = () => {
  const breadcrumbs = [{ label: 'Quotes' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Quotes</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Quotes Created"
          description="Prepare price configurations for prospective buyers. Draft quotes, email PDFs, and trace signatures."
          icon={<FileText className="w-12 h-12 text-slate-350" />}
          actionLabel="Create Quote"
          onAction={() => console.log('Create Quote clicked')}
        />
      </div>
    </div>
  );
};

export default Quotes;
