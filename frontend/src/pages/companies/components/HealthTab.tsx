import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../../store/companyStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Activity, Heart, RefreshCw } from 'lucide-react';

interface HealthTabProps {
  companyId: string;
}

const HEALTH_METRICS = [
  { key: 'communicationHealth', label: 'Communication', color: 'bg-blue-500' },
  { key: 'dealSuccessHealth', label: 'Deal Success', color: 'bg-emerald-500' },
  { key: 'revenueGrowthHealth', label: 'Revenue Growth', color: 'bg-violet-500' },
  { key: 'meetingHealth', label: 'Meeting Frequency', color: 'bg-amber-500' },
  { key: 'satisfactionHealth', label: 'Satisfaction', color: 'bg-pink-500' },
  { key: 'supportHealth', label: 'Support', color: 'bg-cyan-500' },
  { key: 'paymentHealth', label: 'Payment History', color: 'bg-indigo-500' },
  { key: 'activityHealth', label: 'Activity Frequency', color: 'bg-rose-500' },
];

const getHealthStatus = (score: number): { label: string; variant: 'success' | 'info' | 'warning' | 'error' | 'neutral' } => {
  if (score >= 80) return { label: 'Excellent', variant: 'success' };
  if (score >= 60) return { label: 'Good', variant: 'info' };
  if (score >= 40) return { label: 'Average', variant: 'warning' };
  if (score >= 20) return { label: 'Poor', variant: 'error' };
  return { label: 'Critical', variant: 'error' };
};

export const HealthTab: React.FC<HealthTabProps> = ({ companyId }) => {
  const { health, fetchHealth, calculateHealth } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchHealth(companyId);
      setLoading(false);
    };
    load();
  }, [companyId, fetchHealth]);

  const handleCalculate = async () => {
    setCalculating(true);
    await calculateHealth(companyId);
    setCalculating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!health) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Heart size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-medium text-center mb-4">
            Health data not yet calculated. Click 'Calculate Health' to generate.
          </p>
          <Button variant="primary" onClick={handleCalculate} isLoading={calculating}>
            <Activity size={14} className="mr-1" /> Calculate Health
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getHealthStatus(health.overallHealth);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Company Health</CardTitle>
              <CardDescription>Last calculated: {new Date(health.lastCalculatedAt).toLocaleDateString()}</CardDescription>
            </div>
            <Button variant="glass" size="sm" onClick={handleCalculate} isLoading={calculating}>
              <RefreshCw size={14} className="mr-1" /> Recalculate
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={health.overallHealth >= 60 ? '#10b981' : health.overallHealth >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(health.overallHealth / 100) * 264} 264`}
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-slate-800">{health.overallHealth}</span>
              </div>
              <div>
                <Badge variant={statusInfo.variant} className="text-sm px-3 py-1">
                  {statusInfo.label}
                </Badge>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Activity size={12} /> Overall Health Score
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HEALTH_METRICS.map((metric) => {
                const value = (health as any)[metric.key] ?? 0;
                return (
                  <div key={metric.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">{metric.label}</span>
                      <span className="text-xs font-bold text-slate-700">{value}/100</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${metric.color}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default HealthTab;
