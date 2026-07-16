import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Megaphone, Plus, Search, Trash2, Loader2, Play, Pause, BarChart3 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { campaignApi } from '../services/campaignApi';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function Campaigns() {
  const breadcrumbs = [{ label: 'Campaigns' }];
  const toast = useToast();

  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Email');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await campaignApi.list();
      const data = res.data.data?.items || [];
      setItems(data.map((c: any) => ({ ...c, createdAt: c.createdAt?.split('T')[0] || '' })));
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
      await campaignApi.create({ name, type });
      toast.success('Campaign Created', `"${name}" has been created.`);
      setShowAddModal(false);
      setName('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create campaign.');
    }
  };

  const handleDelete = async (id: string, campaignName: string) => {
    if (confirm(`Delete campaign "${campaignName}"?`)) {
      try {
        await campaignApi.delete(id);
        toast.success('Campaign Deleted', 'Campaign has been removed.');
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
      toast.success(action === 'launch' ? 'Campaign Launched' : 'Campaign Paused', '');
      loadData();
    } catch (err) {
      toast.error('Action Failed', `Failed to ${action} campaign.`);
    }
  };

  const filtered = items.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Campaigns</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
          <Plus size={14} />
          <span>New Campaign</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading campaigns...</p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={items.length === 0 ? 'No Campaigns' : 'No Matches Found'}
                  description={items.length === 0 ? 'Create your first marketing campaign.' : 'Adjust search parameters.'}
                  icon={<Megaphone className="w-12 h-12 text-slate-300" />}
                  actionLabel={items.length === 0 ? 'New Campaign' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{c.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${c.status === 'active' || c.status === 'launched' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : c.status === 'draft' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{c.createdAt}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {c.status !== 'launched' && c.status !== 'active' && (
                              <button onClick={() => handleAction(c.id, 'launch')} className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400" title="Launch"><Play size={13} /></button>
                            )}
                            {(c.status === 'launched' || c.status === 'active') && (
                              <button onClick={() => handleAction(c.id, 'pause')} className="p-1 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-400" title="Pause"><Pause size={13} /></button>
                            )}
                            <button onClick={() => handleDelete(c.id, c.name)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Delete"><Trash2 size={13} /></button>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Campaign</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Define campaign details.</p>
            <form onSubmit={handleCreate} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Campaign Name *</label>
                <input type="text" required placeholder="e.g. Summer Sale" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Social">Social</option>
                  <option value="Ads">Ads</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!name.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
