import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FileText, Plus, Search, Trash2, Loader2, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { contractApi } from '../services/contractApi';

interface ContractItem {
  id: string;
  title: string;
  status: string;
  value: number;
  createdAt: string;
}

export default function Contracts() {
  const breadcrumbs = [{ label: 'Contracts' }];
  const toast = useToast();

  const [items, setItems] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await contractApi.list();
      setItems(res.data.data?.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await contractApi.create({ title, value: Number(value) || 0 });
      toast.success('Contract Created', `"${title}" has been created.`);
      setShowAddModal(false);
      setTitle('');
      setValue('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create contract.');
    }
  };

  const handleDelete = async (id: string, contractTitle: string) => {
    if (confirm(`Delete contract "${contractTitle}"?`)) {
      try {
        await contractApi.delete(id);
        toast.success('Contract Deleted', 'Contract has been removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete contract.');
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await contractApi.approve(id);
      toast.success('Contract Approved', '');
      loadData();
    } catch (err) {
      toast.error('Approve Failed', 'Failed to approve contract.');
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await contractApi.renew(id);
      toast.success('Contract Renewed', '');
      loadData();
    } catch (err) {
      toast.error('Renew Failed', 'Failed to renew contract.');
    }
  };

  const handleTerminate = async (id: string, contractTitle: string) => {
    if (confirm(`Terminate contract "${contractTitle}"?`)) {
      try {
        await contractApi.terminate(id);
        toast.success('Contract Terminated', '');
        loadData();
      } catch (err) {
        toast.error('Terminate Failed', 'Failed to terminate contract.');
      }
    }
  };

  const getStatusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'draft': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'active': case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'expired': case 'terminated': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filtered = items.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Contracts</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
          <Plus size={14} />
          <span>New Contract</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading contracts...</p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search contracts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={items.length === 0 ? 'No Contracts' : 'No Matches Found'}
                  description={items.length === 0 ? 'Create your first contract.' : 'Adjust search parameters.'}
                  icon={<FileText className="w-12 h-12 text-slate-300" />}
                  actionLabel={items.length === 0 ? 'New Contract' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Value</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{c.title}</td>
                        <td className="px-4 py-3 font-black text-slate-850 dark:text-slate-100">${c.value?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStatusColor(c.status)}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{c.createdAt?.split('T')[0]}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {c.status === 'draft' && (
                              <button onClick={() => handleApprove(c.id)} className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400" title="Approve"><CheckCircle size={13} /></button>
                            )}
                            {c.status === 'active' && (
                              <button onClick={() => handleRenew(c.id)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400" title="Renew"><RefreshCw size={13} /></button>
                            )}
                            {c.status !== 'terminated' && c.status !== 'expired' && (
                              <button onClick={() => handleTerminate(c.id, c.title)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Terminate"><XCircle size={13} /></button>
                            )}
                            <button onClick={() => handleDelete(c.id, c.title)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Delete"><Trash2 size={13} /></button>
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Contract</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Create a new contract record.</p>
            <form onSubmit={handleCreate} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Title *</label>
                <input type="text" required placeholder="e.g. Annual Support Agreement" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Value ($)</label>
                <input type="number" placeholder="10000" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!title.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Contract</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
