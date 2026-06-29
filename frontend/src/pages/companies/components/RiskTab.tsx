import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../../store/companyStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { AlertTriangle, Shield, RefreshCw, AlertCircle } from 'lucide-react';

interface RiskTabProps {
  companyId: string;
}

const RISK_FACTORS = [
  { key: 'inactiveDaysRisk', label: 'Inactive Days', color: 'bg-red-500' },
  { key: 'lostDealsRisk', label: 'Lost Deals', color: 'bg-orange-500' },
  { key: 'pendingPaymentsRisk', label: 'Pending Payments', color: 'bg-amber-500' },
  { key: 'noMeetingsRisk', label: 'No Meetings', color: 'bg-rose-500' },
  { key: 'lowEngagementRisk', label: 'Low Engagement', color: 'bg-pink-500' },
  { key: 'revenueDeclineRisk', label: 'Revenue Decline', color: 'bg-red-600' },
  { key: 'expiredContractsRisk', label: 'Expired Contracts', color: 'bg-orange-600' },
];

const getRiskLevel = (level: string): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } => {
  switch (level?.toLowerCase()) {
    case 'low': return { label: 'Low', variant: 'success' };
    case 'medium': return { label: 'Medium', variant: 'warning' };
    case 'high': return { label: 'High', variant: 'error' };
    case 'critical': return { label: 'Critical', variant: 'error' };
    default: return { label: level || 'Unknown', variant: 'neutral' };
  }
};

export const RiskTab: React.FC<RiskTabProps> = ({ companyId }) => {
  const { risk, fetchRisk, calculateRisk } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchRisk(companyId);
      setLoading(false);
    };
    load();
  }, [companyId, fetchRisk]);

  const handleCalculate = async () => {
    setCalculating(true);
    await calculateRisk(companyId);
    setCalculating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!risk) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Shield size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-medium text-center mb-4">
            Risk assessment not yet performed.
          </p>
          <Button variant="primary" onClick={handleCalculate} isLoading={calculating}>
            <AlertTriangle size={14} className="mr-1" /> Calculate Risk
          </Button>
        </CardContent>
      </Card>
    );
  }

  const riskInfo = getRiskLevel(risk.riskLevel);

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
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Last calculated: {new Date(risk.lastCalculatedAt).toLocaleDateString()}</CardDescription>
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
                    stroke={risk.overallRisk <= 30 ? '#10b981' : risk.overallRisk <= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(risk.overallRisk / 100) * 264} 264`}
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-slate-800">{risk.overallRisk}</span>
              </div>
              <div>
                <Badge variant={riskInfo.variant} className="text-sm px-3 py-1">
                  {riskInfo.label}
                </Badge>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Overall Risk Score
                </p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-700 mb-4">Risk Factors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {RISK_FACTORS.map((factor) => {
                const value = (risk as any)[factor.key] ?? 0;
                return (
                  <div key={factor.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">{factor.label}</span>
                      <span className="text-xs font-bold text-slate-700">{value}/100</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${factor.color}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {risk.riskReasons && risk.riskReasons.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Risk Reasons</h4>
                <ul className="space-y-2">
                  {risk.riskReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RiskTab;
