import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Briefcase, Plus, Search, Trash2, Loader2, Users, Milestone, Flag, CheckCircle2, FolderGit2, Layers } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { projectApi } from '../services/projectApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface ProjectItem {
  id: string;
  name: string;
  status: string;
  budget: number;
  createdAt: string;
}

export default function Projects() {
  const breadcrumbs = [{ label: 'Enterprise Workspace' }, { label: 'Project Operations' }];
  const toast = useToast();

  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await projectApi.list();
      const raw = res.data.data?.items || res.data.data || [];
      const mapped = raw.map((p: any) => ({
        id: p.id,
        name: p.name || 'Enterprise Implementation',
        status: (p.status || 'active').toLowerCase(),
        budget: p.budget || 0,
        createdAt: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await projectApi.create({ name, budget: Number(budget) || 0 });
      toast.success('Project Provisioned! 🎉', `"${name}" has been launched.`);
      setShowAddModal(false);
      setName('');
      setBudget('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create project.');
    }
  };

  const handleDelete = async (id: string, projectName: string) => {
    if (confirm(`Delete project "${projectName}"?`)) {
      try {
        await projectApi.delete(id);
        toast.success('Project Deleted', 'Project removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete project.');
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await projectApi.updateStatus(id, status);
      toast.success('Status Updated', `Project is now "${status}".`);
      loadData();
    } catch (err) {
      toast.error('Update Failed', 'Failed to update project status.');
    }
  };

  const getStatusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'planning': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'in_progress': case 'active': return 'bg-brand-550/10 text-brand-700 border-brand-200';
      case 'on_hold': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filtered = items.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const totalBudget = (items || []).reduce((acc, curr) => acc + curr.budget, 0);
  const activeCount = (items || []).filter(p => p.status === 'active' || p.status === 'in_progress').length;
  const completedCount = (items || []).filter(p => p.status === 'completed').length;

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
            Enterprise Client Projects & Milestones
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage customer onboarding projects, milestone deliverables, and budget tracking.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Launch New Project</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Portfolio Budget</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">₹{totalBudget.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">{items.length} Projects</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Contracted client projects</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Implementations</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">In Progress</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Ongoing client delivery</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Completed Milestones</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{completedCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Delivered</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Successfully completed</p>
        </SpotlightCard>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            {['all', 'active', 'planning', 'completed', 'on_hold'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Project Workspace...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={items.length === 0 ? 'No Projects Launched' : 'No Matching Projects'}
              description={items.length === 0 ? 'Launch onboarding projects for newly signed customer accounts.' : 'Try adjusting search or status filter.'}
              icon={<FolderGit2 className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'Launch First Project' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Project Name</th>
                  <th className="px-5 py-3.5">Allocated Budget</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Launch Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{p.name}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">₹{p.budget?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${getStatusColor(p.status)}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{p.createdAt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
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

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Launch Project Workspace</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Project Name *</label>
                <input type="text" required placeholder="Acme Global CRM Onboarding & Integration" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Project Budget (₹)</label>
                <input type="number" placeholder="250000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!name.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Provision Project</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
