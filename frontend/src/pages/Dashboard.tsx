import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LineChartWrapper } from '../components/ui/Charts';
import { DataTable } from '../components/ui/Table';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { Avatar } from '../components/ui/Avatar';
import { motion } from 'framer-motion';
import { exportToPDF, exportToCSV } from '../utils/export';
import { useToast } from '../components/ui/ToastProvider';
import {
  Users2,
  Briefcase,
  Activity,
  DollarSign,
  CheckSquare,
  Sparkles,
  Loader2,
  Plus,
  Calendar,
  AlertCircle,
  HelpCircle,
  Pin,
  PinOff,
  EyeOff,
  Minimize2,
  Maximize2,
  RotateCcw,
  Search,
  Download,
  Clock,
  HeartPulse,
  Trophy,
  Volume2,
  X,
  FileSpreadsheet
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

  // Search input and Announcement state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [restoreMenuOpen, setRestoreMenuOpen] = useState(false);

  const breadcrumbs = [{ label: 'Dashboard' }];

  // Initial datasets synchronization
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
    fetchCharts(tf);
  };

  // 10 sections definitions for smart widgets layout mapping
  const widgetsList = [
    { id: 'todayOverview', label: "Today's Business Overview" },
    { id: 'performanceCharts', label: 'Business Performance' },
    { id: 'salesPipeline', label: 'Sales Pipeline Overview' },
    { id: 'revenueAnalytics', label: 'Revenue Analytics' },
    { id: 'goalsTracker', label: 'Goals Tracker' },
    { id: 'healthScore', label: 'CRM Health Score' },
    { id: 'upcomingSchedule', label: 'Upcoming Schedule' },
    { id: 'customerActivities', label: 'Recent Customer Activities' },
    { id: 'teamLeaderboard', label: 'Team Leaderboard' },
    { id: 'watchlist', label: 'High Value Pipeline Watchlist' },
  ];

  // Helper rendering widget header control toolbars (Pin, Collapse, Hide)
  const renderWidgetHeader = (widgetId: string, title: string, subtitle?: string) => {
    const layout = widgetLayout[widgetId] || { hidden: false, collapsed: false, pinned: false };
    
    return (
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-1">
          {/* Pin Button */}
          <button
            onClick={() => toggleWidget(widgetId, 'pinned')}
            className={`p-1.5 rounded-lg border transition-colors ${
              layout.pinned ? 'bg-brand-50 border-brand-100 text-brand-550' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={layout.pinned ? 'Unpin from Top' : 'Pin to Top'}
          >
            {layout.pinned ? <PinOff size={11} /> : <Pin size={11} />}
          </button>
          
          {/* Collapse Button */}
          <button
            onClick={() => toggleWidget(widgetId, 'collapsed')}
            className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-400 hover:text-slate-650 transition-colors"
            title={layout.collapsed ? 'Expand Widget' : 'Collapse Widget'}
          >
            {layout.collapsed ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
          </button>

          {/* Hide Button */}
          <button
            onClick={() => toggleWidget(widgetId, 'hidden')}
            className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors"
            title="Hide Widget"
          >
            <EyeOff size={11} />
          </button>
        </div>
      </div>
    );
  };

  // Recent Deals table layout
  const dealColumns = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Deal Name',
      cell: ({ row }: any) => (
        <span className="font-bold text-slate-800">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'company',
      id: 'company',
      header: 'Company Name',
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
        <span className="font-semibold text-slate-700">
          ${getValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      accessorKey: 'owner',
      id: 'owner',
      header: 'Owner',
    }
  ];

  // Quick Action Panel configuration
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 select-none">
        <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
        <span className="text-xs text-slate-450 font-semibold animate-pulse">Synchronizing Advanced Business Intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 select-none">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-base font-bold text-slate-800 tracking-tight mb-2">Failed to Sync Dashboard</h3>
        <p className="text-xs text-slate-450 max-w-sm mb-6 font-medium">{error}</p>
        <Button onClick={() => fetchDashboardData()} className="bg-brand-550 text-white font-semibold text-xs rounded-xl py-2 px-6">
          Retry Connection
        </Button>
      </div>
    );
  }

  // Filter hidden widgets
  const hiddenWidgetsList = widgetsList.filter(w => widgetLayout[w.id]?.hidden);
  
  // Custom global search action (mock/placeholder alert)
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Search target: "${searchQuery}" is placeholder. Real module indices will sync in subsequent phases.`);
    }
  };

  const handleExport = async (type: string) => {
    const id = 'dashboard-export-area';
    let el = document.getElementById(id);
    if (!el) {
      el = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3') as HTMLElement;
    }
    if (!el) { toast.error('Export Failed', 'Could not find dashboard content to export.'); return; }
    try {
      if (type === 'PDF') {
        await exportToPDF(id, 'FlowCRM_Dashboard');
        toast.success('Export Complete', 'Dashboard exported as PDF.');
      } else {
        exportToCSV([
          { metric: 'Total Leads', value: kpis?.totalLeads || 0 },
          { metric: 'Active Contacts', value: kpis?.activeContacts || 0 },
          { metric: 'Open Deals', value: kpis?.openDeals || 0 },
          { metric: 'Revenue This Month', value: kpis?.revenueThisMonth || 0 },
          { metric: 'Pending Tasks', value: kpis?.pendingTasks || 0 },
        ], 'FlowCRM_Dashboard_Summary');
        toast.success('Export Complete', 'Dashboard summary exported as CSV.');
      }
    } catch {
      toast.error('Export Failed', 'Could not export dashboard. Check console for details.');
    }
  };

  return (
    <div id="dashboard-export-area" className="space-y-6 select-none">
      
      {/* 1. Global Toolbar: Filters, Search, Layout & Export controls */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white/70 backdrop-blur-xl border border-slate-100 p-4 rounded-3xl shadow-glossy-sm">
        
        {/* Greetings Header */}
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-1">
            {getGreeting()}, {user?.fullName || 'John'} 👋
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{currentDate}</p>
        </div>

        {/* Unified analytics timeframe selector */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
            {[
              { label: 'Daily', value: 'today' },
              { label: 'Weekly', value: '7d' },
              { label: '3 Days', value: '3d' },
              { label: 'Monthly', value: '30d' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => handleTimeframeChange(f.value)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                  timeframe === f.value
                    ? 'bg-brand-550 text-white shadow-glossy-sm'
                    : 'text-slate-400 hover:text-slate-700 bg-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search bar UI placeholder */}
          <form onSubmit={handleGlobalSearch} className="relative flex-grow sm:flex-grow-0 max-w-xs w-full sm:w-48 xl:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search leads, deals, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[10px] border border-slate-150 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-semibold text-slate-650"
            />
          </form>

          {/* Widget Restore layout dropdown controls */}
          <div className="relative">
            <button
              onClick={() => setRestoreMenuOpen(!restoreMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-[10px] font-black uppercase text-slate-650 bg-white rounded-xl shadow-glossy-sm hover:bg-slate-50"
            >
              <RotateCcw size={11} className="text-slate-400" />
              <span>Widgets ({hiddenWidgetsList.length})</span>
            </button>

            {restoreMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRestoreMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-100 shadow-glossy-md p-2 z-20">
                  <div className="px-2 py-1.5 border-b border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Hidden Widgets</span>
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto pr-0.5">
                    {hiddenWidgetsList.length === 0 ? (
                      <span className="text-[10px] font-semibold text-slate-400 block px-2 py-1 italic">All widgets are active</span>
                    ) : (
                      hiddenWidgetsList.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => {
                            toggleWidget(w.id, 'hidden');
                            setRestoreMenuOpen(false);
                          }}
                          className="flex w-full items-center justify-between text-left px-2 py-1.5 text-[10px] font-semibold text-slate-650 hover:bg-slate-50 rounded-lg"
                        >
                          <span>{w.label}</span>
                          <span className="text-brand-550 font-bold">Restore</span>
                        </button>
                      ))
                    )}
                  </div>
                  {hiddenWidgetsList.length > 0 && (
                    <button
                      onClick={() => {
                        resetWidgets();
                        setRestoreMenuOpen(false);
                      }}
                      className="w-full text-center border-t border-slate-100 mt-1 pt-1.5 text-[10px] font-bold text-brand-550 block hover:underline"
                    >
                      Restore All Defaults
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Export items dropdown */}
          <div className="flex border border-slate-150 rounded-xl bg-white shadow-glossy-sm">
            <button
              onClick={() => handleExport('PDF')}
              className="px-2.5 py-2 hover:bg-slate-50 border-r border-slate-150 text-slate-500 hover:text-slate-800"
              title="Export as PDF"
            >
              <Download size={11} />
            </button>
            <button
              onClick={() => handleExport('Excel')}
              className="px-2.5 py-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800"
              title="Export as Excel"
            >
              <FileSpreadsheet size={11} />
            </button>
          </div>

        </div>
      </div>

      {/* 2. Admin Announcements Widget Banner */}
      {showAnnouncement && (
        <div className="relative overflow-hidden bg-brand-50 border border-brand-100 rounded-3xl p-4 flex gap-3.5 items-start animate-scale-up">
          <div className="p-2 bg-brand-550 text-white rounded-xl shadow-glossy flex-shrink-0">
            <Volume2 size={16} />
          </div>
          <div className="min-w-0 pr-8">
            <h4 className="text-xs font-bold text-brand-850 leading-snug">System Update Notice: Phase 3 Completed</h4>
            <p className="text-[11px] text-brand-700 mt-0.5 leading-relaxed font-medium">
              We have completed the deployment of the Executive Business Intelligence dashboard foundation. Custom modules for Leads, Contacts, and Company databases will begin integration in Phase 4.
            </p>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="absolute top-4 right-4 text-brand-400 hover:text-brand-700 bg-brand-100/50 hover:bg-brand-100 p-1 rounded-lg transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Render Widgets Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* SECTION 1: Today's Business Overview */}
        {!widgetLayout.todayOverview?.hidden && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="lg:col-span-3"
          >
          <Card className={`bg-white/70 border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.todayOverview?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('todayOverview', "Today's Business Overview", 'Operational pipeline velocities')}
            
            {!widgetLayout.todayOverview?.collapsed && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { label: "Today's Leads", val: businessOverview?.leads || 0, icon: <Users2 size={13} className="text-brand-550" />, progress: 42, color: 'blue' },
                  { label: "Today's Meetings", val: businessOverview?.meetings || 0, icon: <Calendar size={13} className="text-indigo-500" />, progress: 60, color: 'indigo' },
                  { label: "Today's Calls", val: businessOverview?.calls || 0, icon: <Activity size={13} className="text-emerald-500" />, progress: 80, color: 'emerald' },
                  { label: "Today's Tasks", val: businessOverview?.tasks || 0, icon: <CheckSquare size={13} className="text-rose-500" />, progress: 25, color: 'rose' },
                  { label: "Today's Revenue", val: `$${(businessOverview?.revenue || 0).toLocaleString()}`, icon: <DollarSign size={13} className="text-emerald-600" />, progress: 75, color: 'emerald' },
                  { label: "Today's Follow-ups", val: businessOverview?.followups || 0, icon: <Clock size={13} className="text-indigo-600" />, progress: 50, color: 'indigo' },
                  { label: "Closed Deals", val: businessOverview?.closedDeals || 0, icon: <Briefcase size={13} className="text-blue-600" />, progress: 90, color: 'blue' },
                  { label: "New Customers", val: businessOverview?.newCustomers || 0, icon: <Sparkles size={13} className="text-amber-500" />, progress: 35, color: 'amber' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-slate-100/80 bg-white shadow-glossy-sm hover:scale-[1.02] hover:shadow-glossy-md transition-all text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 truncate pr-2">{item.label}</span>
                      <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">{item.icon}</div>
                    </div>
                    <p className="text-base font-black text-slate-800 leading-none mb-2">{item.val}</p>
                    <div className="w-full bg-slate-100/80 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          item.color === 'emerald' ? 'bg-emerald-500' :
                          item.color === 'rose' ? 'bg-rose-500' :
                          item.color === 'indigo' ? 'bg-indigo-500' : 'bg-brand-550'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            </Card>
            </motion.div>
          )}
        
        {/* SECTION 2: Business Performance Charts */}
        {!widgetLayout.charts?.hidden && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="lg:col-span-2"
          >
          <Card className={`bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.charts?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('charts', 'Business Performance Trend Charts', 'Timeframe aggregates tracking')}
            
            {!widgetLayout.charts?.collapsed && (
              <div className="space-y-4">
                {timeframe && <div className="text-right text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Period: {timeframe}</div>}

                {charts.length === 0 || charts.every(c => c.revenue === 0) ? (
                  <div className="h-[250px] flex flex-col items-center justify-center text-center">
                    <HelpCircle className="w-8 h-8 text-slate-300 mb-1" />
                    <p className="text-xs font-semibold text-slate-650">No chart analytics values compiled</p>
                  </div>
                ) : (
                  <LineChartWrapper
                    data={charts}
                    xKey="label"
                    series={[
                      { key: 'revenue', name: 'Revenue ($)', color: '#2563eb' },
                      { key: 'leads', name: 'Leads Count', color: '#10b981' },
                      { key: 'deals', name: 'Deals Count', color: '#f59e0b' },
                    ]}
                    height={250}
                  />
                )}
              </div>
            )}
          </Card>
          </motion.div>
        )}

        {/* SECTION 10 & 9 Goals & Health Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* SECTION 9: Business Health Score */}
          {!widgetLayout.health?.hidden && (
            <Card className={`bg-white border-slate-100 shadow-glossy-sm p-5 ${
              widgetLayout.health?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
            }`}>
              {renderWidgetHeader('health', 'CRM Health Compliance', 'Process audit indexes')}
              
              {!widgetLayout.health?.collapsed && healthScore && (
                <div className="space-y-4">
                  <div className="flex gap-4 items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <div className="text-left">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Overall Health Score</span>
                      <p className="text-2xl font-black text-slate-800 leading-none mt-1">{healthScore.overallScore}%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-550">
                      <HeartPulse size={20} />
                    </div>
                  </div>

                  <div className="space-y-2.5 text-left">
                    {[
                      { label: 'Lead Response Time', value: healthScore.metrics.leadResponse },
                      { label: 'Pipeline Health Ratio', value: healthScore.metrics.pipelineHealth },
                      { label: 'Task Checklist Completion', value: healthScore.metrics.taskCompletion },
                      { label: 'Meeting Attendance Index', value: healthScore.metrics.meetingAttendance },
                      { label: 'Team Sales Targets', value: healthScore.metrics.salesPerformance },
                    ].map((metric, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>{metric.label}</span>
                          <span>{metric.value}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full">
                          <div className="bg-brand-550 h-1 rounded-full" style={{ width: `${metric.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* SECTION 10: Business Goals Tracker */}
          {!widgetLayout.goals?.hidden && (
            <Card className={`bg-white border-slate-100 shadow-glossy-sm p-5 ${
              widgetLayout.goals?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
            }`}>
              {renderWidgetHeader('goals', 'Sales Targets & Goals', 'Corporate performance objectives')}
              
              {!widgetLayout.goals?.collapsed && goals && (
                <div className="space-y-4">
                  {[
                    { label: 'Won Deals Target', curr: goals.salesGoal.current, max: goals.salesGoal.target, suffix: ' deals' },
                    { label: 'Monthly Target Volume', curr: goals.monthlyTarget.current, max: goals.monthlyTarget.target, prefix: '$' },
                    { label: 'Closed pipeline quota', curr: goals.closedDealsTarget.current, max: goals.closedDealsTarget.target, suffix: ' closed' },
                    { label: 'Aggregate Revenue Goal', curr: goals.revenueTarget.current, max: goals.revenueTarget.target, prefix: '$' },
                  ].map((goal, idx) => {
                    const percent = Math.round((goal.curr / goal.max) * 100) || 0;
                    return (
                      <div key={idx} className="p-3 bg-slate-50/20 border border-slate-100/60 rounded-2xl space-y-2 text-left">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-slate-550">{goal.label}</span>
                          <span className="text-xs font-black text-slate-800">
                            {goal.prefix || ''}{goal.curr.toLocaleString()}/{goal.prefix || ''}{goal.max.toLocaleString()}{goal.suffix || ''}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-550 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span>Progress Quota</span>
                          <span className="text-brand-550 font-black">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* SECTION 3: Sales Pipeline Overview */}
        {!widgetLayout.pipeline?.hidden && (
          <Card className={`lg:col-span-3 bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.pipeline?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('pipeline', 'Sales Pipeline Stage Analytics', 'CRM pipeline drop-offs & conversion velocity')}
            
            {!widgetLayout.pipeline?.collapsed && (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mt-2">
                {pipelineData.map((pipe) => (
                  <div key={pipe.stage} className="p-3.5 rounded-2xl border border-slate-150/70 bg-slate-50/20 hover:scale-[1.01] transition-all text-left">
                    <span className="px-2 py-0.5 text-[8px] font-black text-brand-700 bg-brand-50 border border-brand-100 rounded-lg uppercase tracking-wider">
                      {pipe.stage}
                    </span>
                    <p className="text-base font-black text-slate-850 mt-3 mb-1">{pipe.count} deals</p>
                    <p className="text-[11px] font-bold text-slate-500">${pipe.revenue.toLocaleString()}</p>
                    <div className="h-px bg-slate-150/60 my-2" />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Conversion</span>
                      <span className="text-brand-550 font-black">{pipe.conversionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* SECTION 8: Revenue Analytics */}
        {!widgetLayout.revenue?.hidden && (
          <Card className={`lg:col-span-2 bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.revenue?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('revenue', 'Revenue Aggregates & Deal Valuation', 'Revenue analysis metrics')}
            
            {!widgetLayout.revenue?.collapsed && revenueAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {[
                  { label: "Today's Volume", val: `$${revenueAnalytics.today.toLocaleString()}`, change: '+12.4%', color: 'emerald' },
                  { label: 'Weekly Revenue', val: `$${revenueAnalytics.weekly.toLocaleString()}`, change: '+4.2%', color: 'emerald' },
                  { label: 'Monthly Revenue', val: `$${revenueAnalytics.monthly.toLocaleString()}`, change: '+8.6%', color: 'emerald' },
                  { label: 'Quarterly Volume', val: `$${revenueAnalytics.quarterly.toLocaleString()}`, change: '+14.1%', color: 'emerald' },
                  { label: 'Yearly Volume', val: `$${revenueAnalytics.yearly.toLocaleString()}`, change: '+18.5%', color: 'emerald' },
                  { label: 'Average Deal Size', val: `$${Math.round(revenueAnalytics.averageDealValue).toLocaleString()}`, change: 'Total Closed Won', color: 'indigo' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{item.label}</span>
                    <p className="text-lg font-black text-slate-800 leading-none mt-1 mb-2">{item.val}</p>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-wider">
                      {item.change}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* SECTION 4: Team Leaderboard */}
        {!widgetLayout.team?.hidden && (
          <Card className={`lg:col-span-1 bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.team?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('team', 'Sales Representative Leaderboard', 'Performance ranking')}
            
            {!widgetLayout.team?.collapsed && (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin text-left">
                {teamLeaderboard.length === 0 ? (
                  <div className="py-12 text-center">
                    <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-500">No representative ratings compiled</p>
                  </div>
                ) : (
                  teamLeaderboard.map((emp, idx) => (
                    <div key={emp.name} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/20">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-550 border border-slate-200">
                        {idx + 1}
                      </div>
                      <Avatar name={emp.name} size="sm" className="w-8 h-8 flex-shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <h4 className="text-xs font-bold text-slate-850 truncate leading-none mb-1">{emp.name}</h4>
                        <span className="text-[9px] font-bold text-slate-400">{emp.department} • Conversion {emp.conversionRate}%</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-slate-850 block leading-none mb-1">${emp.revenue.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-slate-450 uppercase">{emp.closedDeals} closed</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        )}

        {/* SECTION 5: Upcoming Schedule preview */}
        {!widgetLayout.calendar?.hidden && (
          <Card className={`bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.calendar?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('calendar', 'Calendar Schedule Preview', 'Agenda checklist')}
            
            {!widgetLayout.calendar?.collapsed && calendarPreview && (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin text-left">
                {/* Today meetings */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-brand-700 uppercase tracking-wider mb-2">Today</h4>
                  {calendarPreview.todayMeetings.length === 0 ? (
                    <span className="text-[10px] font-medium text-slate-400 italic pl-1 block">No meetings scheduled today</span>
                  ) : (
                    calendarPreview.todayMeetings.map((meet) => (
                      <div key={meet.id} className="p-2.5 rounded-xl border border-slate-100 bg-brand-50/20">
                        <h5 className="text-xs font-bold text-slate-800">{meet.title}</h5>
                        <p className="text-[10px] text-slate-450 font-semibold mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          <span>{new Date(meet.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Tomorrow meetings */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-2">Tomorrow</h4>
                  {calendarPreview.tomorrowMeetings.length === 0 ? (
                    <span className="text-[10px] font-medium text-slate-400 italic pl-1 block">No meetings scheduled tomorrow</span>
                  ) : (
                    calendarPreview.tomorrowMeetings.map((meet) => (
                      <div key={meet.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
                        <h5 className="text-xs font-bold text-slate-750">{meet.title}</h5>
                        <p className="text-[10px] text-slate-450 font-semibold mt-1">
                          {new Date(meet.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* SECTION 6: Recent Activity timeline feed */}
        {!widgetLayout.customerActivities?.hidden && (
          <Card className={`bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.customerActivities?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('customerActivities', 'Recent Customer Activities', 'Audit trails')}
            
            {!widgetLayout.customerActivities?.collapsed && (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin text-left">
                {activities.length === 0 ? (
                  <div className="py-16 text-center">
                    <Activity className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-500">No activity logs parsed</p>
                  </div>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50/50">
                      <Avatar name={act.userName} size="sm" className="w-8 h-8 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 leading-none mb-1">{act.userName}</h4>
                        <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                          {act.action.replace(/_/g, ' ')}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[9px] font-black text-brand-550 uppercase bg-brand-50 border border-brand-100 px-1 py-0.5 rounded-lg tracking-wider">
                            {act.module}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400">
                            {new Date(act.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        )}

        {/* SECTION 7: Quick Access Actions */}
        {!widgetLayout.quickAccess?.hidden && (
          <Card className={`bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.quickAccess?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('quickAccess', 'Quick Actions Center', 'Generate templates')}
            
            {!widgetLayout.quickAccess?.collapsed && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex w-full items-center gap-1.5 px-3.5 py-2.5 border border-slate-150/70 hover:bg-slate-50 text-[11px] font-bold text-slate-655 bg-white rounded-xl shadow-glossy-sm transition-all text-left"
                  >
                    <span className="p-1 rounded bg-slate-50 border border-slate-100 text-brand-550 flex-shrink-0">{action.icon}</span>
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* SECTION 6: High Value Watchlist Deals */}
        {!widgetLayout.watchlist?.hidden && (
          <Card className={`lg:col-span-3 bg-white border-slate-100 shadow-glossy-sm p-5 ${
            widgetLayout.watchlist?.pinned ? 'ring-2 ring-brand-550/40 order-first' : ''
          }`}>
            {renderWidgetHeader('watchlist', 'High Value Pipeline Watchlist', 'Active transaction watchlists')}
            
            {!widgetLayout.watchlist?.collapsed && (
              <div className="mt-2">
                {deals.length === 0 ? (
                  <div className="py-12 text-center">
                    <Activity className="w-8 h-8 text-slate-350 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-600">No active deals found</p>
                  </div>
                ) : (
                  <DataTable
                    columns={dealColumns}
                    data={deals}
                    searchColumnId="name"
                    searchPlaceholder="Search watchlist..."
                  />
                )}
              </div>
            )}
          </Card>
        )}

      </motion.div>
    </div>
  );
};

export default Dashboard;
