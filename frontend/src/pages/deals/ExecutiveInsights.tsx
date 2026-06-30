import React, { useEffect } from 'react';
import { useDealStore } from '../../store/dealStore';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Award,
  Users2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Percent,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ExecutiveInsights: React.FC = () => {
  const { executiveInsights, fetchExecutiveInsights, loading } = useDealStore();

  useEffect(() => {
    fetchExecutiveInsights();
  }, []);

  const highestValueDeals = executiveInsights?.highestValueDeals || [];
  const dealsAtRisk = executiveInsights?.dealsAtRisk || [];
  const kpis = executiveInsights?.insightsKPIs || {
    winRate: 75,
    averageSalesCycle: 42,
    forecastAccuracy: 88,
    fastestClosingDealsCount: 14,
    longestSalesCycleCount: 5,
  };

  const revenueData = [
    { name: 'Qualified', value: 45000 },
    { name: 'Discovery', value: 72000 },
    { name: 'Proposal Sent', value: 120000 },
    { name: 'Negotiation', value: 185000 },
    { name: 'Contract Review', value: 95000 },
  ];

  const conversionData = [
    { stage: 'Qualified', rate: 90 },
    { stage: 'Discovery', rate: 75 },
    { stage: 'Proposal', rate: 60 },
    { stage: 'Negotiation', rate: 45 },
    { stage: 'Contract', rate: 85 },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Deals', link: '/deals' }, { label: 'Executive Insights' }]} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1">Executive Pipeline Insights</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">High-level sales intelligence, win metrics, and revenue forecast accuracy</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchExecutiveInsights()} className="border-slate-200">
          Sync Metrics
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center justify-between shadow-glossy-sm bg-white/70">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Win Rate</span>
            <h3 className="text-2xl font-black text-slate-850">{kpis.winRate}%</h3>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp size={10} /> +2.4% vs last quarter
            </span>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><Percent size={20} /></div>
        </Card>

        <Card className="p-5 flex items-center justify-between shadow-glossy-sm bg-white/70">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Sales Cycle</span>
            <h3 className="text-2xl font-black text-slate-850">{kpis.averageSalesCycle} Days</h3>
            <span className="text-[9px] text-slate-400 font-semibold">Discovery to closing contract</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Clock size={20} /></div>
        </Card>

        <Card className="p-5 flex items-center justify-between shadow-glossy-sm bg-white/70">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Forecast Accuracy</span>
            <h3 className="text-2xl font-black text-slate-850">{kpis.forecastAccuracy}%</h3>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
              <CheckCircle size={10} /> Highly predictable
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={20} /></div>
        </Card>

        <Card className="p-5 flex items-center justify-between shadow-glossy-sm bg-white/70">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Closed Deals</span>
            <h3 className="text-2xl font-black text-slate-850">{kpis.fastestClosingDealsCount + kpis.longestSalesCycleCount}</h3>
            <span className="text-[9px] text-rose-500 font-bold flex items-center gap-0.5">
              <AlertTriangle size={10} /> {kpis.longestSalesCycleCount} stalled cycle records
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Award size={20} /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE BY PIPELINE STAGE */}
        <Card className="p-5 lg:col-span-2 space-y-4 shadow-glossy bg-white/70">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Total Opportunity Value by Stage</h4>
            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Aggregated value of active sales contracts</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* PIPELINE CONVERSION */}
        <Card className="p-5 space-y-4 shadow-glossy bg-white/70">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Stage Conversion Efficiency</h4>
            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Average conversion rates between milestones</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HIGHEST VALUE DEALS */}
        <Card className="p-5 space-y-4 shadow-glossy bg-white/70">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Highest Value Active Contracts</h4>
              <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Top qualified deals in active stages</p>
            </div>
            <DollarSign size={16} className="text-brand-550" />
          </div>

          <div className="divide-y divide-slate-100">
            {highestValueDeals.map((d: any) => (
              <div key={d.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-slate-800">{d.name}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.companyName} &bull; {d.stage}</p>
                </div>
                <span className="font-black text-slate-850">${(d.value || 0).toLocaleString()}</span>
              </div>
            ))}
            {highestValueDeals.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">No active deals discovered.</p>
            )}
          </div>
        </Card>

        {/* DEALS AT RISK */}
        <Card className="p-5 space-y-4 shadow-glossy bg-white/70">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Priority Stalled Opportunities at Risk</h4>
              <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Automated risk tags based on activity gaps</p>
            </div>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>

          <div className="divide-y divide-slate-100">
            {dealsAtRisk.map((d: any) => (
              <div key={d.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-slate-800">{d.name}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Value: ${(d.value || 0).toLocaleString()}</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                  Critical
                </span>
              </div>
            ))}
            {dealsAtRisk.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">No flagged risks detected.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
