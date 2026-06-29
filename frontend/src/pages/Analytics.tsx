import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { BarChartWrapper, PieChartWrapper } from '../components/ui/Charts';
import { LineChart, Compass } from 'lucide-react';

export const Analytics: React.FC = () => {
  const breadcrumbs = [{ label: 'Analytics' }];

  const trendsData = [
    { label: 'Jan', engagement: 65, activeUsers: 40 },
    { label: 'Feb', engagement: 75, activeUsers: 48 },
    { label: 'Mar', engagement: 85, activeUsers: 55 },
    { label: 'Apr', engagement: 78, activeUsers: 50 },
    { label: 'May', engagement: 95, activeUsers: 68 },
    { label: 'Jun', engagement: 90, activeUsers: 62 },
  ];

  const industryData = [
    { name: 'Technology', value: 42, color: '#2563eb' },
    { name: 'Manufacturing', value: 28, color: '#a855f7' },
    { name: 'Healthcare', value: 18, color: '#10b981' },
    { name: 'Government', value: 12, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 text-slate-700 text-xs">
      <div className="flex flex-col gap-2 text-left">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Engagement Trends Panel */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-855 dark:text-slate-100 text-sm flex items-center gap-1.5">
            <LineChart size={16} className="text-brand-550" /> Customer Engagement Trends (Q2 2026)
          </h3>
          <div className="h-64 mt-2">
            <BarChartWrapper
              data={trendsData}
              xKey="label"
              series={[
                { key: 'engagement', name: 'Engagement Score', color: '#2563eb' },
                { key: 'activeUsers', name: 'Active Users (%)', color: '#60a5fa' }
              ]}
              height={250}
            />
          </div>
        </div>

        {/* Breakdown by Industry card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-855 dark:text-slate-100 text-sm flex items-center gap-1.5">
            <Compass size={16} className="text-purple-500" /> Contacts by Industry
          </h3>
          <div className="h-64 flex items-center justify-center">
            <PieChartWrapper
              data={industryData}
              height={250}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
