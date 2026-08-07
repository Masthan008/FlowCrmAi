import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { DollarSign, Plus, Search, Trash2, Loader2, CheckCircle, CreditCard, Calculator, LayoutDashboard, Award, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { commissionApi } from '../services/commissionApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

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
  const breadcrumbs = [{ label: 'Sales Management' }, { label: 'Commissions & Incentive Plans' }];
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'rules' | 'payouts'>('rules');
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleRate, setRuleRate] = useState('');
  const [ruleCriteria, setRuleCriteria] = useState('Quarterly Target Exceeded (> 100%)');

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
        rate: r.rate || 10,
        criteria: r.criteria || 'Standard Sales Tier',
        isActive: r.isActive ?? true,
        createdAt: r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      })));

      const payoutItems = payoutsRes.data.data?.items || [];
      setPayouts(payoutItems.map((p: any) => ({
        id: p.id,
        salesPerson: p.salesPerson || p.salesperson || 'Sales Representative',
        amount: p.amount || 0,
        dealName: p.dealName || 'Enterprise Order',
        status: p.status || 'pending',
        period: p.period || 'Q3 2026',
        createdAt: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
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
      toast.success('Commission Rule Created! 🎉', `${ruleName} added.`);
      setShowRuleModal(false);
      setRuleName('');
      setRuleRate('');
      setRuleCriteria('Quarterly Target Exceeded (> 100%)');
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
      toast.success('Payout Status Updated', `Payout ${action}d.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed', `Failed to ${action} payout.`);
    }
  };

  const payoutStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      paid: 'bg-brand-50 text-brand-700 border-brand-200/80',
    };
    return map[status] || map.pending;
  };

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.criteria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayouts = payouts.filter(p =>
    p.salesPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dealName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayoutPool = (payouts || []).reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPayoutPool = (payouts || []).filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

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
            Sales Commission & Incentive Plans
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure tiered commission structures, audit deal performance, and release sales rep payouts.
          </p>
        </div>
        <Button
          onClick={() => setShowRuleModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>New Commission Plan</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Commission Pool</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">₹{totalPayoutPool.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">{payouts.length} Payouts</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Earned across closed sales deals</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Pending Payout Approvals</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">₹{pendingPayoutPool.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">Needs Review</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Awaiting finance approval</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Commission Rules</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{rules.length}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Active Rates</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Tiered incentive structures</p>
        </SpotlightCard>
      </div>

      {/* Main Commissions Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'rules' ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Commission Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'payouts' ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sales Rep Payouts ({payouts.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search rules or payouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Calculating Sales Incentive Ledgers...</p>
          </div>
        ) : activeTab === 'rules' ? (
          filteredRules.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <EmptyState
                title="No Commission Rules Defined"
                description="Set up percentage rules and quota bonus structures for your sales team."
                icon={<Calculator className="w-12 h-12 text-slate-300" />}
                actionLabel="Create Commission Rule"
                onAction={() => setShowRuleModal(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                    <th className="px-5 py-3.5">Plan / Rule Name</th>
                    <th className="px-5 py-3.5">Commission Rate</th>
                    <th className="px-5 py-3.5">Quota Criteria</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                  {filteredRules.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                        <Award className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>{r.name}</span>
                      </td>
                      <td className="px-5 py-4 font-mono font-black text-brand-600 text-sm">{r.rate}% Rate</td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">{r.criteria}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          ACTIVE
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono">{r.createdAt}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleDeleteRule(r.id, r.name)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredPayouts.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <EmptyState
                title="No Payouts Generated"
                description="Commission payouts are automatically calculated upon deal stage won status."
                icon={<DollarSign className="w-12 h-12 text-slate-300" />}
              />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                    <th className="px-5 py-3.5">Sales Representative</th>
                    <th className="px-5 py-3.5">Closed Deal</th>
                    <th className="px-5 py-3.5">Earned Payout</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Quarter Period</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                  {filteredPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-850">{p.salesPerson}</td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">{p.dealName}</td>
                      <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${payoutStatusBadge(p.status)}`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono">{p.period}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === 'pending' && (
                            <button
                              onClick={() => handlePayoutAction(p.id, 'approve')}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {p.status === 'approved' && (
                            <button
                              onClick={() => handlePayoutAction(p.id, 'pay')}
                              className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Release Payout
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Add Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">New Commission Plan</h3>
            <form onSubmit={handleCreateRule} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Plan Name *</label>
                <input type="text" required placeholder="e.g. Senior AE Enterprise Tier" value={ruleName} onChange={(e) => setRuleName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Commission Rate (%) *</label>
                <input type="number" required placeholder="12" value={ruleRate} onChange={(e) => setRuleRate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Quota Criteria</label>
                <input type="text" placeholder="Quarterly Target Exceeded (> 100%)" value={ruleCriteria} onChange={(e) => setRuleCriteria(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowRuleModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!ruleName.trim() || !ruleRate} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Create Plan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Commissions;
