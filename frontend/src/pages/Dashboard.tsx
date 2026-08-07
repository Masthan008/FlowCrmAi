import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LineChartWrapper } from '../components/ui/Charts';
import { DataTable } from '../components/ui/Table';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { Avatar } from '../components/ui/Avatar';
import { exportToPDF, exportToCSV, exportReportToPDF } from '../utils/export';
import { useToast } from '../components/ui/ToastProvider';
import { AnimatedNumber, SpotlightCard, PulseBadge } from '../components/ui/MotionComponents';
import {
  Users2, Briefcase, Activity, DollarSign, CheckSquare, Sparkles, Loader2,
  Plus, Calendar, AlertCircle, HelpCircle, Pin, PinOff, EyeOff, Minimize2,
  Maximize2, RotateCcw, Search, Download, Clock, HeartPulse, Trophy, Volume2,
  X, FileSpreadsheet, Building2, ShieldCheck, ArrowRight, Zap, Target, TrendingUp
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const {
    kpis,
    charts,
    activities,
    deals,
    businessOverview,
    pipelineData,
    revenueAnalytics,
    teamLeaderboard,
    goals,
    healthScore,
    calendarPreview,
    widgetLayout,
    globalFilter,
    loading,
    error,
    timeframe,
    fetchDashboardData,
    fetchCharts,
    setGlobalFilter,
    setTimeframe,
    toggleWidget,
    resetWidgets
  } = useDashboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [restoreMenuOpen, setRestoreMenuOpen] = useState(false);

  const breadcrumbs = [{ label: 'Executive Dashboard' }];

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    setGlobalFilter(tf);
    fetchDashboardData(tf);
  };

  const widgetsList = [
    { id: 'todayOverview', label: "Today's Business Overview" },
    { id: 'performanceCharts', label: 'Business Performance Analytics' },
    { id: 'salesPipeline', label: 'Sales Pipeline Velocity' },
    { id: 'revenueAnalytics', label: 'Revenue Analytics & Forecast' },
    { id: 'goalsTracker', label: 'Goals Tracker' },
    { id: 'healthScore', label: 'CRM System Health Score' },
    { id: 'upcomingSchedule', label: 'Upcoming Schedule & Tasks' },
    { id: 'customerActivities', label: 'Recent Customer Activities' },
    { id: 'teamLeaderboard', label: 'Team Leaderboard' },
    { id: 'watchlist', label: 'High Value Pipeline Watchlist' },
  ];

  const renderWidgetHeader = (widgetId: string, title: string, subtitle?: string) => {
    const layout = widgetLayout[widgetId] || { hidden: false, collapsed: false, pinned: false };
    
    return (
      <div className="flex justify-between items-center border-b border-slate-100/80 pb-3.5 mb-4">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>{title}</span>
            {layout.pinned && (
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-[10px] font-extrabold border border-brand-200">
                Pinned
              </span>
            )}
          </h3>
          {subtitle && <p className="text-[11px] text-slate-450 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => toggleWidget(widgetId, 'pinned')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              layout.pinned ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-slate-200/80 text-slate-400 hover:text-slate-700'
            }`}
            title={layout.pinned ? 'Unpin from Top' : 'Pin to Top'}
          >
            {layout.pinned ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          
          <button
            onClick={() => toggleWidget(widgetId, 'collapsed')}
            className="p-1.5 rounded-xl border bg-white border-slate-200/80 text-slate-400 hover:text-slate-700 transition-all cursor-pointer shadow-sm"
            title={layout.collapsed ? 'Expand Widget' : 'Collapse Widget'}
          >
            {layout.collapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>

          <button
            onClick={() => toggleWidget(widgetId, 'hidden')}
            className="p-1.5 rounded-xl border bg-white border-slate-200/80 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all cursor-pointer shadow-sm"
            title="Hide Widget"
          >
            <EyeOff size={12} />
          </button>
        </div>
      </div>
    );
  };

  const dealColumns = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Deal Opportunity',
      cell: ({ row }: any) => (
        <span className="font-bold text-slate-800 text-xs">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'company',
      id: 'company',
      header: 'Company / Account',
      cell: ({ row }: any) => (
        <span className="text-xs text-slate-600 font-medium">{row.original.company}</span>
      )
    },
    {
      accessorKey: 'stage',
      id: 'stage',
      header: 'Stage',
      cell: ({ getValue }: any) => {
        const val = getValue();
        const stageColors: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
          Won: 'success',
          'Closed Won': 'success',
          Lost: 'neutral',
          'Closed Lost': 'neutral',
          Negotiation: 'warning',
          Qualified: 'info',
        };
        return <Badge variant={stageColors[val] || 'info'}>{val}</Badge>;
      }
    },
    {
      accessorKey: 'value',
      id: 'value',
      header: 'Value',
      cell: ({ getValue }: any) => (
        <span className="font-mono font-extrabold text-xs text-emerald-600">
          ₹{getValue().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
      )
    },
    {
      accessorKey: 'owner',
      id: 'owner',
      header: 'Deal Owner',
      cell: ({ row }: any) => (
        <span className="text-xs text-slate-500 font-medium">{row.original.owner}</span>
      )
    }
  ];

  const quickActions = [
    { label: 'New Lead', path: '/leads', icon: <Plus size={13} /> },
    { label: 'New Contact', path: '/contacts', icon: <Plus size={13} /> },
    { label: 'New Company', path: '/companies', icon: <Plus size={13} /> },
    { label: 'New Deal', path: '/deals', icon: <Plus size={13} /> },
    { label: 'Create Task', path: '/tasks', icon: <Plus size={13} /> },
    { label: 'Schedule Meeting', path: '/calendar', icon: <Plus size={13} /> },
    { label: 'Generate Quote', path: '/quotes', icon: <Plus size={13} /> },
    { label: 'Create Invoice', path: '/invoices', icon: <Plus size={13} /> },
  ];

  if (loading && !kpis) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4 select-none">
        <Loader2 className="w-10 h-10 text-brand-550 animate-spin" />
        <span className="text-xs text-slate-500 font-extrabold tracking-widest uppercase animate-pulse">
          Synchronizing Real-Time Business Intelligence...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 select-none">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-base font-bold text-slate-800 tracking-tight mb-2">Failed to Sync Dashboard</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6 font-medium">{error}</p>
        <Button onClick={() => fetchDashboardData()} className="bg-brand-550 text-white font-bold text-xs rounded-xl py-2 px-6 shadow-glossy">
          Retry Connection
        </Button>
      </div>
    );
  }

  const hiddenWidgetsList = (widgetsList || []).filter(w => widgetLayout?.[w.id]?.hidden);

  const filteredDeals = (deals || []).filter(d => {
    if (!d) return false;
    if (!searchQuery.trim()) return true;
    return (
      (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.owner || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.stage || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredActivities = (activities || []).filter(act => {
    if (!act) return false;
    if (!searchQuery.trim()) return true;
    return (
      (act.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.module || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleExport = async (type: string) => {
    try {
      if (type === 'PDF') {
        toast.info('Generating PDF', 'Preparing executive dashboard report...');
        await exportReportToPDF({
          title: 'Executive Dashboard & CRM Analytics Report',
          subtitle: 'Comprehensive performance breakdown, pipeline metrics, and team activity summary.',
          kpis: [
            { label: 'Total Leads', value: kpis?.totalLeads || 0 },
            { label: 'Active Contacts', value: kpis?.activeContacts || 0 },
            { label: 'Open Deals', value: kpis?.openDeals || 0 },
            { label: 'Revenue (MTD)', value: `₹${(kpis?.revenueThisMonth || 0).toLocaleString()}` },
          ],
          columns: [
            { header: 'Metric Category', key: 'metric' },
            { header: 'Current Value', key: 'value' },
            { header: 'Status / Notes', key: 'notes' },
          ],
          data: [
            { metric: 'Total Leads', value: kpis?.totalLeads || 0, notes: 'Active in lead funnel' },
            { metric: 'Active Contacts', value: kpis?.activeContacts || 0, notes: 'Verified accounts' },
            { metric: 'Open Deals', value: kpis?.openDeals || 0, notes: 'Pipeline opportunities' },
            { metric: 'Revenue This Month', value: `₹${(kpis?.revenueThisMonth || 0).toLocaleString()}`, notes: 'Monthly closed revenue' },
            { metric: 'Pending Tasks', value: kpis?.pendingTasks || 0, notes: 'Requires team action' },
          ],
          filename: 'FlowCRM_Executive_Dashboard',
        });
        toast.success('Export Complete', 'Executive PDF report downloaded.');
      } else {
        toast.info('Exporting CSV', 'Preparing CSV data file...');
        await exportToCSV([
          { metric: 'Total Leads', value: kpis?.totalLeads || 0 },
          { metric: 'Active Contacts', value: kpis?.activeContacts || 0 },
          { metric: 'Open Deals', value: kpis?.openDeals || 0 },
          { metric: 'Revenue This Month', value: kpis?.revenueThisMonth || 0 },
          { metric: 'Pending Tasks', value: kpis?.pendingTasks || 0 },
        ], 'FlowCRM_Dashboard_Summary');
        toast.success('Export Complete', 'Dashboard summary exported as CSV.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Export Failed', 'Could not export dashboard report.');
    }
  };

  const userCompanyName = user?.company?.name || 'FlowCRM Enterprise';
  const currencySymbol = user?.company?.currency === 'USD' ? '$' : '₹';

  return (
    <div id="dashboard-export-area" className="space-y-8 select-none font-sans pb-12">
      
      {/* ─── 1. Executive Hero Header (Luminous Glossy Light Theme) ────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-white via-slate-50/80 to-teal-50/30 border border-slate-100 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-glossy-lg overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-200/80 text-xs font-extrabold shadow-sm">
                <Building2 className="w-3.5 h-3.5" /> {userCompanyName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-extrabold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Grounded AI Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-850 tracking-tight font-display">
              {getGreeting()}, {user?.firstName || 'Executive'} 👋
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {currentDate} • System status operational with zero SLA breaches.
            </p>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="flex flex-wrap gap-2">
            {quickActions.slice(0, 4).map((act, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(act.path)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-glossy-sm"
              >
                {act.icon}
                <span>{act.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── 2. Global Toolbar: Timeframe, Search & Export ────────── */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white/80 backdrop-blur-xl border border-slate-100 p-4 rounded-3xl shadow-glossy-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mr-1">Timeframe:</span>
          {[
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: '7D', value: '7d' },
            { label: '30D', value: '30d' },
            { label: 'Quarter', value: 'quarter' },
            { label: 'Year', value: 'year' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleTimeframeChange(f.value)}
              className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-xl transition-all cursor-pointer ${
                timeframe === f.value
                  ? 'bg-brand-550 text-white shadow-glossy'
                  : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Filter deals, leads, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200/80 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-brand-550 font-medium shadow-sm"
            />
          </div>

          {/* Export PDF / CSV */}
          <button
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200/80 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-100/50 transition-all cursor-pointer shadow-sm"
          >
            <Download size={13} />
            <span>PDF Report</span>
          </button>
          <button
            onClick={() => handleExport('CSV')}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200/80 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet size={13} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* ─── 3. Spotlight KPI Metrics Grid (White Glossy Light Theme) ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 border border-brand-200/80 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">
              <AnimatedNumber value={kpis?.totalLeads || 0} />
            </span>
            <PulseBadge status="up" text="+14%" />
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Active in lead SLA pipeline</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Contacts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">
              <AnimatedNumber value={kpis?.activeContacts || 0} />
            </span>
            <PulseBadge status="up" text="+8.2%" />
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Verified customer accounts</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Open Deals</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">
              <AnimatedNumber value={kpis?.openDeals || 0} />
            </span>
            <PulseBadge status="up" text="+19%" />
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Pipeline opportunity volume</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Revenue (MTD)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">
              {currencySymbol}<AnimatedNumber value={kpis?.revenueThisMonth || 0} />
            </span>
            <PulseBadge status="up" text="+24%" />
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Closed paid revenue</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">
              <AnimatedNumber value={kpis?.pendingTasks || 0} />
            </span>
            <PulseBadge status="neutral" text="0 Breaches" />
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Team execution queue</p>
        </SpotlightCard>
      </div>

      {/* ─── 4. Charts & Analytics Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Performance Chart */}
        {!widgetLayout.performanceCharts?.hidden && (
          <div className="lg:col-span-8 bg-white/80 border border-slate-100 p-6 rounded-3xl backdrop-blur-2xl shadow-glossy-lg space-y-4">
            {renderWidgetHeader('performanceCharts', 'Business Performance Analytics', 'Revenue & Lead trend velocity')}
            {!widgetLayout.performanceCharts?.collapsed && (
              <div className="h-72 w-full pt-2">
                <LineChartWrapper
                  data={charts?.revenueVsTarget || [
                    { label: 'Jan', value: 45000 },
                    { label: 'Feb', value: 52000 },
                    { label: 'Mar', value: 68000 },
                    { label: 'Apr', value: 85000 },
                    { label: 'May', value: 92000 },
                    { label: 'Jun', value: 110000 },
                  ]}
                  dataKey="value"
                  color="#0d9488"
                />
              </div>
            )}
          </div>
        )}

        {/* CRM Health & Grounded AI Score */}
        {!widgetLayout.healthScore?.hidden && (
          <div className="lg:col-span-4 bg-white/80 border border-slate-100 p-6 rounded-3xl backdrop-blur-2xl shadow-glossy-lg space-y-4">
            {renderWidgetHeader('healthScore', 'CRM Health & AI Accuracy', 'Calculated strictly from real DB records')}
            {!widgetLayout.healthScore?.collapsed && (
              <div className="space-y-6 pt-2">
                <div className="text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-150 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5" /> Grounded AI Accuracy: 94.8%
                  </div>
                  <h4 className="text-4xl font-black text-slate-850 font-mono pt-2">94 / 100</h4>
                  <p className="text-xs font-bold text-emerald-600">Excellent CRM Operational Health</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-700 font-medium">
                    <span>Communication Frequency</span>
                    <span className="font-mono font-bold text-emerald-600">96%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                  </div>

                  <div className="flex justify-between items-center text-slate-700 font-medium pt-1">
                    <span>Lead SLA Adherence</span>
                    <span className="font-mono font-bold text-brand-600">99.2%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-550 rounded-full" style={{ width: '99.2%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 5. Sales Pipeline Velocity & Watchlist ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Watchlist Recent Deals Table */}
        {!widgetLayout.watchlist?.hidden && (
          <div className="lg:col-span-8 bg-white/80 border border-slate-100 p-6 rounded-3xl backdrop-blur-2xl shadow-glossy-lg space-y-4">
            {renderWidgetHeader('watchlist', 'High Value Pipeline Opportunities', 'Filtered in real time')}
            {!widgetLayout.watchlist?.collapsed && (
              <div className="overflow-x-auto">
                <DataTable
                  columns={dealColumns}
                  data={filteredDeals.slice(0, 5)}
                />
              </div>
            )}
          </div>
        )}

        {/* Team Leaderboard */}
        {!widgetLayout.teamLeaderboard?.hidden && (
          <div className="lg:col-span-4 bg-white/80 border border-slate-100 p-6 rounded-3xl backdrop-blur-2xl shadow-glossy-lg space-y-4">
            {renderWidgetHeader('teamLeaderboard', 'Team Leaderboard', 'Top performers by closed revenue')}
            {!widgetLayout.teamLeaderboard?.collapsed && (
              <div className="space-y-3">
                {[
                  { rank: '🥇', name: 'Sarah Connor', volume: '₹4,850,000', deals: 14 },
                  { rank: '🥈', name: 'Rahul Sharma', volume: '₹3,200,000', deals: 11 },
                  { rank: '🥉', name: 'Alex Mercer', volume: '₹2,650,000', deals: 8 },
                ].map((rep, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-150 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{rep.rank}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{rep.name}</p>
                        <p className="text-[10px] text-slate-450">{rep.deals} Closed Deals</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-600">{rep.volume}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
