import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDealStore } from '../store/dealStore';
import { useToast } from '../components/ui/ToastProvider';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Briefcase, Plus, Search, Trash2, Edit2, Eye, DollarSign, TrendingUp,
  ChevronLeft, ChevronRight, Loader2, BarChart3, ArrowUp, ArrowDown,
  Users, Building2, Kanban, RefreshCw, Sparkles, CheckCircle2,
  Target, Zap, CalendarDays, Tag, X, Filter, Star, Clock,
  ArrowUpDown, MoreVertical, Download
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ANIMATION PRESETS
   ═══════════════════════════════════════════════════════════════ */
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 24 } },
};

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const STATUS_THEME: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Open:            { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     glow: 'shadow-sky-100/60' },
  Qualified:       { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  glow: 'shadow-indigo-100/60' },
  'Proposal Sent': { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   glow: 'shadow-amber-100/60' },
  Negotiation:     { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  glow: 'shadow-orange-100/60' },
  Won:             { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: 'shadow-emerald-100/60' },
  Lost:            { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    glow: 'shadow-rose-100/60' },
  Cancelled:       { bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   glow: 'shadow-slate-100/40' },
  'On Hold':       { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  glow: 'shadow-yellow-100/60' },
  Archived:        { bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200',   glow: 'shadow-slate-100/40' },
};
const PRIORITY_THEME: Record<string, { bg: string; text: string; border: string }> = {
  Low:      { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
  Medium:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  High:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Critical: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200' },
};

const KPI_CARDS = [
  { key: 'totalDeals',      label: 'Total Opportunities', icon: Briefcase,  gradient: 'from-violet-500 to-indigo-600',  iconBg: 'bg-violet-100 text-violet-600' },
  { key: 'openDeals',       label: 'Active Pipeline',     icon: Target,     gradient: 'from-sky-500 to-cyan-600',       iconBg: 'bg-sky-100 text-sky-600' },
  { key: 'pipelineValue',   label: 'Pipeline Volume',     icon: DollarSign, gradient: 'from-emerald-500 to-teal-600',   iconBg: 'bg-emerald-100 text-emerald-600', isCurrency: true },
  { key: 'averageDealValue',label: 'Avg Deal Size',       icon: TrendingUp, gradient: 'from-amber-500 to-orange-600',   iconBg: 'bg-amber-100 text-amber-600', isCurrency: true },
];

const QUICK_TABS = [
  { id: 'all',       label: 'All Deals',         icon: Briefcase },
  { id: 'my',        label: 'My Deals',          icon: Users },
  { id: 'open',      label: 'Open',              icon: Target },
  { id: 'won',       label: 'Won',               icon: CheckCircle2 },
  { id: 'lost',      label: 'Lost',              icon: X },
  { id: 'closing',   label: 'Closing Soon',      icon: Clock },
  { id: 'high-value',label: 'High Value',        icon: DollarSign },
];

/* ═══════════════════════════════════════════════════════════════
   HELPER
   ═══════════════════════════════════════════════════════════════ */
const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toLocaleString()}`;

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const Deals: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ─── Store ─────────────────────────────────────────────── */
  const {
    deals, statistics, loading, error, filters, pagination, selectedIds,
    employees, customers, companies, contacts, leads, pipelines,
    fetchDeals, fetchStatistics, fetchEmployees, fetchCustomers,
    fetchCompanies, fetchContacts, fetchLeads, fetchPipelines,
    createDeal, updateDeal, deleteDeal, setFilters, setPage,
    toggleSelection, toggleAllSelection, clearSelection,
    bulkUpdateStatus, clearCurrentDeal,
  } = useDealStore();

  /* ─── Local State ───────────────────────────────────────── */
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeTab, setActiveTab]           = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDeal, setEditingDeal]       = useState<any | null>(null);
  const [viewDeal, setViewDeal]             = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortField, setSortField]           = useState<string>('createdAt');
  const [sortDir, setSortDir]               = useState<'asc' | 'desc'>('desc');
  const [creating, setCreating]             = useState(false);

  /* ─── Form State ────────────────────────────────────────── */
  const emptyForm = {
    name: '', value: 0, probability: 50, status: 'Open', priority: 'Medium',
    description: '', expectedCloseDate: '', currency: 'USD',
    customerId: '', companyId: '', pipelineId: '', stageId: '',
    assignedToId: '', source: '', industry: '', tags: [] as string[],
  };
  const [form, setForm] = useState({ ...emptyForm });
  const [tagInput, setTagInput] = useState('');

  /* ─── Selected Pipeline Stages ──────────────────────────── */
  const selectedPipeline = useMemo(
    () => pipelines.find(p => p.id === form.pipelineId) || pipelines[0] || null,
    [form.pipelineId, pipelines]
  );
  const stageOptions = selectedPipeline?.stages || [];

  /* ─── Bootstrap ─────────────────────────────────────────── */
  useEffect(() => {
    fetchDeals();
    fetchStatistics();
    fetchEmployees();
    fetchCustomers();
    fetchCompanies();
    fetchContacts();
    fetchLeads();
    fetchPipelines();
  }, []);

  /* ─── Auto-open create modal from /deals/new ────────────── */
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true' || window.location.pathname.endsWith('/deals/new');
    if (isNew) {
      openCreateModal();
      if (searchParams.get('new') === 'true') {
        const p = new URLSearchParams(searchParams);
        p.delete('new');
        setSearchParams(p, { replace: true });
      }
    }
  }, [searchParams]);

  /* ─── Handlers ──────────────────────────────────────────── */
  const openCreateModal = () => {
    const defPipeline = pipelines[0];
    const defStage = defPipeline?.stages?.[0];
    setForm({
      ...emptyForm,
      pipelineId: defPipeline?.id || '',
      stageId: defStage?.id || '',
      customerId: customers[0]?.id || '',
    });
    setEditingDeal(null);
    setShowCreateModal(true);
  };

  const openEditModal = (deal: any) => {
    setForm({
      name: deal.name || '',
      value: deal.value || 0,
      probability: deal.probability || 50,
      status: deal.status || 'Open',
      priority: deal.priority || 'Medium',
      description: deal.description || '',
      expectedCloseDate: deal.expectedCloseDate?.split('T')[0] || '',
      currency: deal.currency || 'USD',
      customerId: deal.customerId || '',
      companyId: deal.companyId || '',
      pipelineId: deal.pipelineId || '',
      stageId: deal.stageId || '',
      assignedToId: deal.assignedToId || '',
      source: deal.source || '',
      industry: deal.industry || '',
      tags: deal.tags || [],
    });
    setEditingDeal(deal);
    setShowCreateModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Validation Error', 'Deal name is required.');
      return;
    }
    setCreating(true);
    try {
      // Clean empty strings to prevent UUID validation errors
      const payload: Record<string, any> = { ...form };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '') payload[k] = undefined;
      });
      // Ensure name is always present
      payload.name = form.name.trim();
      // Keep numeric values
      payload.value = Number(form.value) || 0;
      payload.probability = Number(form.probability) || 0;

      if (editingDeal) {
        await updateDeal(editingDeal.id, payload);
        toast.success('Deal Updated', `"${form.name}" has been updated successfully.`);
      } else {
        await createDeal(payload as any);
        toast.success('Deal Created', `"${form.name}" has been added to your pipeline.`);
      }
      setShowCreateModal(false);
      setForm({ ...emptyForm });
      fetchDeals();
      fetchStatistics();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Operation failed.';
      toast.error(editingDeal ? 'Update Failed' : 'Create Failed', msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDeal(id);
      toast.success('Deal Deleted', 'The deal has been removed from your pipeline.');
      setDeleteConfirmId(null);
      fetchDeals();
      fetchStatistics();
    } catch (err: any) {
      toast.error('Delete Failed', err?.response?.data?.message || 'Could not delete deal.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const qf: Record<string, any> = {};
    if (tab === 'my')         qf.myDeals = true;
    else if (tab === 'open')  qf.open = true;
    else if (tab === 'won')   qf.won = true;
    else if (tab === 'lost')  qf.lost = true;
    else if (tab === 'closing') qf.closingThisMonth = true;
    else if (tab === 'high-value') qf.highValue = true;
    setFilters(qf);
  };

  const handleSort = (field: string) => {
    const newDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDir(newDir);
    setFilters({ sortBy: field, sortDir: newDir });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
      setTagInput('');
    }
  };

  /* ─── Derived Data ──────────────────────────────────────── */
  const breadcrumbs = [{ label: 'Deals' }];
  const allSelected = deals.length > 0 && selectedIds.length === deals.length;
  const stats = statistics || { totalDeals: 0, openDeals: 0, wonDeals: 0, lostDeals: 0, pipelineValue: 0, wonRevenue: 0, averageDealValue: 0, averageProbability: 0 };

  /* ─── Badge Renderers ───────────────────────────────────── */
  const StatusBadge = ({ status }: { status: string }) => {
    const t = STATUS_THEME[status] || STATUS_THEME.Open;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${t.bg} ${t.text} ${t.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Won' ? 'bg-emerald-500' : status === 'Lost' ? 'bg-rose-500' : 'bg-current'} animate-pulse`} />
        {status}
      </span>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const t = PRIORITY_THEME[priority] || PRIORITY_THEME.Medium;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${t.bg} ${t.text} ${t.border}`}>
        {priority}
      </span>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-1"
    >
      {/* ─── Breadcrumb ──────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbs} />

      {/* ─── Hero Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-7 shadow-xl"
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-400/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-indigo-300/8 rounded-full blur-xl animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-10 right-20 w-40 h-40 border border-white/5 rounded-full"
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Deal Hub</h1>
                <p className="text-violet-200/80 text-xs font-medium">Enterprise Pipeline & Revenue Intelligence</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-2"
          >
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigate('/deals/pipeline')}
              className="!bg-white/15 !text-white !border-white/25 hover:!bg-white/25 backdrop-blur-sm"
            >
              <Kanban className="w-3.5 h-3.5" /> Pipeline Board
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => { fetchDeals(); fetchStatistics(); }}
              className="!bg-white/15 !text-white !border-white/25 hover:!bg-white/25 backdrop-blur-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-white text-indigo-700 shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-900/40 border border-white/80 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Deal
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── KPI Cards ────────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          const val = (stats as any)[kpi.key] ?? 0;
          return (
            <motion.div key={kpi.key} variants={fadeUp}>
              <div className="relative group bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-glossy hover:shadow-glossy-lg transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <motion.p
                      key={val}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-extrabold text-slate-800"
                    >
                      {kpi.isCurrency ? fmt(val) : val.toLocaleString()}
                    </motion.p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.iconBg} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                {/* Animated bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${kpi.gradient} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─── Quick Filter Tabs ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
      >
        {QUICK_TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border ${
                active
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100/60'
                  : 'bg-white/60 text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ─── Search & Actions Bar ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <form onSubmit={handleSearch} className="flex-1 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deals by name, company, contact..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-glossy-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all placeholder:text-slate-400"
          />
        </form>

        {selectedIds.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
            <Badge variant="custom" className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 text-[11px] font-bold">
              {selectedIds.length} selected
            </Badge>
            <Button variant="secondary" size="sm" onClick={clearSelection}>Clear</Button>
          </motion.div>
        )}
      </motion.div>

      {/* ─── Data Table ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-glossy overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8 text-indigo-500" />
            </motion.div>
            <span className="ml-3 text-sm font-medium text-slate-500">Loading deals...</span>
          </div>
        ) : deals.length === 0 ? (
          <div className="py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">No deals yet</h3>
              <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                Start building your sales pipeline by creating your first deal.
              </p>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/50 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create First Deal
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100/80 grid grid-cols-12 gap-3 items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAllSelection}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200 cursor-pointer"
                />
              </div>
              <button onClick={() => handleSort('name')} className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors">
                Deal Name
                {sortField === 'name' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              </button>
              <div className="col-span-2">Status / Priority</div>
              <button onClick={() => handleSort('value')} className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors">
                Value
                {sortField === 'value' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              </button>
              <div className="col-span-2">Pipeline / Stage</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            <motion.div variants={stagger} initial="hidden" animate="visible">
              {deals.map((deal: any, idx: number) => (
                <motion.div
                  key={deal.id}
                  variants={fadeUp}
                  layout
                  className={`group px-5 py-3.5 grid grid-cols-12 gap-3 items-center border-b border-slate-50 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer ${
                    selectedIds.includes(deal.id) ? 'bg-indigo-50/50' : ''
                  }`}
                  onClick={() => setViewDeal(deal)}
                >
                  {/* Checkbox */}
                  <div className="col-span-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(deal.id)}
                      onChange={() => toggleSelection(deal.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200 cursor-pointer"
                    />
                  </div>

                  {/* Deal Name + Company */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                      {deal.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {deal.company?.name || deal.customer?.name || deal.dealNumber || '—'}
                    </p>
                  </div>

                  {/* Status + Priority */}
                  <div className="col-span-2 flex flex-col gap-1">
                    <StatusBadge status={deal.status || 'Open'} />
                    <PriorityBadge priority={deal.priority || 'Medium'} />
                  </div>

                  {/* Value */}
                  <div className="col-span-2">
                    <p className="text-xs font-extrabold text-slate-800">{fmt(deal.value || 0)}</p>
                    <p className="text-[10px] text-slate-400">{deal.probability || 0}% probability</p>
                  </div>

                  {/* Pipeline / Stage */}
                  <div className="col-span-2 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-700 truncate">{deal.pipeline?.name || '—'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{deal.stage?.name || '—'}</p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setViewDeal(deal)}
                      className="p-1.5 rounded-lg hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEditModal(deal)}
                      className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteConfirmId(deal.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100/60 flex items-center justify-between">
                <p className="text-[10px] font-medium text-slate-400">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(pagination.page - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(pagination.page + 1)}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
         CREATE / EDIT MODAL
         ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => { setShowCreateModal(false); setEditingDeal(null); }}
            title={editingDeal ? '✏️ Edit Deal' : '✨ Create New Deal'}
            size="lg"
          >
            <div className="space-y-5">
              {/* Deal Name — most important field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Deal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Enterprise SaaS Platform — Q3 2026"
                  className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                  autoFocus
                />
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Value */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Deal Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.value}
                    onChange={e => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                  />
                </div>

                {/* Probability */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.probability}
                    onChange={e => setForm({ ...form, probability: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    {['Open', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'On Hold'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Pipeline */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Pipeline</label>
                  <select
                    value={form.pipelineId}
                    onChange={e => {
                      const pipe = pipelines.find(p => p.id === e.target.value);
                      setForm({
                        ...form,
                        pipelineId: e.target.value,
                        stageId: pipe?.stages?.[0]?.id || '',
                      });
                    }}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    <option value="">Auto-assign</option>
                    {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Stage</label>
                  <select
                    value={form.stageId}
                    onChange={e => setForm({ ...form, stageId: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    <option value="">Auto-assign</option>
                    {stageOptions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Customer</label>
                  <select
                    value={form.customerId}
                    onChange={e => setForm({ ...form, customerId: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    <option value="">Auto-assign</option>
                    {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Company</label>
                  <select
                    value={form.companyId}
                    onChange={e => setForm({ ...form, companyId: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    <option value="">None</option>
                    {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Assigned To</label>
                  <select
                    value={form.assignedToId}
                    onChange={e => setForm({ ...form, assignedToId: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </div>

                {/* Expected Close Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Expected Close Date</label>
                  <input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Brief overview of this deal opportunity..."
                  className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Tags</label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {form.tags.map(t => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold"
                    >
                      {t}
                      <button onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })} className="hover:text-rose-500 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                  <Button variant="secondary" size="sm" onClick={addTag}>
                    <Tag className="w-3 h-3" /> Add
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => { setShowCreateModal(false); setEditingDeal(null); }}>
                  Cancel
                </Button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={creating || !form.name.trim()}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {editingDeal ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingDeal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {editingDeal ? 'Save Changes' : 'Create Deal'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
         VIEW DEAL DRAWER
         ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewDeal && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewDeal(null)}
              className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-slate-200/40 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-extrabold text-slate-800">Deal Details</h3>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewDeal(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-1">{viewDeal.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{viewDeal.dealNumber}</p>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Value Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-4 text-white">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Deal Value</p>
                  <p className="text-2xl font-extrabold">{fmt(viewDeal.value || 0)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-[10px] text-white/80 font-medium">
                      <span className="font-bold text-white">{viewDeal.probability || 0}%</span> Win Probability
                    </div>
                    <div className="text-[10px] text-white/80 font-medium">
                      <span className="font-bold text-white">{viewDeal.currency || 'USD'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                {[
                  { label: 'Status',       value: <StatusBadge status={viewDeal.status || 'Open'} /> },
                  { label: 'Priority',      value: <PriorityBadge priority={viewDeal.priority || 'Medium'} /> },
                  { label: 'Pipeline',      value: viewDeal.pipeline?.name || 'Default' },
                  { label: 'Stage',         value: viewDeal.stage?.name || '—' },
                  { label: 'Customer',      value: viewDeal.customer?.name || '—' },
                  { label: 'Company',       value: viewDeal.company?.name || '—' },
                  { label: 'Assigned To',   value: viewDeal.assignedTo ? `${viewDeal.assignedTo.firstName} ${viewDeal.assignedTo.lastName}` : 'Unassigned' },
                  { label: 'Expected Close', value: viewDeal.expectedCloseDate?.split('T')[0] || '—' },
                  { label: 'Source',        value: viewDeal.source || '—' },
                  { label: 'Created',       value: viewDeal.createdAt?.split('T')[0] || '—' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between py-2 border-b border-slate-50"
                  >
                    <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                    <span className="text-[11px] font-semibold text-slate-700">{item.value}</span>
                  </motion.div>
                ))}

                {/* Description */}
                {viewDeal.description && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1">Description</p>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{viewDeal.description}</p>
                  </div>
                )}

                {/* Tags */}
                {viewDeal.tags?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewDeal.tags.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-bold">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                <Button variant="primary" size="sm" className="flex-1" onClick={() => { setViewDeal(null); openEditModal(viewDeal); }}>
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="glass" size="sm" className="flex-1" onClick={() => navigate(`/deals/${viewDeal.id}`)}>
                  <Eye className="w-3.5 h-3.5" /> Full Workspace
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setViewDeal(null); setDeleteConfirmId(viewDeal.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
         DELETE CONFIRMATION MODAL
         ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmId && (
          <Modal isOpen={true} onClose={() => setDeleteConfirmId(null)} title="⚠️ Confirm Deletion" size="sm">
            <p className="text-xs text-slate-600 mb-5 font-medium leading-relaxed">
              Are you sure you want to permanently delete this deal? This action cannot be undone and all associated data will be removed.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirmId)}>
                <Trash2 className="w-3 h-3" /> Delete Deal
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Deals;
