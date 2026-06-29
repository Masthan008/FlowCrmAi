import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDealStore } from '../../store/dealStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  Layers, Kanban, Calendar, TrendingUp, BarChart3, Target, UserCheck, ShieldAlert, Clock,
  Plus, Edit2, Trash2, Eye, Copy, Settings, Filter, FileText, CheckCircle2, AlertTriangle,
  Building2, User, ChevronRight, Sparkles, FolderHeart, CalendarDays, RefreshCw, Bookmark,
  DollarSign, Activity, Users, FileBarChart, Search
} from 'lucide-react';

const statusColors: Record<string, string> = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  Qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Proposal Sent': 'bg-amber-50 text-amber-700 border-amber-200',
  Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
  Won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Lost: 'bg-red-50 text-red-700 border-red-200',
  Cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
  'On Hold': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
};

const breadcrumbs = [
  { label: 'Workspace', href: '/' },
  { label: 'Deals', href: '/deals' },
  { label: 'Sales Pipeline', active: true },
];

export const SalesPipeline: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    kanbanData, pipelineList, forecast, analytics, kpis, funnel, aging, quotas, performance,
    savedViews, pipelineHealth, loading, error, activePipelineId,
    fetchPipelinesList, createPipeline, updatePipeline, deletePipeline, duplicatePipeline,
    fetchKanbanData, moveStage, fetchForecast, fetchAnalytics, fetchKpis, fetchFunnel,
    fetchAging, fetchPipelineHealth, fetchQuotas, createQuota, deleteQuota, fetchPerformance,
    fetchSavedViews, createSavedView, deleteSavedView, setActivePipelineId, employees
  } = useDealStore();

  const [activeTab, setActiveTab] = useState<'kanban' | 'forecast' | 'analytics' | 'kpis' | 'funnel' | 'health' | 'leaderboard' | 'quotas'>('kanban');
  const [showCreatePipeline, setShowCreatePipeline] = useState(false);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineType, setPipelineType] = useState('Sales');
  const [pipelineDesc, setPipelineDesc] = useState('');
  const [pipelineColor, setPipelineColor] = useState('#6366f1');
  const [pipelineStagesInput, setPipelineStagesInput] = useState<string>(
    'New,Qualification,Needs Analysis,Proposal,Negotiation,Contract Review,Verbal Commit,Won,Lost,Support'
  );

  // Quota state
  const [showCreateQuota, setShowCreateQuota] = useState(false);
  const [quotaEmployeeId, setQuotaEmployeeId] = useState('');
  const [quotaType, setQuotaType] = useState('individual');
  const [quotaPeriod, setQuotaPeriod] = useState('monthly');
  const [quotaPeriodLabel, setQuotaPeriodLabel] = useState('2026-06');
  const [quotaTarget, setQuotaTarget] = useState<number>(50000);

  // Custom Saved Views
  const [showCreateView, setShowCreateView] = useState(false);
  const [viewName, setViewName] = useState('');
  const [viewFilters, setViewFilters] = useState<any>({});

  // Kanban search & filters
  const [kanbanSearch, setKanbanSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [valueMinFilter, setValueMinFilter] = useState('');
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPipelinesList();
    fetchSavedViews();
  }, []);

  // Fetch pipeline-specific metrics when active tab or active pipeline changes
  useEffect(() => {
    if (activePipelineId) {
      const filters = { search: kanbanSearch, assignedToId: ownerFilter, valueMin: valueMinFilter ? parseFloat(valueMinFilter) : undefined };
      if (activeTab === 'kanban') fetchKanbanData(activePipelineId, filters);
      else if (activeTab === 'forecast') fetchForecast(activePipelineId);
      else if (activeTab === 'analytics') fetchAnalytics(activePipelineId);
      else if (activeTab === 'kpis') fetchKpis(activePipelineId);
      else if (activeTab === 'funnel') fetchFunnel(activePipelineId);
      else if (activeTab === 'health') fetchPipelineHealth(activePipelineId);
      else if (activeTab === 'leaderboard') fetchPerformance(activePipelineId);
      else if (activeTab === 'quotas') fetchQuotas();
    }
  }, [activePipelineId, activeTab, kanbanSearch, ownerFilter, valueMinFilter]);

  const activePipeline = useMemo(() => {
    return pipelineList.find((p: any) => p.id === activePipelineId);
  }, [pipelineList, activePipelineId]);

  // Kanban Stage Map
  const stageDeals = useMemo(() => {
    if (!activePipeline) return {};
    const stages = activePipeline.stages || [];
    const map: Record<string, any[]> = {};
    stages.forEach((s: any) => {
      map[s.id] = [];
    });
    kanbanData.forEach((deal: any) => {
      if (map[deal.stageId]) {
        map[deal.stageId].push(deal);
      }
    });
    return map;
  }, [activePipeline, kanbanData]);

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, toStageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;
    try {
      await moveStage(dealId, toStageId);
      toast.success('Stage Updated', 'Deal stage updated successfully');
      // Refresh kanban state
      const filters = { search: kanbanSearch, assignedToId: ownerFilter, valueMin: valueMinFilter ? parseFloat(valueMinFilter) : undefined };
      fetchKanbanData(activePipelineId || undefined, filters);
    } catch (err: any) {
      toast.error('Failed to Move Deal', err.message || 'Verification condition not met.');
    }
  };

  // Pipeline creation
  const handleCreatePipelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineName.trim()) return;
    const parsedStages = pipelineStagesInput.split(',').map((name, index) => {
      const trimmed = name.trim();
      let probability = 10;
      if (trimmed.toLowerCase().includes('won')) probability = 100;
      else if (trimmed.toLowerCase().includes('lost')) probability = 0;
      else if (trimmed.toLowerCase().includes('proposal')) probability = 60;
      else if (trimmed.toLowerCase().includes('negotiation')) probability = 80;
      else probability = Math.min(90, Math.max(10, (index + 1) * 10));

      return {
        name: trimmed,
        order: index,
        probability,
        color: index % 2 === 0 ? '#4f46e5' : '#0ea5e9'
      };
    });

    try {
      await createPipeline({
        name: pipelineName,
        description: pipelineDesc,
        type: pipelineType,
        color: pipelineColor,
        stages: parsedStages
      });
      setShowCreatePipeline(false);
      setPipelineName('');
      setPipelineDesc('');
      toast.success('Pipeline Created', 'New pipeline generated successfully');
    } catch {
      toast.error('Error', 'Failed to create pipeline');
    }
  };

  // Duplicate pipeline action
  const handleDuplicatePipeline = async () => {
    if (!activePipelineId) return;
    try {
      await duplicatePipeline(activePipelineId);
      toast.success('Duplicated', 'Pipeline configuration cloned');
    } catch {
      toast.error('Error', 'Cloning failed');
    }
  };

  // Archive pipeline action
  const handleArchivePipeline = async () => {
    if (!activePipelineId) return;
    if (confirm('Are you sure you want to delete this pipeline? All deals associated with it will be unlinked.')) {
      try {
        await deletePipeline(activePipelineId);
        toast.success('Deleted', 'Pipeline configuration removed');
      } catch {
        toast.error('Error', 'Archiving failed');
      }
    }
  };

  // Quota Creation
  const handleQuotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuota({
        employeeId: quotaEmployeeId || null,
        type: quotaType,
        period: quotaPeriod,
        periodLabel: quotaPeriodLabel,
        target: quotaTarget,
        achieved: 0,
        remaining: quotaTarget,
        progress: 0
      });
      setShowCreateQuota(false);
      fetchQuotas();
      toast.success('Quota Created', 'Sales targets set successfully');
    } catch {
      toast.error('Error', 'Failed to create quota');
    }
  };

  // Custom Saved Views
  const handleSaveViewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) return;
    try {
      await createSavedView({
        name: viewName,
        pipelineId: activePipelineId,
        filters: { ownerFilter, valueMinFilter }
      });
      setShowCreateView(false);
      setViewName('');
      fetchSavedViews();
      toast.success('View Saved', 'Quick access view added successfully');
    } catch {
      toast.error('Error', 'Failed to save pipeline view');
    }
  };

  const applySavedView = (view: any) => {
    if (view.pipelineId) setActivePipelineId(view.pipelineId);
    if (view.filters?.ownerFilter) setOwnerFilter(view.filters.ownerFilter);
    if (view.filters?.valueMinFilter) setValueMinFilter(view.filters.valueMinFilter);
    toast.info('Filter Applied', `Switched to saved view: "${view.name}"`);
  };

  const toggleColumnCollapse = (stageId: string) => {
    setCollapsedColumns(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1 flex items-center gap-2">
            <Layers className="text-brand-550" size={24} /> Sales Pipeline Hub
          </h1>
          <p className="text-sm font-semibold text-slate-400">Enterprise board, forecasts, quotas, and intelligence analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Pipeline Selector */}
          <div className="flex items-center gap-2 bg-white/70 border border-slate-200/80 rounded-xl px-3.5 py-1.5 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400">Pipeline:</span>
            <select
              value={activePipelineId || ''}
              onChange={(e) => setActivePipelineId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
            >
              {pipelineList.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <Button onClick={() => setShowCreatePipeline(true)} variant="primary" size="sm">
            <Plus size={14} className="mr-1.5" /> Create Pipeline
          </Button>

          {activePipelineId && (
            <div className="flex gap-1.5">
              <Button onClick={handleDuplicatePipeline} variant="outline" size="sm" title="Clone Pipeline">
                <Copy size={13} />
              </Button>
              <Button onClick={handleArchivePipeline} variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" title="Delete Pipeline">
                <Trash2 size={13} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* SAVED CUSTOM VIEWS QUICK-BAR */}
      {savedViews.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <Bookmark size={12} className="text-slate-400 flex-shrink-0" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Saved Views:</span>
          {savedViews.map((view: any) => (
            <button
              key={view.id}
              onClick={() => applySavedView(view)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-brand-300 rounded-lg text-[10px] font-bold text-slate-600 transition-colors shadow-sm whitespace-nowrap"
            >
              {view.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete saved view?')) {
                    deleteSavedView(view.id);
                    toast.success('Removed', 'Saved view deleted');
                  }
                }}
                className="text-slate-300 hover:text-red-500 font-normal ml-0.5"
              >
                ×
              </button>
            </button>
          ))}
        </div>
      )}

      {/* CORE NAVIGATION TABS */}
      <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
        {[
          { id: 'kanban', label: 'Kanban Pipeline', icon: Kanban },
          { id: 'forecast', label: 'Revenue Forecasting', icon: Calendar },
          { id: 'analytics', label: 'Sales Analytics', icon: BarChart3 },
          { id: 'kpis', label: 'Sales KPIs', icon: TrendingUp },
          { id: 'funnel', label: 'Funnel Analytics', icon: Layers },
          { id: 'health', label: 'Pipeline Health', icon: ShieldAlert },
          { id: 'leaderboard', label: 'Team Leaderboard', icon: UserCheck },
          { id: 'quotas', label: 'Quotas', icon: Target },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-550 text-white shadow-glossy-sm'
                  : 'text-slate-400 hover:text-slate-700 bg-transparent'
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT VIEWS */}
      <div className="min-h-[500px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="animate-spin text-brand-550" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase">Synchronizing with Enterprise pipeline...</p>
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            {/* 1. KANBAN BOARD */}
            {activeTab === 'kanban' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white/70 border border-slate-150 p-3.5 rounded-2xl shadow-sm">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search deals, contacts, tags..."
                      value={kanbanSearch}
                      onChange={(e) => setKanbanSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-100/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={ownerFilter}
                      onChange={(e) => setOwnerFilter(e.target.value)}
                      className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                    >
                      <option value="">All Owners</option>
                      {employees.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Min Value ($)"
                      value={valueMinFilter}
                      onChange={(e) => setValueMinFilter(e.target.value)}
                      className="border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold bg-white w-28"
                    />

                    <Button onClick={() => setShowCreateView(true)} variant="secondary" size="sm">
                      <Bookmark size={13} className="mr-1.5" /> Save View
                    </Button>
                  </div>
                </div>

                {/* Main Kanban scrolling container */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin select-none">
                  {activePipeline?.stages?.map((stage: any) => {
                    const deals = stageDeals[stage.id] || [];
                    const isCollapsed = collapsedColumns[stage.id];
                    const stageValueSum = deals.reduce((sum, d) => sum + (d.value || 0), 0);

                    if (isCollapsed) {
                      return (
                        <div
                          key={stage.id}
                          className="flex-shrink-0 w-12 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => toggleColumnCollapse(stage.id)}
                        >
                          <span className="text-[10px] font-black text-slate-400 rotate-90 whitespace-nowrap mt-4 mb-auto">
                            {stage.name}
                          </span>
                          <Badge variant="custom" className="bg-slate-200 text-slate-700 text-[10px] mt-auto font-black">
                            {deals.length}
                          </Badge>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={stage.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                        className="flex-shrink-0 w-72 bg-slate-25/55 border border-slate-150/70 p-3.5 rounded-2xl flex flex-col space-y-3 min-h-[500px]"
                      >
                        {/* Stage Column Header */}
                        <div className="flex items-center justify-between pb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color || '#94a3b8' }} />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[130px]" title={stage.name}>
                              {stage.name}
                            </span>
                            <Badge variant="custom" className="bg-slate-100 text-slate-500 font-bold text-[9px] px-1.5 py-0.5">
                              {deals.length}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-black text-slate-400 tracking-tight">
                              ${stageValueSum.toLocaleString()}
                            </span>
                            <button
                              onClick={() => toggleColumnCollapse(stage.id)}
                              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                              title="Collapse column"
                            >
                              ━
                            </button>
                          </div>
                        </div>

                        {/* Stage Limits Alert */}
                        {stage.stageLimit && deals.length > stage.stageLimit && (
                          <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-100 rounded-lg text-[9px] font-bold text-amber-700">
                            <AlertTriangle size={11} className="flex-shrink-0" />
                            Column limit exceeded ({stage.stageLimit} max)
                          </div>
                        )}

                        {/* Deal Cards Container */}
                        <div className="flex-grow space-y-2.5 overflow-y-auto max-h-[600px] scrollbar-none">
                          {deals.length === 0 ? (
                            <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-medium">
                              Drop opportunity here
                            </div>
                          ) : (
                            deals.map((deal: any) => (
                              <div
                                key={deal.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, deal.id)}
                                className="group relative bg-white border border-slate-150 rounded-xl p-3 hover:shadow-glossy-sm hover:border-brand-350 cursor-grab active:cursor-grabbing transition-all space-y-2"
                              >
                                {/* Deal name and Owner */}
                                <div className="flex items-start justify-between gap-1">
                                  <span
                                    onClick={() => navigate(`/deals/${deal.id}`)}
                                    className="text-xs font-bold text-slate-800 hover:text-brand-550 transition-colors cursor-pointer line-clamp-2"
                                  >
                                    {deal.name}
                                  </span>
                                  {deal.assignedTo && (
                                    <div
                                      className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[9px] font-black flex-shrink-0"
                                      title={`Owner: ${deal.assignedTo.firstName} ${deal.assignedTo.lastName}`}
                                    >
                                      {deal.assignedTo.firstName[0]}
                                    </div>
                                  )}
                                </div>

                                {/* Company and Primary Contact */}
                                <div className="space-y-0.5 text-[9px] font-semibold text-slate-400">
                                  {deal.company && (
                                    <div className="flex items-center gap-1">
                                      <Building2 size={10} className="text-slate-350" />
                                      <span className="truncate">{deal.company.name}</span>
                                    </div>
                                  )}
                                  {deal.primaryContact && (
                                    <div className="flex items-center gap-1">
                                      <User size={10} className="text-slate-350" />
                                      <span className="truncate">{deal.primaryContact.firstName} {deal.primaryContact.lastName}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Indicators and stats */}
                                <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-[9px] font-bold">
                                  <span className="text-slate-800">
                                    ${(deal.value || 0).toLocaleString()}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    {deal.probability && (
                                      <span className="text-slate-400 font-semibold" title="Probability">
                                        {deal.probability}%
                                      </span>
                                    )}
                                    <Badge variant="custom" className={`${priorityColors[deal.priority] || 'bg-slate-100 text-slate-600'} text-[8px] px-1 py-0`}>
                                      {deal.priority}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Indicators for Activities, Notes, Quotes */}
                                <div className="flex gap-1.5 border-t border-slate-50 pt-1.5 text-[8px] text-slate-400 font-bold">
                                  {deal.dealActivities?.length > 0 && (
                                    <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-150/50" title="Recent activity completed">
                                      <Activity size={8} /> Act
                                    </span>
                                  )}
                                  {deal.meetings?.length > 0 && (
                                    <span className="flex items-center gap-0.5 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-150/50" title="Scheduled meeting pending">
                                      <CalendarDays size={8} /> Meet
                                    </span>
                                  )}
                                  {deal.dealQuotes?.length > 0 && (
                                    <span className="flex items-center gap-0.5 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-150/50" title="Formal quote sent">
                                      <FileText size={8} /> Quote
                                    </span>
                                  )}
                                </div>

                                {/* Quick action overlay on hover */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => navigate(`/deals/${deal.id}`)}
                                    className="p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm text-slate-500 hover:text-brand-550"
                                    title="Open 360 Workspace"
                                  >
                                    <Eye size={10} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. REVENUE FORECASTING */}
            {activeTab === 'forecast' && forecast && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <Card className="p-4.5 bg-gradient-to-br from-indigo-50/30 to-indigo-100/10 border-indigo-100/80">
                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Weighted Revenue</p>
                    <h3 className="text-xl font-black text-slate-800 mt-1">${Math.round(forecast.weightedRevenue || 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Value × Probability</p>
                  </Card>
                  <Card className="p-4.5 bg-gradient-to-br from-blue-50/30 to-blue-100/10 border-blue-100/80">
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Expected Revenue</p>
                    <h3 className="text-xl font-black text-slate-800 mt-1">${Math.round(forecast.expectedRevenue || 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Sum of expected value</p>
                  </Card>
                  <Card className="p-4.5 bg-gradient-to-br from-emerald-50/30 to-emerald-100/10 border-emerald-100/80">
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Won Revenue</p>
                    <h3 className="text-xl font-black text-slate-800 mt-1">${Math.round(forecast.wonRevenue || 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Actual realized sales</p>
                  </Card>
                  <Card className="p-4.5 bg-gradient-to-br from-slate-50/50 to-slate-100/10 border-slate-200/80">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Pipeline Value</p>
                    <h3 className="text-xl font-black text-slate-800 mt-1">${Math.round(forecast.pipelineValue || 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Total active opportunities</p>
                  </Card>
                  <Card className="p-4.5 bg-gradient-to-br from-purple-50/30 to-purple-100/10 border-purple-100/80 col-span-2 lg:col-span-1">
                    <p className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">Average Deal Size</p>
                    <h3 className="text-xl font-black text-slate-800 mt-1">${Math.round(forecast.avgDealSize || 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Average value per deal</p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Forecast Chart */}
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Monthly Revenue Forecast</h4>
                      <Badge variant="info">Next 6 Months</Badge>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={forecast.monthlyForecast || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                          <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                          <Bar name="Expected Revenue" dataKey="expected" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar name="Weighted Revenue" dataKey="weighted" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Quarterly Forecast Chart */}
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Quarterly Revenue Forecast</h4>
                      <Badge variant="info">Annual Outlook</Badge>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={forecast.quarterlyForecast || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                          <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                          <Bar name="Expected" dataKey="expected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                          <Bar name="Won" dataKey="won" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* 3. SALES ANALYTICS */}
            {activeTab === 'analytics' && analytics && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Pipeline Stage Distribution */}
                  <Card className="p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100">Pipeline Distribution by Stage</h4>
                    <div className="h-60 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.pipelineDistribution || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {(analytics.pipelineDistribution || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-center text-[9px] font-bold">
                      {(analytics.pipelineDistribution || []).map((entry: any, index: number) => (
                        <div key={entry.name} className="flex items-center gap-1 text-slate-500">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 6] }} />
                          {entry.name} ({entry.count})
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Monthly Performance Trend */}
                  <Card className="p-5 space-y-4 col-span-1 md:col-span-2">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100">Monthly Performance Trend</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.monthlyPerformance || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                          <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                          <Line name="Deals Created" type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
                          <Line name="Deals Won" type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Owner Performance leaderboard chart */}
                  <Card className="p-5 space-y-4 col-span-1 lg:col-span-3">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100">Owner Pipeline Volume</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.ownerPerformance || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} fontWeight="bold" width={100} />
                          <Tooltip />
                          <Bar name="Pipeline Value ($)" dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* 4. SALES KPIs */}
            {activeTab === 'kpis' && kpis && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[
                  { title: 'Open Deals Count', value: kpis.openDeals, desc: 'Active pipeline opportunities', icon: Kanban, color: 'text-indigo-500 bg-indigo-50' },
                  { title: 'Pipeline Value', value: `$${Math.round(kpis.pipelineValue || 0).toLocaleString()}`, desc: 'Total open opportunity size', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50' },
                  { title: 'Expected Revenue', value: `$${Math.round(kpis.expectedRevenue || 0).toLocaleString()}`, desc: 'Pipeline valuation estimate', icon: TrendingUp, color: 'text-blue-500 bg-blue-50' },
                  { title: 'Weighted Revenue', value: `$${Math.round(kpis.weightedRevenue || 0).toLocaleString()}`, desc: 'Revenue adjusted for probability', icon: Target, color: 'text-purple-500 bg-purple-50' },
                  { title: 'Won Revenue', value: `$${Math.round(kpis.wonRevenue || 0).toLocaleString()}`, desc: 'Total signed contract values', icon: CheckCircle2, color: 'text-teal-500 bg-teal-50' },
                  { title: 'Win Rate', value: `${kpis.winRate}%`, desc: 'Ratio of Won vs Lost deals', icon: BarChart3, color: 'text-amber-500 bg-amber-50' },
                  { title: 'Average Deal Size', value: `$${Math.round(kpis.avgDealSize || 0).toLocaleString()}`, desc: 'Average closed contract value', icon: Users, color: 'text-slate-500 bg-slate-100' },
                  { title: 'Average Sales Cycle', value: `${kpis.avgSalesCycle} Days`, desc: 'Average days to close a deal', icon: Clock, color: 'text-orange-500 bg-orange-50' },
                  { title: 'Average Probability', value: `${kpis.avgProbability}%`, desc: 'Average probability of open deals', icon: Sparkles, color: 'text-pink-500 bg-pink-50' },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <Card key={idx} className="p-5.5 hover:shadow-glossy-sm transition-all flex items-start justify-between">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{kpi.title}</p>
                        <h3 className="text-xl font-black text-slate-800">{kpi.value}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold">{kpi.desc}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${kpi.color}`}>
                        <Icon size={18} />
                      </div>
                    </Card>
                  );
                })}
              </motion.div>
            )}

            {/* 5. FUNNEL ANALYTICS */}
            {activeTab === 'funnel' && funnel && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Funnel Diagram */}
                <Card className="p-6 col-span-1 lg:col-span-2 space-y-6">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100">Funnel Conversion Flow</h4>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart>
                        <Tooltip />
                        <Funnel
                          dataKey="count"
                          data={funnel.stages || []}
                          isAnimationActive
                        >
                          <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Drop-off and stats list */}
                <Card className="p-5 space-y-5">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100">Funnel Drop-off Statistics</h4>
                  <div className="space-y-4">
                    {(funnel.stages || []).map((stage: any, idx: number) => (
                      <div key={stage.name} className="flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700">{stage.name}</span>
                          <span className="font-bold text-slate-800">{stage.count} Deals</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-550 h-full rounded-full" style={{ width: `${stage.conversion}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Conv: {stage.conversion}%</span>
                          {idx > 0 && <span className="text-red-500">Drop-off: {stage.dropOff}%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 6. PIPELINE HEALTH */}
            {activeTab === 'health' && pipelineHealth && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Health Overview Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 text-center space-y-4 flex flex-col justify-center items-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall Pipeline Health</h4>
                    <div className="w-28 h-28 rounded-full border-8 border-brand-50 flex items-center justify-center relative">
                      <div className="text-center">
                        <span className="text-2xl font-black text-slate-800">{pipelineHealth.score}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">/ 100</span>
                      </div>
                    </div>
                    <Badge variant="custom" className={`text-xs px-3 py-1 font-black ${
                      pipelineHealth.score >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      pipelineHealth.score >= 70 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      pipelineHealth.score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {pipelineHealth.label}
                    </Badge>
                  </Card>

                  {/* Red Flags / Warning metrics */}
                  <Card className="p-5.5 md:col-span-2 space-y-4.5">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-1 border-b border-slate-100">At-Risk Opportunities</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
                        <p className="text-[9px] font-bold text-red-500 uppercase">Overdue Deals</p>
                        <h3 className="text-xl font-black text-slate-800">{pipelineHealth.overdueDe}</h3>
                        <p className="text-[9px] text-slate-400 font-semibold">Expected close date past</p>
                      </div>
                      <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                        <p className="text-[9px] font-bold text-amber-500 uppercase">Stalled Deals</p>
                        <h3 className="text-xl font-black text-slate-800">{pipelineHealth.stalledDeals}</h3>
                        <p className="text-[9px] text-slate-400 font-semibold">No activity in last 14 days</p>
                      </div>
                      <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                        <p className="text-[9px] font-bold text-blue-500 uppercase">Average Stage Age</p>
                        <h3 className="text-xl font-black text-slate-800">{pipelineHealth.stageAging} Days</h3>
                        <p className="text-[9px] text-slate-400 font-semibold">Mean duration in current stage</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Stalled opportunity list */}
                <Card className="p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100">Critical At-Risk Pipeline List</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                          <th className="py-2.5">Opportunity</th>
                          <th className="py-2.5">Company</th>
                          <th className="py-2.5">Stage</th>
                          <th className="py-2.5">Days in Stage</th>
                          <th className="py-2.5">Value</th>
                          <th className="py-2.5">Owner</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                        {(pipelineHealth.topAgingDeals || []).map((deal: any) => (
                          <tr key={deal.id} className="hover:bg-slate-25/40">
                            <td className="py-3 font-bold text-slate-800">
                              <span onClick={() => navigate(`/deals/${deal.id}`)} className="hover:text-brand-550 cursor-pointer">
                                {deal.name}
                              </span>
                            </td>
                            <td className="py-3">{deal.company}</td>
                            <td className="py-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold">{deal.stage}</span></td>
                            <td className="py-3 text-red-500 font-bold">{deal.daysInStage} Days</td>
                            <td className="py-3 font-bold text-slate-800">${(deal.value || 0).toLocaleString()}</td>
                            <td className="py-3">{deal.owner}</td>
                            <td className="py-3 text-right">
                              <Button onClick={() => navigate(`/deals/${deal.id}`)} variant="outline" size="xs">
                                Fix Workspace
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 7. TEAM LEADERBOARD */}
            {activeTab === 'leaderboard' && performance && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Ranking grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Top Revenue Leaders */}
                  <Card className="p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-emerald-500" /> Top Revenue Achievement
                    </h4>
                    <div className="space-y-3.5">
                      {(performance.topRevenue || []).map((e: any, idx: number) => (
                        <div key={e.id} className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-500">{idx + 1}</span>
                            <span className="text-slate-800 font-bold">{e.name}</span>
                          </div>
                          <span className="text-slate-800 font-bold">${Math.round(e.wonRevenue).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Top Win Rates */}
                  <Card className="p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      <Target size={14} className="text-blue-500" /> Win Rate Leaders
                    </h4>
                    <div className="space-y-3.5">
                      {(performance.topWinRate || []).map((e: any, idx: number) => (
                        <div key={e.id} className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-500">{idx + 1}</span>
                            <span className="text-slate-800 font-bold">{e.name}</span>
                          </div>
                          <span className="text-brand-600 font-black">{e.winRate}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Top Pipeline Value */}
                  <Card className="p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      <Layers size={14} className="text-purple-500" /> Total Pipeline Managed
                    </h4>
                    <div className="space-y-3.5">
                      {(performance.topPipeline || []).map((e: any, idx: number) => (
                        <div key={e.id} className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-500">{idx + 1}</span>
                            <span className="text-slate-800 font-bold">{e.name}</span>
                          </div>
                          <span className="text-slate-800 font-bold">${Math.round(e.pipelineValue).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* 8. QUOTAS */}
            {activeTab === 'quotas' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Enterprise Quotas & Performance Targets</h4>
                  <Button onClick={() => setShowCreateQuota(true)} variant="primary" size="sm">
                    <Plus size={14} className="mr-1.5" /> Define Quota
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quotas.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
                      <Target size={40} className="mx-auto text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No Sales Quotas Defined</p>
                      <p className="text-xs max-w-sm mx-auto">Set targets for individual sales reps or entire teams to measure conversion goals.</p>
                    </div>
                  ) : (
                    quotas.map((quota: any) => {
                      const achieved = quota.achieved || 0;
                      const progress = quota.target > 0 ? Math.round((achieved / quota.target) * 100) : 0;
                      const remaining = Math.max(0, quota.target - achieved);
                      const repName = quota.employee ? `${quota.employee.firstName} ${quota.employee.lastName}` : 'General / Team';

                      return (
                        <Card key={quota.id} className="p-5.5 space-y-4 hover:shadow-glossy-sm transition-all relative group">
                          <div>
                            <div className="flex justify-between items-start">
                              <Badge variant="info" className="text-[9px] uppercase tracking-wider">{quota.period} - {quota.periodLabel}</Badge>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this sales quota target?')) {
                                    deleteQuota(quota.id);
                                    toast.success('Removed', 'Sales quota target deleted');
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 mt-2">{repName}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{quota.type} Target</p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-500">Target Goal:</span>
                              <span className="text-slate-800">${quota.target.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-550 h-full rounded-full" style={{ width: `${Math.min(100, progress)}%` }} />
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                              <span className="text-brand-650">Achieved: {progress}%</span>
                              <span>Remaining: ${remaining.toLocaleString()}</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* CREATE PIPELINE MODAL */}
      {showCreatePipeline && (
        <Modal onClose={() => setShowCreatePipeline(false)} title="Create Enterprise Sales Pipeline" size="md">
          <form onSubmit={handleCreatePipelineSubmit} className="space-y-4.5 text-xs text-left">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Pipeline Name *</label>
              <input
                type="text"
                required
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50/50"
                placeholder="e.g. Enterprise Sales East, Renewals APAC"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Pipeline Type</label>
                <select
                  value={pipelineType}
                  onChange={(e) => setPipelineType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option>Sales</option>
                  <option>Enterprise Sales</option>
                  <option>Renewals</option>
                  <option>Partner Sales</option>
                  <option>Government</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Brand Theme Color</label>
                <input
                  type="color"
                  value={pipelineColor}
                  onChange={(e) => setPipelineColor(e.target.value)}
                  className="w-full h-8 border rounded-xl bg-white p-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Pipeline Stages (Comma Separated) *</label>
              <textarea
                value={pipelineStagesInput}
                onChange={(e) => setPipelineStagesInput(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 border rounded-xl bg-slate-50/50"
                placeholder="New, Qualification, Needs Analysis, Proposal, Negotiation, Won, Lost"
              />
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Separate custom stages by comma. Probability will be auto-distributed.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description</label>
              <textarea
                value={pipelineDesc}
                onChange={(e) => setPipelineDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50/50"
                placeholder="Pipeline scope, targets and validation notes"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2.5">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreatePipeline(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Create Pipeline</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* CREATE QUOTA MODAL */}
      {showCreateQuota && (
        <Modal onClose={() => setShowCreateQuota(false)} title="Set Quota Target" size="sm">
          <form onSubmit={handleQuotaSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Quota Type</label>
              <select
                value={quotaType}
                onChange={(e) => setQuotaType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              >
                <option value="individual">Individual Sales Rep</option>
                <option value="team">Team Wide</option>
                <option value="department">Department Wide</option>
              </select>
            </div>
            {quotaType === 'individual' && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Sales Owner *</label>
                <select
                  value={quotaEmployeeId}
                  onChange={(e) => setQuotaEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="">Select Employee</option>
                  {employees.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Period</label>
                <select
                  value={quotaPeriod}
                  onChange={(e) => setQuotaPeriod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Period Label *</label>
                <input
                  type="text"
                  required
                  value={quotaPeriodLabel}
                  onChange={(e) => setQuotaPeriodLabel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50/50"
                  placeholder="e.g. 2026-06, 2026-Q2"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Revenue Target Goal ($) *</label>
              <input
                type="number"
                required
                value={quotaTarget}
                onChange={(e) => setQuotaTarget(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50/50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateQuota(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Set Quota</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* SAVE VIEW MODAL */}
      {showCreateView && (
        <Modal onClose={() => setShowCreateView(false)} title="Save Custom Pipeline View" size="sm">
          <form onSubmit={handleSaveViewSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">View Name *</label>
              <input
                type="text"
                required
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50/50"
                placeholder="e.g. My Closing Deals, High Value East"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">This will save your current active filters (Owner, Value threshold) and the current active pipeline selection.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateView(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Save View</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SalesPipeline;
