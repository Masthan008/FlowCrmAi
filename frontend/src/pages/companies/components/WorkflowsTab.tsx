import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../../store/companyStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  Plus, Play, Settings, ToggleLeft, ToggleRight, Trash2, Workflow, X,
} from 'lucide-react';
import type { CompanyWorkflow } from '../../../types/company';

interface WorkflowsTabProps {
  companyId: string;
}

const TRIGGER_TYPES = [
  { value: 'stage_change', label: 'Stage Change' },
  { value: 'score_change', label: 'Score Change' },
  { value: 'health_change', label: 'Health Change' },
  { value: 'risk_change', label: 'Risk Change' },
  { value: 'tag_added', label: 'Tag Added' },
  { value: 'activity_created', label: 'Activity Created' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'manual', label: 'Manual' },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
];

const ACTION_TYPES = [
  { value: 'assign_owner', label: 'Assign Owner' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'create_meeting', label: 'Create Meeting' },
  { value: 'send_email', label: 'Send Email' },
  { value: 'update_status', label: 'Update Status' },
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'create_note', label: 'Create Note' },
  { value: 'webhook', label: 'Webhook' },
];

interface WorkflowFormData {
  name: string;
  description: string;
  triggerType: string;
  triggerConfig: string;
  conditions: { field: string; operator: string; value: string }[];
  actions: { type: string; config: string }[];
}

const emptyForm: WorkflowFormData = {
  name: '',
  description: '',
  triggerType: 'manual',
  triggerConfig: '{}',
  conditions: [{ field: '', operator: 'equals', value: '' }],
  actions: [{ type: 'create_task', config: '{}' }],
};

export const WorkflowsTab: React.FC<WorkflowsTabProps> = ({ companyId }) => {
  const { workflows, fetchWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<CompanyWorkflow | null>(null);
  const [form, setForm] = useState<WorkflowFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchWorkflows();
      setLoading(false);
    };
    load();
  }, [fetchWorkflows]);

  const openCreate = () => {
    setEditingWorkflow(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (wf: CompanyWorkflow) => {
    setEditingWorkflow(wf);
    setForm({
      name: wf.name,
      description: wf.description || '',
      triggerType: wf.triggerType,
      triggerConfig: typeof wf.triggerConfig === 'string' ? wf.triggerConfig : JSON.stringify(wf.triggerConfig, null, 2),
      conditions: wf.conditions.length > 0
        ? wf.conditions.map((c: any) => ({ field: c.field || '', operator: c.operator || 'equals', value: c.value || '' }))
        : [{ field: '', operator: 'equals', value: '' }],
      actions: wf.actions.length > 0
        ? wf.actions.map((a: any) => ({ type: a.type || 'create_task', config: typeof a.config === 'string' ? a.config : JSON.stringify(a.config || {}, null, 2) }))
        : [{ type: 'create_task', config: '{}' }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        triggerType: form.triggerType,
        triggerConfig: (() => { try { return JSON.parse(form.triggerConfig); } catch { return form.triggerConfig; } })(),
        conditions: form.conditions.filter((c) => c.field.trim()).map((c) => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
        })),
        actions: form.actions.map((a) => ({
          type: a.type,
          config: (() => { try { return JSON.parse(a.config); } catch { return a.config; } })(),
        })),
      };
      if (editingWorkflow) {
        await updateWorkflow(editingWorkflow.id, payload);
      } else {
        await createWorkflow(payload);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (wf: CompanyWorkflow) => {
    await updateWorkflow(wf.id, { isActive: !wf.isActive });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this workflow?')) return;
    await deleteWorkflow(id);
  };

  const addCondition = () => {
    setForm((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: 'equals', value: '' }],
    }));
  };

  const removeCondition = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== idx),
    }));
  };

  const updateCondition = (idx: number, field: keyof typeof form.conditions[0], value: string) => {
    setForm((prev) => {
      const conditions = [...prev.conditions];
      conditions[idx] = { ...conditions[idx], [field]: value };
      return { ...prev, conditions };
    });
  };

  const addAction = () => {
    setForm((prev) => ({
      ...prev,
      actions: [...prev.actions, { type: 'create_task', config: '{}' }],
    }));
  };

  const removeAction = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== idx),
    }));
  };

  const updateAction = (idx: number, field: keyof typeof form.actions[0], value: string) => {
    setForm((prev) => {
      const actions = [...prev.actions];
      actions[idx] = { ...actions[idx], [field]: value };
      return { ...prev, actions };
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Workflows ({workflows.length})</h3>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" /> Create Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Workflow size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm font-medium text-center">
              No workflows created yet. Create your first workflow to automate company processes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf, idx) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
            >
              <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-semibold text-slate-800">{wf.name}</h4>
                        <Badge variant="info" className="text-[10px]">{wf.triggerType}</Badge>
                        {wf.isActive ? (
                          <Badge variant="success" className="text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      {wf.description && (
                        <p className="text-xs text-slate-500 mt-1">{wf.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>Runs: {wf.runCount}</span>
                        {wf.lastRunAt && (
                          <span>Last run: {new Date(wf.lastRunAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(wf)}
                        className={`p-1.5 rounded-lg transition-all ${wf.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
                        title={wf.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {wf.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(wf)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        title="Edit"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(wf.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
        title={editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Workflow name"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
          <Select
            label="Trigger Type"
            options={TRIGGER_TYPES}
            value={form.triggerType}
            onChange={(e) => setForm((prev) => ({ ...prev, triggerType: e.target.value }))}
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trigger Config (JSON)</label>
            <textarea
              className="glass-input w-full text-sm text-slate-700 py-2.5 px-4 border border-slate-200/80 rounded-xl focus:border-brand-550 focus:ring-2 focus:ring-brand-100 font-mono text-xs resize-none"
              rows={3}
              value={form.triggerConfig}
              onChange={(e) => setForm((prev) => ({ ...prev, triggerConfig: e.target.value }))}
              placeholder='{"key": "value"}'
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conditions</label>
              <Button variant="ghost" size="sm" onClick={addCondition}>
                <Plus size={12} className="mr-1" /> Add Condition
              </Button>
            </div>
            {form.conditions.map((cond, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    value={cond.field}
                    onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                    placeholder="Field"
                  />
                  <Select
                    options={CONDITION_OPERATORS}
                    value={cond.operator}
                    onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                  />
                  <Input
                    value={cond.value}
                    onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                    placeholder="Value"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCondition(idx)}
                  className="text-slate-400 hover:text-red-500 p-1 mt-1.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</label>
              <Button variant="ghost" size="sm" onClick={addAction}>
                <Plus size={12} className="mr-1" /> Add Action
              </Button>
            </div>
            {form.actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Select
                    options={ACTION_TYPES}
                    value={action.type}
                    onChange={(e) => updateAction(idx, 'type', e.target.value)}
                  />
                  <div className="flex flex-col space-y-1.5">
                    <textarea
                      className="glass-input w-full text-sm text-slate-700 py-2 px-3 border border-slate-200/80 rounded-xl focus:border-brand-550 focus:ring-2 focus:ring-brand-100 font-mono text-xs resize-none"
                      rows={2}
                      value={action.config}
                      onChange={(e) => updateAction(idx, 'config', e.target.value)}
                      placeholder='{"key": "value"}'
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAction(idx)}
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
              {editingWorkflow ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkflowsTab;
