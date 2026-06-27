import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LineChartWrapper, BarChartWrapper } from '../components/ui/Charts';
import { DataTable } from '../components/ui/Table';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { Avatar } from '../components/ui/Avatar';
import {
  Users2,
  Contact2,
  Building2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  CheckSquare,
  Sparkles,
  Loader2,
  Plus,
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    kpis,
    charts,
    activities,
    tasks,
    deals,
    loading,
    error,
    timeframe,
    fetchDashboardData,
    fetchCharts
  } = useDashboardStore();

  const breadcrumbs = [{ label: 'Dashboard' }];

  // Fetch initial dashboard metrics on load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Determine dynamic time of day greeting
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
    fetchCharts(tf);
  };

  // Mapped columns for Recent Deals table widget
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
    },
    {
      accessorKey: 'expectedCloseDate',
      id: 'expectedCloseDate',
      header: 'Expected Close',
      cell: ({ getValue }: any) => {
        const val = getValue();
        return val ? new Date(val).toLocaleDateString() : 'N/A';
      }
    }
  ];

  // Quick Action Buttons configurations
  const quickActions = [
    { label: 'Add Lead', path: '/leads', icon: <Plus size={14} /> },
    { label: 'Add Contact', path: '/contacts', icon: <Plus size={14} /> },
    { label: 'Add Company', path: '/companies', icon: <Plus size={14} /> },
    { label: 'Create Deal', path: '/deals', icon: <Plus size={14} /> },
    { label: 'Schedule Meeting', path: '/calendar', icon: <Plus size={14} /> },
    { label: 'Create Task', path: '/tasks', icon: <Plus size={14} /> },
  ];

  // Dynamic welcome message user details
  const userName = user?.fullName || 'John';

  // Section Loader skeletons
  if (loading && !kpis) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 select-none">
        <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
        <span className="text-xs text-slate-450 font-semibold animate-pulse">Loading executive dashboards...</span>
      </div>
    );
  }

  // Error recovery block
  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 select-none">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-base font-bold text-slate-800 tracking-tight mb-2">Failed to Load Dashboard</h3>
        <p className="text-xs text-slate-450 max-w-sm mb-6 font-medium">{error}</p>
        <Button onClick={() => fetchDashboardData()} className="bg-brand-550 text-white font-semibold text-xs rounded-xl py-2 px-6">
          Retry Sync
        </Button>
      </div>
    );
  }

  // Fallback structures if database contains no records
  const totalLeads = kpis?.totalLeads || 0;
  const activeContacts = kpis?.activeContacts || 0;
  const totalCompanies = kpis?.totalCompanies || 0;
  const openDeals = kpis?.openDeals || 0;
  const wonDeals = kpis?.wonDeals || 0;
  const lostDeals = kpis?.lostDeals || 0;
  const revenueThisMonth = kpis?.revenueThisMonth || 0;
  const pendingTasks = kpis?.pendingTasks || 0;

  // KPI card items
  const kpiItems = [
    { title: 'Total Leads', value: totalLeads.toLocaleString(), icon: <Users2 className="w-4 h-4 text-indigo-500" />, trend: 'neutral', change: 'Lifetime leads', color: 'indigo' },
    { title: 'Active Contacts', value: activeContacts.toLocaleString(), icon: <Contact2 className="w-4 h-4 text-emerald-500" />, trend: 'up', change: '+3.4%', color: 'emerald' },
    { title: 'Total Companies', value: totalCompanies.toLocaleString(), icon: <Building2 className="w-4 h-4 text-amber-500" />, trend: 'neutral', change: 'Active firms', color: 'amber' },
    { title: 'Open Deals', value: openDeals.toLocaleString(), icon: <Briefcase className="w-4 h-4 text-blue-500" />, trend: 'up', change: '+5.1%', color: 'blue' },
    { title: 'Won Deals', value: wonDeals.toLocaleString(), icon: <Sparkles className="w-4 h-4 text-rose-500" />, trend: 'up', change: 'Sales targets', color: 'rose' },
    { title: 'Lost Deals', value: lostDeals.toLocaleString(), icon: <TrendingDown className="w-4 h-4 text-slate-500" />, trend: 'down', change: '-1.2%', color: 'slate' },
    { title: 'Revenue This Month', value: `$${revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: <DollarSign className="w-4 h-4 text-emerald-600" />, trend: 'up', change: '+12.4%', color: 'emerald' },
    { title: 'Pending Tasks', value: pendingTasks.toLocaleString(), icon: <CheckSquare className="w-4 h-4 text-indigo-600" />, trend: 'neutral', change: 'Awaiting checks', color: 'indigo' },
  ];

  // Lead Conversion Funnel details (simulated counts or computed from won/leads)
  const funnelChartData = [
    { name: 'New Leads', value: totalLeads },
    { name: 'Contacted', value: Math.round(totalLeads * 0.75) },
    { name: 'Qualified', value: Math.round(totalLeads * 0.55) },
    { name: 'Proposal Sent', value: Math.round(totalLeads * 0.35) },
    { name: 'Negotiation', value: Math.round(totalLeads * 0.20) },
    { name: 'Won', value: wonDeals },
    { name: 'Lost', value: lostDeals },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Top Welcome Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-[11px] text-slate-450 font-semibold flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" />
            <span>{currentDate}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" onClick={() => fetchDashboardData()} className="flex items-center gap-1.5 border-slate-200 shadow-glossy-sm">
            <Activity size={12} className="text-brand-550" />
            <span>Refresh Metrics</span>
          </Button>
        </div>
      </div>

      {/* KPI summaries cards grid (8 cards responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiItems.map((stat, i) => (
          <Card key={i} hoverable className="relative overflow-hidden bg-white border-slate-100 shadow-glossy-sm p-4">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <div className="p-2 bg-slate-50 text-slate-500 rounded-xl border border-slate-100/50 shadow-glossy-sm flex-shrink-0">
                {stat.icon}
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-850 tracking-tight">{stat.value}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 ${
                stat.trend === 'up'
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                  : stat.trend === 'down'
                  ? 'text-rose-700 bg-rose-50 border border-rose-100'
                  : 'text-slate-600 bg-slate-50 border border-slate-100'
              }`}>
                {stat.trend === 'up' ? <TrendingUp size={10} /> : stat.trend === 'down' ? <TrendingDown size={10} /> : null}
                <span>{stat.change}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Action Buttons panel */}
      <Card className="p-4 bg-white/70 backdrop-blur-xl border-slate-100/80 shadow-glossy-sm flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick Action Shortcuts</h4>
        <div className="flex gap-3 overflow-x-auto pb-1 flex-nowrap scrollbar-thin">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-150/70 hover:bg-slate-50 text-xs font-semibold text-slate-600 bg-white rounded-xl shadow-glossy-sm transition-all whitespace-nowrap"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section 1: Sales Overview (Monthly trend charts) */}
        <Card className="lg:col-span-2 bg-white/80 border-slate-100 shadow-glossy-sm">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Monthly Revenue & Trend Charts</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">Timeline volume tracking analysis</CardDescription>
            </div>
            
            {/* Filter buttons */}
            <div className="flex gap-1.5">
              {['7d', '30d', '90d', '12m'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                    timeframe === tf
                      ? 'bg-brand-550 border-brand-550 text-white shadow-glossy-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {charts.length === 0 || charts.every((c) => c.revenue === 0 && c.leads === 0) ? (
              <div className="h-[260px] flex flex-col items-center justify-center text-center">
                <HelpCircle className="w-8 h-8 text-slate-350 mb-1" />
                <p className="text-xs font-semibold text-slate-600">No chart trend records found</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Database contains no transaction history in this timeframe.</p>
              </div>
            ) : (
              <LineChartWrapper
                data={charts}
                xKey="label"
                series={[
                  { key: 'revenue', name: 'Revenue ($)', color: '#2563eb' },
                  { key: 'leads', name: 'Leads Created', color: '#10b981' },
                  { key: 'deals', name: 'Deals Qualified', color: '#f59e0b' },
                ]}
                height={260}
              />
            )}
          </CardContent>
        </Card>

        {/* Chart Section 2: Conversion Funnel */}
        <Card className="bg-white/80 border-slate-100 shadow-glossy-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Lead Conversion Funnel</CardTitle>
            <CardDescription className="text-xs text-slate-450 mt-1">Stage velocity drop-offs</CardDescription>
          </CardHeader>
          <CardContent>
            {totalLeads === 0 ? (
              <div className="h-[260px] flex flex-col items-center justify-center text-center">
                <HelpCircle className="w-8 h-8 text-slate-350 mb-1" />
                <p className="text-xs font-semibold text-slate-600">No leads funnel data</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Generate leads to populate CRM pipeline.</p>
              </div>
            ) : (
              <BarChartWrapper
                data={funnelChartData}
                xKey="name"
                series={[{ key: 'value', name: 'Leads Count', color: '#3b82f6' }]}
                height={260}
              />
            )}
          </CardContent>
        </Card>

        {/* Table Section 3: Recent Deals */}
        <Card className="lg:col-span-2 bg-white border-slate-100 shadow-glossy-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">High Value Pipeline Watchlist</CardTitle>
            <CardDescription className="text-xs text-slate-450 mt-1">Monitor priority deal acquisitions</CardDescription>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center">
                <HelpCircle className="w-8 h-8 text-slate-350 mb-1" />
                <p className="text-xs font-semibold text-slate-650">No recent deals available</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Deals will appear automatically on creation.</p>
              </div>
            ) : (
              <DataTable
                columns={dealColumns}
                data={deals}
                searchColumnId="name"
                searchPlaceholder="Search watchlist..."
              />
            )}
          </CardContent>
        </Card>

        {/* Timeline Section 4: Recent Activities */}
        <Card className="bg-white border-slate-100 shadow-glossy-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Recent System Logs</CardTitle>
            <CardDescription className="text-xs text-slate-450 mt-1">Corporate audit log updates</CardDescription>
          </CardHeader>
          <CardContent className="h-[310px] overflow-y-auto pr-1 scrollbar-thin">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Activity className="w-8 h-8 text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">No recent activities log</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Logs will print as users execute commands.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex gap-3 text-left items-start p-2 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <Avatar name={act.userName} size="sm" className="w-8 h-8 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-none mb-1">{act.userName}</p>
                      <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                        {act.action.replace(/_/g, ' ')} in <span className="text-brand-550 font-bold uppercase tracking-wide text-[9px]">{act.module}</span>
                      </p>
                      <span className="text-[9px] font-medium text-slate-400 block mt-1">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist Section 5: Upcoming Tasks */}
        <Card className="bg-white border-slate-100 shadow-glossy-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Upcoming Tasks</CardTitle>
            <CardDescription className="text-xs text-slate-450 mt-1">Corporate checklist agenda</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] overflow-y-auto pr-1 scrollbar-thin">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <CheckSquare className="w-8 h-8 text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-650">No pending agenda items</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Checklist tasks appear as you schedule agenda items.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {tasks.map((task) => (
                  <div key={task.id} className="flex justify-between items-start gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50 transition-colors text-left">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{task.subject}</h4>
                      <div className="mt-1.5 flex gap-2 items-center text-[10px] font-semibold text-slate-400">
                        <span className={`px-1.5 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-wider ${
                          task.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {task.priority}
                        </span>
                        <span>•</span>
                        <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-150 whitespace-nowrap">
                      {task.owner}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Performance Preview Section */}
        <Card className="lg:col-span-2 bg-white border-slate-100 shadow-glossy-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Team Performance Preview</CardTitle>
            <CardDescription className="text-xs text-slate-450 mt-1">Overview of highest performing sales executives</CardDescription>
          </CardHeader>
          <CardContent>
            {wonDeals === 0 ? (
              <div className="h-[180px] flex flex-col items-center justify-center text-center">
                <Users2 className="w-8 h-8 text-slate-350 mb-1" />
                <p className="text-xs font-semibold text-slate-600">No closed deal logs yet</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Perform sales closing events to compile executive previews.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Top Sales Executive</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Avatar name={userName} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-850">{userName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{user?.jobTitle || 'Representative'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 text-left flex flex-col justify-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Highest Revenue</span>
                  <span className="text-base font-black text-emerald-600 mt-1">${revenueThisMonth.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">This Month Closed Won volume</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
