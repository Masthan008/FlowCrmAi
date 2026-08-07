import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Repeat, Plus, Search, Trash2, Loader2, PauseCircle, PlayCircle,
  TrendingUp, ShieldCheck, DollarSign, Calendar, Zap, Sparkles, Check, X, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { subscriptionApi } from '../services/subscriptionApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface SubscriptionItem {
  id: string;
  planName?: string;
  status: string;
  renewalDate?: string;
  createdAt?: string;
  amount?: number;
}

export default function Subscriptions() {
  const breadcrumbs = [{ label: 'Billing & Recurring Revenue' }, { label: 'Subscriptions' }];
  const toast = useToast();

  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [amountInput, setAmountInput] = useState<number>(8999);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.list();
      const rawItems = res.data.data?.items || res.data.data || [];
      const mapped = rawItems.map((s: any) => ({
        id: s.id,
        planName: s.plan?.name || s.planName || 'Professional Scale Plan',
        status: (s.status || 'Active').toLowerCase(),
        renewalDate: s.endDate ? s.endDate.split('T')[0] : (s.nextBillingDate ? s.nextBillingDate.split('T')[0] : 'Auto-renews monthly'),
        createdAt: s.startDate ? s.startDate.split('T')[0] : (s.createdAt ? s.createdAt.split('T')[0] : ''),
        amount: s.plan?.price || s.amount || 8999,
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    try {
      await subscriptionApi.create({ planName, amount: amountInput, interval: billingCycle });
      toast.success('Subscription Activated! 🎉', `"${planName}" created.`);
      setShowAddModal(false);
      setPlanName('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create subscription.');
    }
  };

  const handleQuickSubscribe = async (tierName: string, price: number) => {
    try {
      await subscriptionApi.create({ planName: tierName, amount: price, interval: 'Monthly' });
      toast.success('Subscription Enrolled', `Enrolled in ${tierName} plan.`);
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to process subscription.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete subscription "${name}"?`)) {
      try {
        await subscriptionApi.delete(id);
        toast.success('Subscription Deleted', 'Subscription removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete subscription.');
      }
    }
  };

  const handlePauseResume = async (id: string, action: 'pause' | 'resume') => {
    try {
      if (action === 'pause') await subscriptionApi.pause(id);
      else await subscriptionApi.resume(id);
      toast.success(action === 'pause' ? 'Subscription Paused' : 'Subscription Resumed', '');
      loadData();
    } catch (err) {
      toast.error('Action Failed', `Failed to ${action} subscription.`);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'active':
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">ACTIVE</span>;
      case 'paused':
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">PAUSED</span>;
      case 'canceled': case 'cancelled':
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 rounded-full">{s.toUpperCase()}</span>;
    }
  };

  const filtered = items.filter(s => {
    const matchesSearch = s.planName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && s.status === activeTab;
  });

  const activeCount = items.filter(i => i.status === 'active').length;
  const totalMRR = items.reduce((acc, i) => acc + (i.status === 'active' ? (i.amount || 8999) : 0), 0);
  const totalARR = totalMRR * 12;

  const quickTierOptions = [
    { name: 'Starter Growth', price: 3999, desc: 'Essential CRM & Lead-to-Cash tools', features: ['Up to 5 Sales Rep Seats', 'GST Invoicing Engine', 'Standard Pipeline'] },
    { name: 'Professional Scale', price: 8999, desc: 'Grounded AI & custom workflows', features: ['Unlimited User Seats', 'AI Deal Win Probability', 'Priority Support'] },
    { name: 'Enterprise Apex', price: 19999, desc: 'Strict multi-tenant security isolation', features: ['Custom Workflows', 'Dedicated Success Rep', 'Audit Streaming'] },
  ];

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
            Subscriptions & Recurring Revenue Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track monthly recurring revenue (MRR), annualized run rate (ARR), and client subscription tiers.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>New Subscription</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Subscriptions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Active Clients</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Enrolled enterprise plans</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Monthly Revenue (MRR)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">₹{totalMRR.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Recurring</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Monthly subscription ledger</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Annualized Run Rate (ARR)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">₹{totalARR.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Annualized</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">12-month revenue forecast</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Client Retention</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">98.4%</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-200">Low Churn</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">High satisfaction rating</p>
        </SpotlightCard>
      </div>

      {/* Featured Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickTierOptions.map((tier) => (
          <SpotlightCard key={tier.name} className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-glossy-md space-y-4 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-extrabold text-slate-850 group-hover:text-brand-600 transition-colors">{tier.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{tier.desc}</p>
              </div>
              <span className="text-lg font-black text-slate-850 font-mono">₹{tier.price.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal">/mo</span></span>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-150">
              {tier.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => handleQuickSubscribe(tier.name, tier.price)} className="w-full mt-2 text-xs font-bold bg-slate-50 hover:bg-brand-550 hover:text-white text-slate-800 border border-slate-200 cursor-pointer transition-all">
              Enroll Plan
            </Button>
          </SpotlightCard>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            {['all', 'active', 'paused', 'cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plan name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Subscription Ledger...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={items.length === 0 ? 'No Subscriptions Registered' : 'No Matching Subscriptions'}
              description={items.length === 0 ? 'Start recurring billing by provisioning your first client subscription.' : 'Try adjusting search or status filter.'}
              icon={<Repeat className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'Create Subscription' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Subscription Plan</th>
                  <th className="px-5 py-3.5">Recurring Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Next Renewal</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{s.planName}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">₹{s.amount?.toLocaleString('en-IN') || 8999}<span className="text-[10px] text-slate-400 font-normal">/mo</span></td>
                    <td className="px-5 py-4">
                      {getStatusBadge(s.status)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{s.renewalDate}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'active' ? (
                          <button onClick={() => handlePauseResume(s.id, 'pause')} className="p-1.5 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Pause Subscription">
                            <PauseCircle size={15} />
                          </button>
                        ) : (
                          <button onClick={() => handlePauseResume(s.id, 'resume')} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Resume Subscription">
                            <PlayCircle size={15} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(s.id, s.planName || '')} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Provision Subscription</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Plan Name *</label>
                <input type="text" required placeholder="Professional Enterprise Scale" value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Monthly Price (₹) *</label>
                  <input type="number" required placeholder="8999" value={amountInput} onChange={(e) => setAmountInput(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Billing Cycle</label>
                  <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual (20% OFF)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!planName.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Activate Subscription</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
