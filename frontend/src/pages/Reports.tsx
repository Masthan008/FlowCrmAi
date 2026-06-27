import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { BarChart3, TrendingUp, Users, DollarSign, Award, Target, HelpCircle } from 'lucide-react';

export const Reports: React.FC = () => {
  const breadcrumbs = [{ label: 'Reports' }];

  return (
    <div className="space-y-6 text-slate-700 text-xs">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Reports Dashboard</h1>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        <div className="glass-card p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">$324,500</h2>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 12.4% from last month</span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Win conversion rate</span>
            <Target size={16} className="text-brand-550" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">24.6%</h2>
          <span className="text-[10px] text-slate-400 font-semibold">Average sale cycle: 18 days</span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active pipeline opportunities</span>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">$185,000</h2>
          <span className="text-[10px] text-amber-600 font-bold">↑ 4 new opportunities added</span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales Executives</span>
            <Users size={16} className="text-purple-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">6 Members</h2>
          <span className="text-[10px] text-emerald-600 font-bold">All active in workspace</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Representative Card */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Monthly Performance Leaderboard</h3>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-1">
                <span>Alex Mercer</span>
                <span>$145,000 generated (4 deals)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-550 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-1">
                <span>Sarah Connor</span>
                <span>$98,000 generated (3 deals)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-550 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-1">
                <span>John Doe</span>
                <span>$63,500 generated (2 deals)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Conversion funnels */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Lead Conversion Funnel</h3>
          <div className="space-y-3 text-[10px] font-bold text-slate-500 uppercase select-none">
            <div className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
              <span>Total Lead Inflow</span>
              <span className="text-slate-800 font-black">240 Leads</span>
            </div>
            <div className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
              <span>Leads Contacted</span>
              <span className="text-slate-800 font-black">180 Leads (75%)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
              <span>Leads Qualified</span>
              <span className="text-slate-800 font-black">120 Leads (50%)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
              <span>Converted Customers</span>
              <span className="text-brand-650 font-black">59 Customers (24.6%)</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reports;
