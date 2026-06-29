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
import { Plus, Edit3, Trash2, Play, Layers, X, GripVertical } from 'lucide-react';
import type { CompanySegment, CompanySegmentRule } from '../../../types/company';

interface SegmentsTabProps {
  companyId: string;
}

const RULE_FIELDS = [
  { value: 'industry', label: 'Industry' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'status', label: 'Status' },
  { value: 'annualRevenue', label: 'Annual Revenue' },
  { value: 'employeeCount', label: 'Employee Count' },
  { value: 'companyType', label: 'Company Type' },
  { value: 'rating', label: 'Rating' },
];

const RULE_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' },
];

const MATCH_TYPE_OPTIONS = [
  { value: 'ALL', label: 'ALL (must match all rules)' },
  { value: 'ANY', label: 'ANY (match any rule)' },
];

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f97316', label: 'Orange' },
];

interface SegmentFormData {
  name: string;
  description: string;
  color: string;
  matchType: string;
  rules: { field: string; operator: string; value: string }[];
}

const emptyForm: SegmentFormData = {
  name: '',
  description: '',
  color: '#3b82f6',
  matchType: 'ALL',
  rules: [{ field: 'industry', operator: 'equals', value: '' }],
};

export const SegmentsTab: React.FC<SegmentsTabProps> = ({ companyId }) => {
  const {
    segments, fetchSegments, createSegment, updateSegment, deleteSegment, evaluateSegment,
  } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CompanySegment | null>(null);
  const [form, setForm] = useState<SegmentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchSegments();
      setLoading(false);
    };
    load();
  }, [fetchSegments]);

  const openCreate = () => {
    setEditingSegment(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (segment: CompanySegment) => {
    setEditingSegment(segment);
    setForm({
      name: segment.name,
      description: segment.description || '',
      color: segment.color || '#3b82f6',
      matchType: segment.matchType,
      rules: segment.rules.length > 0
        ? segment.rules.map((r) => ({ field: r.field, operator: r.operator, value: r.value }))
        : [{ field: 'industry', operator: 'equals', value: '' }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingSegment) {
        await updateSegment(editingSegment.id, form);
      } else {
        await createSegment(form);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this segment?')) return;
    await deleteSegment(id);
  };

  const handleEvaluate = async (id: string) => {
    setEvaluatingId(id);
    await evaluateSegment(id);
    setEvaluatingId(null);
  };

  const addRule = () => {
    setForm((prev) => ({
      ...prev,
      rules: [...prev.rules, { field: 'industry', operator: 'equals', value: '' }],
    }));
  };

  const removeRule = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== idx),
    }));
  };

  const updateRule = (idx: number, field: keyof typeof form.rules[0], value: string) => {
    setForm((prev) => {
      const rules = [...prev.rules];
      rules[idx] = { ...rules[idx], [field]: value };
      return { ...prev, rules };
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Segments ({segments.length})</h3>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" /> Create Segment
        </Button>
      </div>

      {segments.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm font-medium text-center">
              No segments created yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {segments.map((segment, idx) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
            >
              <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: segment.color || '#3b82f6' }}
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{segment.name}</h4>
                        {segment.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{segment.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info" className="text-xs">
                        {segment.companyCount} companies
                      </Badge>
                      <Badge variant={segment.matchType === 'ALL' ? 'success' : 'warning'} className="text-xs">
                        {segment.matchType}
                      </Badge>
                    </div>
                  </div>

                  {segment.rules && segment.rules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {segment.rules.map((rule) => (
                        <span
                          key={rule.id}
                          className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                        >
                          {rule.field} {rule.operator} {rule.value}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100/60">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(segment)}>
                      <Edit3 size={12} className="mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(segment.id)}>
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => handleEvaluate(segment.id)}
                      isLoading={evaluatingId === segment.id}
                    >
                      <Play size={12} className="mr-1" /> Evaluate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSegment ? 'Edit Segment' : 'Create Segment'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Segment name"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c.value ? 'border-slate-700 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setForm((prev) => ({ ...prev, color: c.value }))}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <Select
            label="Match Type"
            options={MATCH_TYPE_OPTIONS}
            value={form.matchType}
            onChange={(e) => setForm((prev) => ({ ...prev, matchType: e.target.value }))}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rules</label>
              <Button variant="ghost" size="sm" onClick={addRule}>
                <Plus size={12} className="mr-1" /> Add Rule
              </Button>
            </div>
            {form.rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Select
                    options={RULE_FIELDS}
                    value={rule.field}
                    onChange={(e) => updateRule(idx, 'field', e.target.value)}
                  />
                  <Select
                    options={RULE_OPERATORS}
                    value={rule.operator}
                    onChange={(e) => updateRule(idx, 'operator', e.target.value)}
                  />
                  <Input
                    value={rule.value}
                    onChange={(e) => updateRule(idx, 'value', e.target.value)}
                    placeholder="Value"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRule(idx)}
                  className="text-slate-400 hover:text-red-500 p-1 mt-1.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>
              {editingSegment ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SegmentsTab;
