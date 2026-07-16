import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { BarChartWrapper, PieChartWrapper } from '../components/ui/Charts';
import { LineChart, Compass, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const Analytics: React.FC = () => {
  const breadcrumbs = [{ label: 'Analytics' }];

  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const industryData = [
    { name: 'Technology', value: 42, color: '#2563eb' },
    { name: 'Manufacturing', value: 28, color: '#a855f7' },
    { name: 'Healthcare', value: 18, color: '#10b981' },
    { name: 'Government', value: 12, color: '#f59e0b' },
  ];

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/trends');
        if (res.data?.success && res.data.data?.length > 0) {
          setTrendsData(res.data.data);
        } else {
          // Fallback static trends if database is unpopulated
          setTrendsData([
            { label: 'Jan', engagement: 65, activeUsers: 40 },
            { label: 'Feb', engagement: 75, activeUsers: 48 },
            { label: 'Mar', engagement: 85, activeUsers: 55 },
            { label: 'Apr', engagement: 78, activeUsers: 50 },
            { label: 'May', engagement: 95, activeUsers: 68 },
            { label: 'Jun', engagement: 90, activeUsers: 62 },
          ]);
        }
      } catch (err) {
        console.error('Failed to load analytics trends:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  return (
    <div className="space-y-6 text-slate-700 text-xs">
      <div className="flex flex-col gap-2 text-left">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Analytics</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Loading trends metrics...</p>
        </div>
      ) : (
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
                  { key: 'engagement', name: 'Engagement Score', color: '#0d9488' },
                  { key: 'activeUsers', name: 'Active Users (%)', color: '#38bdf8' }
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
      )}
    </div>
  );
};

export default Analytics;
