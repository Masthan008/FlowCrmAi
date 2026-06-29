import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../../store/companyStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { BarChart3, RefreshCw, TrendingUp } from 'lucide-react';

interface ScoreTabProps {
  companyId: string;
}

const SCORE_COMPONENTS = [
  { key: 'revenueScore', label: 'Revenue Score', color: 'bg-emerald-500' },
  { key: 'dealValueScore', label: 'Deal Value', color: 'bg-blue-500' },
  { key: 'engagementScore', label: 'Engagement', color: 'bg-violet-500' },
  { key: 'meetingScore', label: 'Meetings', color: 'bg-amber-500' },
  { key: 'taskScore', label: 'Tasks', color: 'bg-cyan-500' },
  { key: 'communicationScore', label: 'Communication', color: 'bg-pink-500' },
  { key: 'lifetimeScore', label: 'Lifetime', color: 'bg-indigo-500' },
];

export const ScoreTab: React.FC<ScoreTabProps> = ({ companyId }) => {
  const { score, fetchScore, calculateScore } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchScore(companyId);
      setLoading(false);
    };
    load();
  }, [companyId, fetchScore]);

  const handleCalculate = async () => {
    setCalculating(true);
    await calculateScore(companyId);
    setCalculating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!score) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BarChart3 size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-medium text-center mb-4">
            Score not yet calculated.
          </p>
          <Button variant="primary" onClick={handleCalculate} isLoading={calculating}>
            <TrendingUp size={14} className="mr-1" /> Calculate Score
          </Button>
        </CardContent>
      </Card>
    );
  }

  const ringColor = score.overallScore >= 70
    ? '#10b981'
    : score.overallScore >= 40
      ? '#f59e0b'
      : '#ef4444';
  const circumference = 2 * Math.PI * 54;

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
              <CardTitle>Company Score</CardTitle>
              <CardDescription>Last calculated: {new Date(score.lastCalculatedAt).toLocaleDateString()}</CardDescription>
            </div>
            <Button variant="glass" size="sm" onClick={handleCalculate} isLoading={calculating}>
              <RefreshCw size={14} className="mr-1" /> Recalculate
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 mb-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={ringColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(score.overallScore / 100) * circumference} ${circumference}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-slate-800">{score.overallScore}</span>
                  <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <span className="text-xs text-slate-500">Revenue</span>
                <span className="text-xs font-bold text-slate-700 text-right">{score.revenueScore}</span>
                <span className="text-xs text-slate-500">Deal Value</span>
                <span className="text-xs font-bold text-slate-700 text-right">{score.dealValueScore}</span>
                <span className="text-xs text-slate-500">Engagement</span>
                <span className="text-xs font-bold text-slate-700 text-right">{score.engagementScore}</span>
                <span className="text-xs text-slate-500">Lifetime</span>
                <span className="text-xs font-bold text-slate-700 text-right">{score.lifetimeScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCORE_COMPONENTS.map((component) => {
                const value = (score as any)[component.key] ?? 0;
                return (
                  <div key={component.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">{component.label}</span>
                      <span className="text-xs font-bold text-slate-700">{value}/100</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${component.color}`}
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

export default ScoreTab;
