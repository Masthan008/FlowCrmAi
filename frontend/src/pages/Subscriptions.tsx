import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Repeat, Plus, Search, Trash2, Loader2, PauseCircle, PlayCircle,
  TrendingUp, ShieldCheck, DollarSign, Calendar, Zap, Sparkles, Check, X, Filter, RefreshCw
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { subscriptionApi } from '../services/subscriptionApi';

interface SubscriptionItem {
  id: string;
  planName?: string;
  status: string;
  renewalDate?: string;
  createdAt?: string;
  amount?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Subscriptions() {
  const breadcrumbs = [{ label: 'Subscriptions' }];
  const toast = useToast();

  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [amountInput, setAmountInput] = useState<number>(149);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.list();
      const rawItems = res.data.data?.items || res.data.data || [];
      const mapped = rawItems.map((s: any) => ({
        id: s.id,
        planName: s.plan?.name || s.planName || 'Enterprise Subscription',
        status: (s.status || 'Active').toLowerCase(),
        renewalDate: s.endDate ? s.endDate.split('T')[0] : (s.nextBillingDate ? s.nextBillingDate.split('T')[0] : 'Auto-renews monthly'),
        createdAt: s.startDate ? s.startDate.split('T')[0] : (s.createdAt ? s.createdAt.split('T')[0] : ''),
        amount: s.plan?.price || 149,
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
      toast.success('Subscription Created', `"${planName}" has been created successfully.`);
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
      toast.success('Subscription Added', `Enrolled in ${tierName} plan.`);
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to process subscription.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete subscription "${name}"?`)) {
      try {
        await subscriptionApi.delete(id);
        toast.success('Subscription Deleted', 'Subscription has been removed.');
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
        return <Badge variant="custom" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">Active</Badge>;
      case 'paused':
        return <Badge variant="custom" className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5">Paused</Badge>;
      case 'canceled': case 'cancelled':
        return <Badge variant="custom" className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5">Cancelled</Badge>;
      case 'trial':
        return <Badge variant="custom" className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5">Trial</Badge>;
      default:
        return <Badge variant="custom" className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5">{s}</Badge>;
    }
  };

  const filtered = items.filter(s => {
    const matchesSearch = s.planName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && s.status === activeTab;
  });

  // Calculate Metrics
  const activeCount = items.filter(i => i.status === 'active').length;
  const totalMRR = items.reduce((acc, i) => acc + (i.status === 'active' ? (i.amount || 149) : 0), 0);
  const totalARR = totalMRR * 12;

  const quickTierOptions = [
    { name: 'Starter Pro', price: 49, desc: 'Essential CRM tools for small teams', features: ['Up to 5 Users', 'Standard Support', 'Core Pipeline'] },
    { name: 'Professional Enterprise', price: 149, desc: 'Advanced automation & multi-pipeline AI', features: ['Unlimited Users', '24/7 Priority Support', 'AI Sales Copilot'] },
    { name: 'Global Unlimited', price: 499, desc: 'Dedicated infra & custom governance', features: ['Custom Workflows', 'Dedicated Success Rep', 'Audit Compliance'] },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
            <Repeat className="text-brand-550" size={24} /> Subscriptions Hub
          </h1>
          <p className="text-sm font-medium text-slate-400">Manage recurring billing, revenue packages, and active client subscriptions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" className="shadow-glossy self-start md:self-auto flex items-center gap-1.5">
          <Plus size={14} />
          <span>New Subscription</span>
        </Button>
      </motion.div>

      {/* Analytics KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</p>
              <p className="text-xl font-black text-slate-800">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring (MRR)</p>
              <p className="text-xl font-black text-slate-800">${totalMRR.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annualized Run Rate (ARR)</p>
              <p className="text-xl font-black text-slate-800">${totalARR.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retention Rate</p>
              <p className="text-xl font-black text-slate-800">98.4%</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Featured Tier Options */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickTierOptions.map((tier) => (
          <Card key={tier.name} className="p-5 bg-white border border-slate-200/80 hover:border-brand-350 hover:shadow-glossy transition-all space-y-3 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-550 transition-colors">{tier.name}</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{tier.desc}</p>
              </div>
              <span className="text-lg font-black text-slate-800">${tier.price}<span className="text-[10px] text-slate-400 font-normal">/mo</span></span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {tier.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Check size={12} className="text-emerald-500 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => handleQuickSubscribe(tier.name, tier.price)} variant="outline" size="sm" className="w-full mt-2 text-xs font-bold border-slate-200 hover:bg-brand-50 hover:text-brand-600">
              Quick Enroll
            </Button>
          </Card>
        ))}
      </motion.div>

      {/* Main Table Card */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-glossy-sm space-y-4">
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Quick Status Tabs */}
          <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Subscriptions' },
              { id: 'active', label: 'Active' },
              { id: 'paused', label: 'Paused' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-brand-550 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search plan or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-medium focus:outline-none focus:bg-white focus:border-brand-550"
              />
            </div>
            <Button onClick={loadData} variant="outline" size="sm" className="p-2 border-slate-200" title="Refresh">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Subscriptions Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing enterprise subscriptions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title={items.length === 0 ? 'No Subscriptions Registered' : 'No Matching Subscriptions'}
              description={items.length === 0 ? 'Start recurring billing by creating your first subscription.' : 'Try resetting search or status filters.'}
              icon={<Repeat className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'New Subscription' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Billing Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next Renewal</th>
                  <th className="px-4 py-3">Enrolled Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-25/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                          <Sparkles size={13} />
                        </div>
                        <span>{s.planName || 'Enterprise Subscription'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">${s.amount || 149}/mo</td>
                    <td className="px-4 py-3">{getStatusBadge(s.status)}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{s.renewalDate}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{s.createdAt || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === 'active' && (
                          <button
                            onClick={() => handlePauseResume(s.id, 'pause')}
                            className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-400 transition-colors"
                            title="Pause Subscription"
                          >
                            <PauseCircle size={14} />
                          </button>
                        )}
                        {s.status === 'paused' && (
                          <button
                            onClick={() => handlePauseResume(s.id, 'resume')}
                            className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                            title="Resume Subscription"
                          >
                            <PlayCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id, s.planName || '')}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                          title="Delete Subscription"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-150 max-w-md w-full p-6 shadow-glossy-lg space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Repeat size={16} className="text-brand-550" /> New Subscription
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Monthly Growth"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Billing Cycle</label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!planName.trim()} variant="primary" size="sm">
                    Create Subscription
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
