import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../../store/companyStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  Lightbulb, Plus, CheckCircle, BookOpen, ChevronDown, ChevronRight, Sparkles,
} from 'lucide-react';
import type { CompanyRecommendation } from '../../../types/company';

interface RecommendationsTabProps {
  companyId: string;
}

const RECOMMENDATION_TYPES = [
  { value: 'upsell', label: 'Upsell' },
  { value: 'cross_sell', label: 'Cross Sell' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'retention', label: 'Retention' },
  { value: 'risk_mitigation', label: 'Risk Mitigation' },
  { value: 'growth', label: 'Growth' },
  { value: 'general', label: 'General' },
];

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-rose-600 bg-rose-50 border-rose-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-slate-600 bg-slate-50 border-slate-200',
};

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ companyId }) => {
  const { recommendations, fetchRecommendations, createRecommendation } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupBy, setGroupBy] = useState<'priority' | 'type'>('priority');
  const [newType, setNewType] = useState('general');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchRecommendations(companyId);
      setLoading(false);
    };
    load();
  }, [companyId, fetchRecommendations]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await createRecommendation(companyId, {
      type: newType,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      priority: newPriority,
    });
    setSaving(false);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewType('general');
    setNewPriority('medium');
  };

  const handleMarkRead = async (rec: CompanyRecommendation) => {
    try {
      const { updateRecommendation } = useCompanyStore.getState();
      if (updateRecommendation) {
        await updateRecommendation(companyId, rec.id, { isRead: true });
      }
    } catch {
      //
    }
  };

  const sorted = [...recommendations].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const grouped = sorted.reduce<Record<string, CompanyRecommendation[]>>((acc, rec) => {
    const key = groupBy === 'priority' ? rec.priority : rec.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rec);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Recommendations</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGroupBy(groupBy === 'priority' ? 'type' : 'priority')}
          >
            {groupBy === 'priority' ? <ChevronRight size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
            Group by {groupBy === 'priority' ? 'Type' : 'Priority'}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} className="mr-1" /> Create Recommendation
          </Button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Lightbulb size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm font-medium text-center">
              No recommendations yet. Recommendations will appear as AI-driven insights become available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([key, recs]) => (
            <div key={key}>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                {key} ({recs.length})
              </h4>
              <div className="space-y-3">
                {recs.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    <Card className={`bg-white/70 backdrop-blur-md border shadow-sm rounded-2xl ${rec.isRead ? 'opacity-60' : ''}`}>
                      <CardContent className="flex items-start gap-4">
                        <div className={`shrink-0 w-1 self-stretch rounded-full ${
                          rec.priority === 'critical' ? 'bg-rose-500' :
                          rec.priority === 'high' ? 'bg-orange-500' :
                          rec.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="info" className="text-[10px]">{rec.type}</Badge>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[rec.priority] || ''}`}>
                              {rec.priority}
                            </span>
                            {rec.confidence > 0 && (
                              <span className="text-[10px] text-slate-400">{(rec.confidence * 100).toFixed(0)}% confidence</span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-800">{rec.title}</h4>
                          {rec.description && (
                            <p className="text-xs text-slate-500 mt-1">{rec.description}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-2">
                            {new Date(rec.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!rec.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkRead(rec)}
                              title="Mark as read"
                            >
                              <BookOpen size={12} />
                            </Button>
                          )}
                          {!rec.isActioned && (
                            <Button variant="glass" size="sm" title="Mark as actioned">
                              <CheckCircle size={12} className="mr-1" /> Action
                            </Button>
                          )}
                          {rec.isActioned && (
                            <Badge variant="success" className="text-[10px]">Actioned</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Recommendation">
        <div className="space-y-4">
          <Select
            label="Type"
            options={RECOMMENDATION_TYPES}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <Input
            label="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Recommendation title"
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea
              className="glass-input w-full text-sm text-slate-700 py-2.5 px-4 border border-slate-200/80 rounded-xl focus:border-brand-550 focus:ring-2 focus:ring-brand-100 resize-none"
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe this recommendation"
            />
          </div>
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} isLoading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecommendationsTab;
