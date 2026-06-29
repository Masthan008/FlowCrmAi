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
  Plus, Edit3, Trash2, Calendar, Clock, User, Bell,
} from 'lucide-react';
import type { CompanyFollowup } from '../../../types/company';

interface FollowupsTabProps {
  companyId: string;
}

const FOLLOWUP_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo', label: 'Demo' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'overdue', label: 'Overdue' },
];

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'error' | 'info' | 'neutral'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'neutral',
  overdue: 'error',
};

const PRIORITY_BADGE: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
};

interface FollowupFormData {
  type: string;
  title: string;
  description: string;
  ownerId: string;
  dueDate: string;
  priority: string;
  reminderDate: string;
}

const emptyForm: FollowupFormData = {
  type: 'call',
  title: '',
  description: '',
  ownerId: '',
  dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  priority: 'medium',
  reminderDate: '',
};

export const FollowupsTab: React.FC<FollowupsTabProps> = ({ companyId }) => {
  const {
    followups, employees, fetchFollowups, fetchEmployees,
    createFollowup, updateFollowup, deleteFollowup,
  } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<CompanyFollowup | null>(null);
  const [form, setForm] = useState<FollowupFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchFollowups(companyId), fetchEmployees()]);
      setLoading(false);
    };
    load();
  }, [companyId, fetchFollowups, fetchEmployees]);

  useEffect(() => {
    if (!showModal) {
      setEditingFollowup(null);
      setForm(emptyForm);
    }
  }, [showModal]);

  const openCreate = () => {
    setEditingFollowup(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (fu: CompanyFollowup) => {
    setEditingFollowup(fu);
    setForm({
      type: fu.type,
      title: fu.title,
      description: fu.description || '',
      ownerId: fu.ownerId || '',
      dueDate: fu.dueDate.split('T')[0],
      priority: fu.priority,
      reminderDate: fu.reminderDate ? fu.reminderDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || null,
        ownerId: form.ownerId || null,
        dueDate: new Date(form.dueDate).toISOString(),
        priority: form.priority,
        reminderDate: form.reminderDate ? new Date(form.reminderDate).toISOString() : null,
      };
      if (editingFollowup) {
        await updateFollowup(companyId, editingFollowup.id, payload);
      } else {
        await createFollowup(companyId, payload);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this follow-up?')) return;
    await deleteFollowup(companyId, id);
  };

  const sorted = [...followups].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Follow-ups ({followups.length})</h3>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" /> Create Follow-up
        </Button>
      </div>

      {followups.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm font-medium text-center">
              No follow-ups created yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((fu, idx) => (
            <motion.div
              key={fu.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
            >
              <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="info" className="text-[10px]">{fu.type}</Badge>
                        <Badge variant={PRIORITY_BADGE[fu.priority] || 'neutral'} className="text-[10px]">
                          {fu.priority}
                        </Badge>
                        <Badge variant={STATUS_VARIANTS[fu.status] || 'neutral'} className="text-[10px]">
                          {fu.status}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">{fu.title}</h4>
                      {fu.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{fu.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(fu.dueDate).toLocaleDateString()}
                        </span>
                        {fu.reminderDate && (
                          <span className="flex items-center gap-1">
                            <Bell size={11} />
                            {new Date(fu.reminderDate).toLocaleDateString()}
                          </span>
                        )}
                        {fu.owner && (
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            {fu.owner.firstName} {fu.owner.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(fu)}>
                        <Edit3 size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(fu.id)}>
                        <Trash2 size={12} />
                      </Button>
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
        title={editingFollowup ? 'Edit Follow-up' : 'Create Follow-up'}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Type"
            options={FOLLOWUP_TYPES}
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          />
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Follow-up title"
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea
              className="glass-input w-full text-sm text-slate-700 py-2.5 px-4 border border-slate-200/80 rounded-xl focus:border-brand-550 focus:ring-2 focus:ring-brand-100 resize-none"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>
          <Select
            label="Owner"
            options={[
              { value: '', label: 'Unassigned' },
              ...employees.map((e) => ({
                value: e.id,
                label: `${e.firstName} ${e.lastName}`,
              })),
            ]}
            value={form.ownerId}
            onChange={(e) => setForm((prev) => ({ ...prev, ownerId: e.target.value }))}
          />
          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
          />
          <Input
            label="Reminder Date"
            type="date"
            value={form.reminderDate}
            onChange={(e) => setForm((prev) => ({ ...prev, reminderDate: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>
              {editingFollowup ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FollowupsTab;
