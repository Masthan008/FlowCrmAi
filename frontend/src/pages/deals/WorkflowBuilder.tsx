import React, { useEffect, useState } from 'react';
import { useDealStore } from '../../store/dealStore';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  Play,
  CheckCircle,
  AlertCircle,
  FileText,
  Activity,
  UserCheck,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

export const WorkflowBuilder: React.FC = () => {
  const { workflows, fetchWorkflows, createWorkflow, loading } = useDealStore();
  const toast = useToast();

  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('Deal Created');
  const [minRevenue, setMinRevenue] = useState('10000');
  const [actionType, setActionType] = useState('Create Task');
  const [actionVal, setActionVal] = useState('Schedule discovery callback session');

  const [activeTab, setActiveTab] = useState<'workflows' | 'logs'>('workflows');

  useEffect(() => {
    fetchWorkflows('Deal');
  }, []);

  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createWorkflow({
        name,
        module: 'Deal',
        trigger,
        conditions: { revenue: { gte: parseFloat(minRevenue) } },
        actions: [{ type: actionType, title: actionVal, value: actionVal }],
        isActive: true
      });
      setName('');
      setShowBuilderModal(false);
      toast.success('Workflow Created', 'Automated CRM execution rules activated.');
    } catch {
      toast.error('Failed to create workflow');
    }
  };

  const dummyLogs = [
    {
      id: 'log-1',
      name: 'Auto-escalate High-Value Enterprise Deals',
      trigger: 'Deal Created',
      entity: 'Enterprise License Opportunity',
      passed: true,
      time: '12ms',
      date: '2026-06-30 20:30:15',
      result: 'Created task "Schedule Discovery Call" and set tag [High Value]'
    },
    {
      id: 'log-2',
      name: 'Automate Owner Task on Stage Change',
      trigger: 'Stage Changed',
      entity: 'Valli Tech SLA Deal',
      passed: false,
      time: '4ms',
      date: '2026-06-30 19:12:44',
      result: 'Skipped action. Condition "stage equals Proposal" did not match current stage "Discovery".'
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Deals', link: '/deals' }, { label: 'Workflow Engine' }]} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1">CRM Workflow Automation</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Define trigger events, rule filters, and post-action operations</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowBuilderModal(true)}>
          <Plus size={14} className="mr-1.5" /> Create Workflow
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-150 gap-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-2.5 transition-colors ${activeTab === 'workflows' ? 'text-brand-550 border-b-2 border-brand-550' : 'hover:text-slate-700'}`}
        >
          Active Workflows ({workflows.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 transition-colors ${activeTab === 'logs' ? 'text-brand-550 border-b-2 border-brand-550' : 'hover:text-slate-700'}`}
        >
          Automation Run Logs
        </button>
      </div>

      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workflows.map((flow: any) => (
            <Card key={flow.id} className="p-5 space-y-4 shadow-glossy-sm bg-white/70">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">{flow.name}</h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 rounded-md">
                    Trigger: {flow.trigger}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                  Active
                </span>
              </div>

              {/* Conditions Box */}
              <div className="text-[10px] bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1 font-semibold">
                <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Evaluation Rules</span>
                <p className="text-slate-650">
                  Revenue must be greater than or equal to: <strong className="text-slate-800">${flow.conditions?.revenue?.gte || 0}</strong>
                </p>
              </div>

              {/* Actions List */}
              <div className="space-y-2 text-[10px] font-semibold">
                <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Triggered Actions</span>
                {Array.isArray(flow.actions) && flow.actions.map((act: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700 bg-white p-2 border border-slate-100 rounded-lg">
                    <CheckCircle size={10} className="text-brand-500" />
                    <span>{act.type} &bull; "{act.title || act.value}"</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {workflows.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-450 space-y-2">
              <Settings size={36} className="mx-auto text-slate-300 animate-spin" />
              <p className="text-xs font-bold text-slate-700">No Automation Workflows Configured</p>
              <p className="text-[10px] max-w-xs mx-auto">Create rules to automate task generation, tag tracking, owner assignment, or state change.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <Card className="shadow-glossy bg-white/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase text-[9px]">
                  <th className="p-4">Trigger Run</th>
                  <th className="p-4">Workflow Name</th>
                  <th className="p-4">Target Record</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Duration</th>
                  <th className="p-4">Execution Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {dummyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-25/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{log.trigger}</p>
                      <p className="text-[9px] text-slate-400">{log.date}</p>
                    </td>
                    <td className="p-4 text-slate-750 font-bold">{log.name}</td>
                    <td className="p-4">{log.entity}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${log.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-amber-50 text-amber-700 border-amber-250'}`}>
                        {log.passed ? 'Triggered' : 'Skipped'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono">{log.time}</td>
                    <td className="p-4 text-[10px] text-slate-500 max-w-xs">{log.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CREATE WORKFLOW MODAL */}
      <AnimatePresence>
        {showBuilderModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 w-full max-w-md shadow-glossy space-y-4"
            >
              <h4 className="text-sm font-black text-slate-800">Add Automation Workflow</h4>
              <form onSubmit={handleSaveWorkflow} className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Workflow Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Assign Task for High Value Deals"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Trigger Event</label>
                    <select
                      value={trigger}
                      onChange={(e) => setTrigger(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    >
                      <option value="Deal Created">Deal Created</option>
                      <option value="Stage Changed">Stage Changed</option>
                      <option value="Owner Changed">Owner Changed</option>
                      <option value="Revenue Updated">Revenue Updated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Min Revenue Condition ($)</label>
                    <input
                      type="number"
                      value={minRevenue}
                      onChange={(e) => setMinRevenue(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Action Type</label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    >
                      <option value="Create Task">Create Task</option>
                      <option value="Add Tag">Add Tag</option>
                      <option value="Create Notification">Create Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Action Value</label>
                    <input
                      type="text"
                      value={actionVal}
                      onChange={(e) => setActionVal(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" onClick={() => setShowBuilderModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Activate Rule
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
