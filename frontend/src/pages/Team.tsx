import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { ShieldAlert } from 'lucide-react';

const Team: React.FC = () => {
  const breadcrumbs = [{ label: 'Team' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Team</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Team Members Invited"
          description="Collaborate with your sales staff. Send invites, assign roles (Admin, Manager, Agent), and check permissions."
          icon={<ShieldAlert className="w-12 h-12 text-slate-350" />}
          actionLabel="Invite Member"
          onAction={() => console.log('Invite Member clicked')}
        />
      </div>
    </div>
  );
};

export default Team;
