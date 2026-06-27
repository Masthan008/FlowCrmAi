import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { BarChart3, LineChart, TrendingUp, Compass, Target, HelpCircle, Activity } from 'lucide-react';

export const Analytics: React.FC = () => {
  const breadcrumbs = [{ label: 'Analytics' }];

  return (
    <div className="space-y-6 text-slate-700 text-xs">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Engagement Trends Panel */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-1.5">
            <LineChart size={16} className="text-brand-550" /> Customer Engagement Trends (Q2 2026)
          </h3>
          <div className="h-60 bg-slate-50/50 rounded-2xl border border-slate-100/50 flex flex-col justify-between p-4 font-mono text-[9px] text-slate-400 select-none">
            <div className="flex justify-between items-center">
              <span>High (100)</span>
              <div className="h-0.5 flex-1 bg-slate-100/60 mx-2 border-dashed" />
            </div>
            <div className="flex justify-between items-center">
              <span>Medium (50)</span>
              <div className="h-0.5 flex-1 bg-slate-100/60 mx-2 border-dashed" />
            </div>
            <div className="flex justify-between items-center">
              <span>Low (0)</span>
              <div className="h-0.5 flex-1 bg-slate-100/60 mx-2 border-dashed" />
            </div>
            
            {/* Visual Bar representation */}
            <div className="flex items-end justify-around h-32 pt-2">
              <div className="flex flex-col items-center gap-1 w-8">
                <div className="w-4 bg-brand-550 rounded-t h-16 shadow-glossy-sm" />
                <span className="text-[8px]">JAN</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-8">
                <div className="w-4 bg-brand-550 rounded-t h-20 shadow-glossy-sm" />
                <span className="text-[8px]">FEB</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-8">
                <div className="w-4 bg-brand-550 rounded-t h-28 shadow-glossy-sm" />
                <span className="text-[8px]">MAR</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-8">
                <div className="w-4 bg-brand-550 rounded-t h-24 shadow-glossy-sm" />
                <span className="text-[8px]">APR</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-8">
                <div className="w-4 bg-brand-550 rounded-t h-32 shadow-glossy-sm" />
                <span className="text-[8px]">MAY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown by Industry card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-1.5">
            <Compass size={16} className="text-purple-500" /> Contacts by Industry
          </h3>
          <div className="space-y-3 font-bold text-[10px] text-slate-500 uppercase select-none">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Technology</span>
                <span className="text-slate-800">42%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-550 h-1.5 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Manufacturing</span>
                <span className="text-slate-800">28%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Healthcare</span>
                <span className="text-slate-800">18%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Government</span>
                <span className="text-slate-800">12%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
