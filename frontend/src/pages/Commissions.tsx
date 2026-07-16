import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { DollarSign, Plus, Search, Trash2, Loader2, CheckCircle, CreditCard, Calculator, LayoutDashboard } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { commissionApi } from '../services/commissionApi';

interface CommissionRule {
  id: string;
  name: string;
  rate: number;
  criteria: string;
  isActive: boolean;
  createdAt: string;
}

interface CommissionPayout {
  id: string;
  salesPerson: string;
  amount: number;
  dealName: string;
  status: 'pending' | 'approved' | 'paid';
  period: string;
  createdAt: string;
}

export const Commissions: React.FC = () => {
  const breadcrumbs = [{ label: 'Commissions' }];
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'rules' | 'payouts'>('rules');
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleRate, setRuleRate] = useState('');
  const [ruleCriteria, setRuleCriteria] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, payoutsRes] = await Promise.all([
        commissionApi.getRules(),
        commissionApi.getPayouts(),
      ]);

      const ruleItems = rulesRes.data.data?.items || [];
      setRules(ruleItems.map((r: any) => ({
        id: r.id,
        name: r.name,
        rate: r.rate,
        criteria: r.criteria || '-',
        isActive: r.isActive,
        createdAt: r.createdAt ? r.createdAt.split('T')[0] : '',
      })));

      const payoutItems = payoutsRes.data.data?.items || [];
      setPayouts(payoutItems.map((p: any) => ({
        id: p.id,
        salesPerson: p.salesPerson || p.salesperson || '-',
        amount: p.amount,
        dealName: p.dealName || '-',
        status: p.status || 'pending',
        period: p.period || '-',
        createdAt: p.createdAt ? p.createdAt.split('T')[0] : '',
      })));
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch commission data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleRate) return;
    try {
      await commissionApi.createRule({ name: ruleName, rate: Number(ruleRate), criteria: ruleCriteria });
      toast.success('Rule Created', `${ruleName} added.`);
      setShowRuleModal(false);
      setRuleName('');
      setRuleRate('');
      setRuleCriteria('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create rule.');
    }
  };

  const handleDeleteRule = async (id: string, name: string) => {
    if (confirm(`Delete commission rule "${name}"?`)) {
      try {
        await commissionApi.deleteRule(id);
        toast.success('Rule Deleted', 'Commission rule removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete rule.');
      }
    }
  };

  const handlePayoutAction = async (id: string, action: 'approve' | 'pay') => {
    try {
      if (action === 'approve') await commissionApi.approvePayout(id);
      else await commissionApi.payPayout(id);
      toast.success('Updated', `Payout ${action}d.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed', `Failed to ${action} payout.`);
    }
  };

  const payoutStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      paid: 'bg-blue-50 text-blue-700 border-blue-100',
    };
    return map[status] || map.pending;
  };

  const tabs = [
    { key: 'rules' as const, label: 'Commission Rules', count: rules.length },
    { key: 'payouts' as const, label: 'Payouts', count: payouts.length },
  ];

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPayouts = payouts.filter(p =>
    p.salesPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dealName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Commissions</h1>
        </div>
        <div className="flex gap-2">
          {activeTab === 'rules' && (
            <Button onClick={() => setShowRuleModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
              <Plus size={14} /><span>New Rule</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100/50 rounded-xl p-1 max-w-xs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-lg transition-all ${
              activeTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading commission data...</p>
          </div>
        ) : activeTab === 'rules' ? (
          <>
            {rules.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search rules..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}
            {rules.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState title="No Commission Rules" description="Define commission structures and rates for your sales team." icon={<Calculator className="w-12 h-12 text-slate-300" />} actionLabel="New Rule" onAction={() => setShowRuleModal(true)} />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Rule Name</th>
                      <th className="px-4 py-2.5">Rate</th>
                      <th className="px-4 py-2.5">Criteria</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filteredRules.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{r.name}</td>
                        <td className="px-4 py-3 font-black text-slate-850">{r.rate}%</td>
                        <td className="px-4 py-3 text-slate-500">{r.criteria}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${r.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {r.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{r.createdAt}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteRule(r.id, r.name)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {payouts.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search payouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}
            {payouts.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState title="No Payouts" description="Track and manage sales commission payouts." icon={<CreditCard className="w-12 h-12 text-slate-300" />} />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Sales Person</th>
                      <th className="px-4 py-2.5">Deal</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Period</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filteredPayouts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{p.salesPerson}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{p.dealName}</td>
                        <td className="px-4 py-3 font-black text-slate-850">${p.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${payoutStatusBadge(p.status)}`}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{p.period}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {p.status === 'pending' && (
                              <button onClick={() => handlePayoutAction(p.id, 'approve')} className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400" title="Approve">
                                <CheckCircle size={13} />
                              </button>
                            )}
                            {p.status === 'approved' && (
                              <button onClick={() => handlePayoutAction(p.id, 'pay')} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400" title="Mark Paid">
                                <CreditCard size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Create Commission Rule</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Define a new commission structure.</p>
            <form onSubmit={handleCreateRule} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rule Name *</label>
                <input type="text" required placeholder="Standard Rate" value={ruleName} onChange={(e) => setRuleName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Rate (%) *</label>
                  <input type="number" required placeholder="10" value={ruleRate} onChange={(e) => setRuleRate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Criteria</label>
                  <input type="text" placeholder="Deal value &gt; $10k" value={ruleCriteria} onChange={(e) => setRuleCriteria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowRuleModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!ruleName.trim() || !ruleRate} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Rule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commissions;
