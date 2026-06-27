import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Calendar as CalendarIcon } from 'lucide-react';

const Calendar: React.FC = () => {
  const breadcrumbs = [{ label: 'Calendar' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Calendar</h1>
      </div>
      <div className="glass-card p-6 min-h-[400px] flex items-center justify-center">
        <EmptyState
          title="No Events Scheduled"
          description="View your sync meetings, calls, and tasks scheduled for this month in a unified visual calendar."
          icon={<CalendarIcon className="w-12 h-12 text-slate-350" />}
          actionLabel="Schedule Event"
          onAction={() => console.log('Schedule Event clicked')}
        />
      </div>
    </div>
  );
};

export default Calendar;
