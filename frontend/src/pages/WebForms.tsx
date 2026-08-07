import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FileText, Plus, Search, Trash2, Loader2, ToggleLeft, ToggleRight, Code, Sparkles, CheckCircle2, Copy } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { webformApi } from '../services/webformApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface WebForm {
  id: string;
  name: string;
  fields: number;
  isActive: boolean;
  submissionCount: number;
  createdAt: string;
}

export const WebForms: React.FC = () => {
  const breadcrumbs = [{ label: 'Lead Capture Engine' }, { label: 'Web Forms' }];
  const toast = useToast();

  const [forms, setForms] = useState<WebForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await webformApi.getForms();
      const items = res.data.data?.items || [];
      const mapped = items.map((f: any) => ({
        id: f.id,
        name: f.name,
        fields: f.fields?.length || 5,
        isActive: f.isActive ?? true,
        submissionCount: f.submissionCount || 0,
        createdAt: f.createdAt ? f.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      setForms(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch web forms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await webformApi.createForm({ name });
      toast.success('Web Form Created! 🎉', `${name} is ready to capture leads.`);
      setShowAddModal(false);
      setName('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create form.');
    }
  };

  const handleDelete = async (id: string, formName: string) => {
    if (confirm(`Delete web form "${formName}"?`)) {
      try {
        await webformApi.deleteForm(id);
        toast.success('Form Deleted', 'Web form removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete form.');
      }
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      if (current) {
        await webformApi.deactivateForm(id);
        toast.success('Form Deactivated', 'Form is now offline.');
      } else {
        await webformApi.activateForm(id);
        toast.success('Form Activated', 'Form is now capturing leads.');
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'Failed to toggle form status.');
    }
  };

  const handleEmbedCode = async (id: string, formName: string) => {
    try {
      const code = `<script src="https://flowcrm.ai/widget/form.js" data-form-id="${id}"></script>`;
      navigator.clipboard.writeText(code);
      toast.success('Embed Code Copied! 📋', `Snippet for "${formName}" copied to clipboard.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed', 'Could not copy embed code.');
    }
  };

  const filtered = forms.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = (forms || []).filter(f => f.isActive).length;
  const totalSubmissions = (forms || []).reduce((acc, curr) => acc + curr.submissionCount, 0);

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
            Autonomous Web-to-Lead Forms
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Embed responsive lead capture forms directly into your landing pages and web apps.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Web Form</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Form Widgets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{forms.length}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Lead Collectors</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Configured web forms</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Live Active Widgets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Capturing Web Leads</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Active on client domains</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Form Submissions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{totalSubmissions}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Auto-Qualified</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Converted into qualified leads</p>
        </SpotlightCard>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-black text-slate-850">Lead Capture Forms</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search web forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Loading Web-to-Lead Forms...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={forms.length === 0 ? 'No Web Forms Configured' : 'No Matching Forms'}
              description={forms.length === 0 ? 'Create web-to-lead forms and embed them on your website.' : 'Try adjusting your search query.'}
              icon={<FileText className="w-12 h-12 text-slate-300" />}
              actionLabel={forms.length === 0 ? 'Create First Web Form' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Form Name</th>
                  <th className="px-5 py-3.5">Input Fields</th>
                  <th className="px-5 py-3.5">Submissions</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((f) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{f.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-semibold">{f.fields} Form Fields</td>
                    <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">{f.submissionCount} Leads</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(f.id, f.isActive)}
                        className="flex items-center gap-1.5 cursor-pointer text-slate-700"
                      >
                        {f.isActive ? (
                          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                            <ToggleRight size={14} /> LIVE ACTIVE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 rounded-full flex items-center gap-1">
                            <ToggleLeft size={14} /> INACTIVE
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{f.createdAt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEmbedCode(f.id, f.name)}
                          className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy Embed Code"
                        >
                          <Code size={13} />
                          <span>Get Code</span>
                        </button>
                        <button onClick={() => handleDelete(f.id, f.name)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
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

      {/* Add Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Create Web-to-Lead Form</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Form Name *</label>
                <input type="text" required placeholder="Contact Us / Enterprise Quote Form" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!name.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Generate Web Form</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WebForms;
