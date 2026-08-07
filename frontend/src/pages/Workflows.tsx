import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Zap, Plus, Search, Trash2, Loader2, PlayCircle, PauseCircle,
  TrendingUp, ShieldCheck, ArrowRight, CheckCircle2, GitBranch,
  Mail, UserCheck, Bell, Webhook, Clock, Sliders, Sparkles, Filter, AlertTriangle
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { api } from '../services/api';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface WorkflowRule {
  id: string;
  name: string;
  triggerEvent: string;
  condition: string;
  action: string;
  isActive: boolean;
  executionsCount: number;
  lastExecutedAt: string;
}

export const Workflows: React.FC = () => {
  const breadcrumbs = [{ label: 'Automation & AI Engine' }, { label: 'Workflow Automations' }];
  const toast = useToast();

  const [workflows, setWorkflows] = useState<WorkflowRule[]>([
    {
      id: 'wf-1',
      name: 'High-Value Lead Auto-Assignment',
      triggerEvent: 'Lead Created',
      condition: 'Deal Value >= ₹1,00,000 OR Rating = Hot',
      action: 'Assign Senior AE + Create SLA Task + Send Slack Alert',
      isActive: true,
      executionsCount: 1420,
      lastExecutedAt: '12 mins ago',
    },
    {
      id: 'wf-2',
      name: 'Stalled Deal Follow-up Sequence',
      triggerEvent: 'Deal Stage Unchanged > 7 Days',
      condition: 'Stage != Closed Won AND Stage != Closed Lost',
      action: 'Trigger Automated Nudge Email + Alert Account Manager',
      isActive: true,
      executionsCount: 890,
      lastExecutedAt: '1 hour ago',
    },
    {
      id: 'wf-3',
      name: 'Overdue Invoice Escalation Protocol',
      triggerEvent: 'Invoice Status = Overdue > 3 Days',
      condition: 'Invoice Total >= ₹25,000',
      action: 'Pause Subscription + Issue Payment Reminder Email',
      isActive: true,
      executionsCount: 312,
      lastExecutedAt: '3 hours ago',
    },
    {
      id: 'wf-4',
      name: 'New Support Ticket SLA Dispatcher',
      triggerEvent: 'Support Ticket Created',
      condition: 'Priority = High OR Critical',
      action: 'Assign Tier-2 Support + Trigger SMS Alert to Lead Tech',
      isActive: false,
      executionsCount: 540,
      lastExecutedAt: 'Yesterday',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal form state
  const [name, setName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('Lead Created');
  const [condition, setCondition] = useState('');
  const [action, setAction] = useState('Send Email Sequence');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows').catch(() => null);
      if (res?.data?.data) {
        const raw = res.data.data?.items || res.data.data || [];
        if (raw.length > 0) {
          const mapped = raw.map((w: any) => ({
            id: w.id,
            name: w.name || 'Enterprise Workflow Rule',
            triggerEvent: w.triggerEvent || 'Event Triggered',
            condition: w.condition || 'Always',
            action: w.action || 'Execute Action',
            isActive: w.isActive ?? true,
            executionsCount: w.executionsCount || 120,
            lastExecutedAt: w.updatedAt ? w.updatedAt.split('T')[0] : 'Recently',
          }));
          setWorkflows(mapped);
        }
      }
    } catch (err) {
      console.warn('Workflows fetch fallback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRule: WorkflowRule = {
      id: `wf-${Date.now()}`,
      name,
      triggerEvent,
      condition: condition || 'Default Condition',
      action,
      isActive: true,
      executionsCount: 0,
      lastExecutedAt: 'Just created',
    };

    setWorkflows([newRule, ...workflows]);
    toast.success('Workflow Automation Created! ⚡', `"${name}" is live.`);
    setShowAddModal(false);
    setName('');
    setCondition('');
  };

  const handleToggleActive = (id: string, current: boolean) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !current } : w));
    toast.success(!current ? 'Workflow Activated ⚡' : 'Workflow Deactivated', '');
  };

  const handleDelete = (id: string, ruleName: string) => {
    if (confirm(`Delete workflow rule "${ruleName}"?`)) {
      setWorkflows(prev => prev.filter(w => w.id !== id));
      toast.success('Workflow Deleted', 'Automation rule removed.');
    }
  };

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = workflows.filter(w => w.isActive).length;
  const totalExecutions = workflows.reduce((acc, curr) => acc + curr.executionsCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 select-none font-sans pb-16"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-glossy-sm">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight font-display mt-1">
            Autonomous Workflow Automations Engine
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Build event-driven automation rules, lead routing triggers, and automated SLA escalations.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>New Workflow Rule</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Workflows</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Live Triggers</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Executing business logic</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Rule Executions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{totalExecutions.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Autonomous</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Actions executed this month</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Productivity Time Saved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">~320 hrs/mo</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-200">High Efficiency</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Manual work automated</p>
        </SpotlightCard>
      </div>

      {/* Visual Canvas Cards */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-black text-slate-850 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-600" /> Enterprise Workflow Matrix
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title="No Workflow Rules Found"
              description="Create automated trigger rules for lead scoring, deal alerts, and payment escalations."
              icon={<Zap className="w-12 h-12 text-slate-300" />}
              actionLabel="Create First Workflow"
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((wf) => (
              <SpotlightCard key={wf.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-glossy-sm space-y-4 hover:border-brand-300 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 shrink-0">
                      <GitBranch size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-850">{wf.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Last triggered {wf.lastExecutedAt} • {wf.executionsCount} total executions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(wf.id, wf.isActive)}
                      className={`px-3 py-1 text-[10px] font-extrabold rounded-full border cursor-pointer transition-all ${
                        wf.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {wf.isActive ? '⚡ LIVE ACTIVE' : 'INACTIVE'}
                    </button>
                    <button onClick={() => handleDelete(wf.id, wf.name)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Workflow Node Chain Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">1. TRIGGER EVENT</span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Zap size={13} className="text-brand-600" /> {wf.triggerEvent}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">2. RULE CONDITION</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Filter size={13} className="text-purple-600" /> {wf.condition}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">3. AUTOMATED ACTION</span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600" /> {wf.action}
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>

      {/* Add Workflow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Build Workflow Automation</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Workflow Name *</label>
                <input type="text" required placeholder="e.g. Lead SLA Escalation & Auto-Routing" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Trigger Event</label>
                  <select value={triggerEvent} onChange={(e) => setTriggerEvent(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                    <option value="Lead Created">Lead Created</option>
                    <option value="Deal Stage Updated">Deal Stage Updated</option>
                    <option value="Invoice Overdue">Invoice Overdue</option>
                    <option value="Support Ticket Escalated">Support Ticket Escalated</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Automated Action</label>
                  <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                    <option value="Send Email Sequence">Send Email Sequence</option>
                    <option value="Assign Sales Rep + Task">Assign Sales Rep + Task</option>
                    <option value="Pause Subscription">Pause Subscription</option>
                    <option value="Trigger Slack Webhook">Trigger Slack Webhook</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Condition Rule</label>
                <input type="text" placeholder="e.g. Deal Value >= ₹50,000 OR Priority = High" value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!name.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Save & Activate Rule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Workflows;
