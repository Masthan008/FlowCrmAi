import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../../store/companyStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import {
  ArrowRight, Clock, RotateCcw, History, RefreshCw,
} from 'lucide-react';

interface LifecycleTabProps {
  companyId: string;
}

const STAGE_COLORS: Record<string, string> = {
  lead: 'text-blue-600 bg-blue-50 border-blue-200',
  prospect: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  qualified: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  customer: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  active: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  at_risk: 'text-amber-600 bg-amber-50 border-amber-200',
  churned: 'text-rose-600 bg-rose-50 border-rose-200',
  reactivated: 'text-violet-600 bg-violet-50 border-violet-200',
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  qualified: 'Qualified',
  customer: 'Customer',
  active: 'Active',
  at_risk: 'At Risk',
  churned: 'Churned',
  reactivated: 'Reactivated',
};

const NEXT_STAGES: Record<string, string[]> = {
  lead: ['prospect'],
  prospect: ['qualified'],
  qualified: ['customer'],
  customer: ['at_risk', 'reactivated'],
  active: ['at_risk', 'reactivated'],
  at_risk: ['churned', 'reactivated'],
  churned: ['reactivated'],
  reactivated: ['customer', 'active'],
};

export const LifecycleTab: React.FC<LifecycleTabProps> = ({ companyId }) => {
  const {
    lifecycle, stageHistory, fetchLifecycle, fetchStageHistory, updateLifecycle,
  } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchLifecycle(companyId), fetchStageHistory(companyId)]);
      setLoading(false);
    };
    load();
  }, [companyId, fetchLifecycle, fetchStageHistory]);

  const handleTransition = async () => {
    if (!selectedStage) return;
    setTransitioning(true);
    await updateLifecycle(companyId, { currentStage: selectedStage, changeReason });
    setTransitioning(false);
    setShowTransition(false);
    setSelectedStage('');
    setChangeReason('');
    await fetchStageHistory(companyId);
  };

  const formatDuration = (days: number) => {
    if (days < 1) return '< 1 day';
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return `${months}m ${remainingDays}d`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!lifecycle) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <History size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-medium text-center">
            No lifecycle data. The company lifecycle will be tracked automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStage = lifecycle.currentStage;
  const stageColorClass = STAGE_COLORS[currentStage] || 'text-slate-600 bg-slate-50 border-slate-200';
  const stageLabel = STAGE_LABELS[currentStage] || currentStage;
  const nextStages = NEXT_STAGES[currentStage] || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Current Lifecycle Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-base ${stageColorClass}`}>
                {stageLabel}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={14} />
                <span>{formatDuration(lifecycle.duration)} in stage</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transitions</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">{lifecycle.transitionCount}</p>
              </div>
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Transition</span>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {lifecycle.lastTransition ? new Date(lifecycle.lastTransition).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Previous Stage</span>
                <p className="text-sm font-semibold text-slate-700 mt-1 capitalize">
                  {lifecycle.previousStage ? STAGE_LABELS[lifecycle.previousStage] || lifecycle.previousStage : 'N/A'}
                </p>
              </div>
            </div>

            {nextStages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Recommended Next Stages</h4>
                <div className="flex flex-wrap gap-2">
                  {nextStages.map((stage) => (
                    <Button
                      key={stage}
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        setSelectedStage(stage);
                        setShowTransition(true);
                      }}
                    >
                      <ArrowRight size={14} className="mr-1" />
                      {STAGE_LABELS[stage] || stage}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {stageHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Stage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {stageHistory.map((entry, idx) => (
                  <div key={entry.id} className="flex items-start gap-4 pb-4 border-l-2 border-slate-100 ml-2 pl-6 relative last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-550 border-2 border-white shadow-sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        {entry.changedBy && (
                          <span className="text-xs text-slate-400">by {entry.changedBy}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">
                        {entry.fromStage ? `${STAGE_LABELS[entry.fromStage] || entry.fromStage} → ` : ''}
                        {STAGE_LABELS[entry.toStage] || entry.toStage}
                      </p>
                      {entry.changeReason && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">{entry.changeReason}</p>
                      )}
                      {entry.durationInStage != null && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock size={11} /> Duration: {formatDuration(entry.durationInStage)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Modal isOpen={showTransition} onClose={() => setShowTransition(false)} title="Transition Stage">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Stage</label>
            <p className="text-sm font-semibold text-slate-800 mt-1 capitalize">
              {STAGE_LABELS[selectedStage] || selectedStage}
            </p>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Change Reason</label>
            <textarea
              className="glass-input w-full text-sm text-slate-700 py-2.5 px-4 border border-slate-200/80 rounded-xl focus:border-brand-550 focus:ring-2 focus:ring-brand-100 resize-none"
              rows={3}
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Optional reason for this transition"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowTransition(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleTransition} isLoading={transitioning}>
              <RefreshCw size={14} className="mr-1" /> Transition
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LifecycleTab;
