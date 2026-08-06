import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  FileText, Plus, Search, Trash2, Loader2, CheckCircle, RefreshCw, XCircle,
  TrendingUp, ShieldCheck, DollarSign, Calendar, Clock, AlertTriangle, FileCheck, X
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { contractApi } from '../services/contractApi';

interface ContractItem {
  id: string;
  title: string;
  status: string;
  type?: string;
  value: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Contracts() {
  const breadcrumbs = [{ label: 'Contracts' }];
  const toast = useToast();

  const [items, setItems] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [contractType, setContractType] = useState('Service Agreement');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await contractApi.list();
      const rawItems = res.data.data?.items || res.data.data || [];
      const mapped = rawItems.map((c: any) => ({
        id: c.id,
        title: c.title || c.name || 'Enterprise Agreement',
        status: (c.status || 'Active').toLowerCase(),
        type: c.type || 'Service',
        value: c.value || 0,
        startDate: c.startDate ? c.startDate.split('T')[0] : '',
        endDate: c.endDate ? c.endDate.split('T')[0] : 'Auto-renew',
        createdAt: c.createdAt ? c.createdAt.split('T')[0] : '',
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await contractApi.create({ title, type: contractType, value: Number(value) || 0 });
      toast.success('Contract Created', `"${title}" has been created successfully.`);
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

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'active':
        return <Badge variant="custom" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">Active</Badge>;
      case 'draft':
        return <Badge variant="custom" className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5">Draft</Badge>;
      case 'pending': case 'approval':
        return <Badge variant="custom" className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5">Pending</Badge>;
      case 'terminated': case 'cancelled':
        return <Badge variant="custom" className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5">Terminated</Badge>;
      default:
        return <Badge variant="custom" className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5">{s}</Badge>;
    }
  };

  const filtered = items.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.type?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && c.status === activeTab;
  });

  const totalValue = items.reduce((sum, c) => sum + (c.value || 0), 0);
  const activeCount = items.filter(c => c.status === 'active').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
            <FileText className="text-brand-550" size={24} /> Contract Lifecycle Hub
          </h1>
          <p className="text-sm font-medium text-slate-400">Manage legal agreements, client commitments, renewals, and compliance tracking</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" className="shadow-glossy self-start md:self-auto flex items-center gap-1.5">
          <Plus size={14} />
          <span>New Contract</span>
        </Button>
      </motion.div>

      {/* KPI Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <FileCheck size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Contracts</p>
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Portfolio Value</p>
              <p className="text-xl font-black text-slate-800">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiring This Quarter</p>
              <p className="text-xl font-black text-slate-800">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Renewal Success Rate</p>
              <p className="text-xl font-black text-slate-800">96.8%</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Table Card */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-glossy-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Quick Tabs */}
          <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Contracts' },
              { id: 'active', label: 'Active' },
              { id: 'draft', label: 'Draft' },
              { id: 'pending', label: 'Pending' },
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
                placeholder="Search contracts or type..."
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

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing contract records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title={items.length === 0 ? 'No Contracts Registered' : 'No Matching Contracts'}
              description={items.length === 0 ? 'Start contract management by adding your first agreement.' : 'Try adjusting search or status filters.'}
              icon={<FileText className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'New Contract' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="px-4 py-3">Contract Title</th>
                  <th className="px-4 py-3">Agreement Type</th>
                  <th className="px-4 py-3">Contract Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Effective Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-25/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{c.title}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{c.type}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">${(c.value || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{c.startDate || c.createdAt || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                          title="Approve Contract"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleRenew(c.id)}
                          className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-colors"
                          title="Renew Contract"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() => handleTerminate(c.id, c.title)}
                          className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-400 transition-colors"
                          title="Terminate Contract"
                        >
                          <XCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                          title="Delete Contract"
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

      {/* Add Contract Modal */}
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
                  <FileText size={16} className="text-brand-550" /> New Contract
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Contract Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Service Agreement 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Contract Value ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Type</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                    >
                      <option value="Service Agreement">Service Agreement</option>
                      <option value="NDA">NDA</option>
                      <option value="SLA">SLA</option>
                      <option value="Licensing">Licensing</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!title.trim()} variant="primary" size="sm">
                    Create Contract
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
