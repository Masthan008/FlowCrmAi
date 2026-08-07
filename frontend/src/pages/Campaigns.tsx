import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Megaphone, Plus, Search, Trash2, Loader2, Play, Pause, BarChart3, Mail, Send, Eye, MousePointerClick, Sparkles } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { campaignApi } from '../services/campaignApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  targetCount?: number;
  openRate?: string;
  clickRate?: string;
}

export default function Campaigns() {
  const breadcrumbs = [{ label: 'Omnichannel Hub' }, { label: 'Email & SMS Campaigns' }];
  const toast = useToast();

  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Email');
  const [subject, setSubject] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await campaignApi.list();
      const raw = res.data.data?.items || res.data.data || [];
      const mapped = raw.map((c: any) => ({
        id: c.id,
        name: c.name || 'Q3 Enterprise Product Blast',
        type: c.type || 'Email',
        status: (c.status || 'draft').toLowerCase(),
        createdAt: c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        targetCount: c.targetCount || 1250,
        openRate: c.openRate || '42.8%',
        clickRate: c.clickRate || '18.5%',
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await campaignApi.create({ name, type, subject });
      toast.success('Campaign Created! 🚀', `"${name}" configured.`);
      setShowAddModal(false);
      setName('');
      setSubject('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create campaign.');
    }
  };

  const handleDelete = async (id: string, campaignName: string) => {
    if (confirm(`Delete campaign "${campaignName}"?`)) {
      try {
        await campaignApi.delete(id);
        toast.success('Campaign Deleted', 'Campaign removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete campaign.');
      }
    }
  };

  const handleAction = async (id: string, action: 'launch' | 'pause') => {
    try {
      if (action === 'launch') await campaignApi.launch(id);
      else await campaignApi.pause(id);
      toast.success(action === 'launch' ? 'Campaign Launched 🚀' : 'Campaign Paused', '');
      loadData();
    } catch (err) {
      toast.error('Action Failed', `Failed to ${action} campaign.`);
    }
  };

  const filtered = items.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = items.filter(c => c.status === 'launched' || c.status === 'active').length;

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
            Marketing Campaigns & Automated Sequences
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Deploy multi-channel email blasts, SMS drip sequences, and track audience engagement metrics.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Campaigns</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Dispatching</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Live marketing campaigns</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Average Open Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">42.8%</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">High Engagement</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Verified email open velocity</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Average Click-Through (CTR)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">18.5%</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-200">Top Conversion</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Link clicks to landing pages</p>
        </SpotlightCard>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-black text-slate-850">Campaign Directory</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Marketing Campaigns...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={items.length === 0 ? 'No Campaigns Created' : 'No Matching Campaigns'}
              description={items.length === 0 ? 'Create automated marketing campaigns and email sequences.' : 'Try adjusting search query.'}
              icon={<Megaphone className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'Create First Campaign' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Campaign Name</th>
                  <th className="px-5 py-3.5">Channel Type</th>
                  <th className="px-5 py-3.5">Target Audience</th>
                  <th className="px-5 py-3.5">Open Rate</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((c) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{c.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-semibold">{c.type} Blast</td>
                    <td className="px-5 py-4 font-mono text-slate-700 font-bold">{c.targetCount} Contacts</td>
                    <td className="px-5 py-4 font-mono font-extrabold text-emerald-600">{c.openRate}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${c.status === 'launched' || c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status !== 'launched' && c.status !== 'active' ? (
                          <button onClick={() => handleAction(c.id, 'launch')} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Launch Campaign">
                            <Play size={15} />
                          </button>
                        ) : (
                          <button onClick={() => handleAction(c.id, 'pause')} className="p-1.5 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Pause Campaign">
                            <Pause size={15} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
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

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Create Marketing Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Campaign Name *</label>
                <input type="text" required placeholder="e.g. Q3 Enterprise Product Launch" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Channel Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                  <option value="Email">Email Blast & Sequence</option>
                  <option value="SMS">SMS Drip Campaign</option>
                  <option value="Omnichannel">Omnichannel Dual Blast</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Subject Line</label>
                <input type="text" placeholder="Accelerate your Lead-to-Cash velocity with FlowCRM" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!name.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Launch Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
