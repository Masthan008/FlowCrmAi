import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LineChartWrapper, BarChartWrapper, PieChartWrapper } from '../components/ui/Charts';
import { DataTable } from '../components/ui/Table';
import { useToast } from '../components/ui/ToastProvider';
import { TrendingUp, Users, DollarSign, Activity, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const toast = useToast();
  const breadcrumbs = [{ label: 'Dashboard' }];

  // Mock dashboard metric summaries
  const stats = [
    { title: 'Total Leads', value: '1,482', change: '+12.5%', trend: 'up', icon: <Users className="w-5 h-5" /> },
    { title: 'Active Deals', value: '184', change: '+8.2%', trend: 'up', icon: <Activity className="w-5 h-5" /> },
    { title: 'Pipeline Value', value: '$845,900', change: '+18.4%', trend: 'up', icon: <DollarSign className="w-5 h-5" /> },
    { title: 'Conversion Rate', value: '2.84%', change: '-0.4%', trend: 'down', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  // Chart Mocks
  const lineChartData = [
    { name: 'Jan', pipeline: 240000, target: 200000 },
    { name: 'Feb', pipeline: 300000, target: 250000 },
    { name: 'Mar', pipeline: 450000, target: 300000 },
    { name: 'Apr', pipeline: 500000, target: 350000 },
    { name: 'May', pipeline: 680000, target: 400000 },
    { name: 'Jun', pipeline: 845900, target: 450000 },
  ];

  const barChartData = [
    { name: 'Leads Generated', value: 340 },
    { name: 'Contacted', value: 280 },
    { name: 'Qualified', value: 190 },
    { name: 'Proposal Sent', value: 110 },
    { name: 'Negotiation', value: 65 },
    { name: 'Won', value: 42 },
  ];

  const pieChartData = [
    { name: 'Enterprise', value: 45, color: '#2563eb' },
    { name: 'Mid-Market', value: 30, color: '#60a5fa' },
    { name: 'SMB', value: 25, color: '#c2dbff' },
  ];

  // Lead Table Mock
  const leadData = [
    { id: '1', name: 'John Miller', company: 'Apex Corp', value: 12000, status: 'Qualified' },
    { id: '2', name: 'Sara Connor', company: 'Cyberdyne Systems', value: 45000, status: 'Contacted' },
    { id: '3', name: 'Bruce Wayne', company: 'Wayne Enterprises', value: 150000, status: 'Qualified' },
    { id: '4', name: 'Clark Kent', company: 'Daily Planet', value: 5000, status: 'New' },
    { id: '5', name: 'Peter Parker', company: 'Daily Bugle', value: 2500, status: 'Contacted' },
    { id: '6', name: 'Diana Prince', company: 'Themyscira Museum', value: 85000, status: 'Qualified' },
  ];

  const leadColumns = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Contact Name',
    },
    {
      accessorKey: 'company',
      id: 'company',
      header: 'Company',
    },
    {
      accessorKey: 'value',
      id: 'value',
      header: 'Estimated Value',
      cell: ({ getValue }: any) => `$${getValue().toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const val = getValue();
        const variants: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
          Qualified: 'success',
          Contacted: 'info',
          New: 'neutral',
        };
        return <Badge variant={variants[val] || 'neutral'}>{val}</Badge>;
      },
    },
  ];

  const handleShowToast = () => {
    toast.success(
      'System Loaded Successfully',
      'The white glossy dashboard is fully operational with Zustand states and Framer animations.',
      6000
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Dashboard
            <Badge variant="info" className="normal-case">v1.0.0 Foundation</Badge>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" onClick={handleShowToast} className="flex items-center gap-2 border-slate-200/80 hover:bg-slate-50">
            <Sparkles size={14} className="text-brand-550" />
            Test Toast
          </Button>
          <Button variant="primary">Quick Create</Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} hoverable>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <div className="p-2 bg-slate-50 text-slate-500 rounded-xl border border-slate-100/50 shadow-glossy-sm">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                stat.trend === 'up' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-rose-700 bg-rose-50 border border-rose-100'
              }`}>
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Pipeline Velocity</CardTitle>
            <CardDescription>Estimated dollar volume vs Target thresholds (Q3)</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartWrapper
              data={lineChartData}
              xKey="name"
              series={[
                { key: 'pipeline', name: 'Active Pipeline ($)', color: '#2563eb' },
                { key: 'target', name: 'Target Threshold ($)', color: '#93c5fd' },
              ]}
              height={260}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deal Segmentation</CardTitle>
            <CardDescription>Value distribution across account sizes (%)</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <PieChartWrapper data={pieChartData} height={260} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sales Conversion Funnel</CardTitle>
            <CardDescription>Stage velocity drop-offs (monthly counts)</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartWrapper
              data={barChartData}
              xKey="name"
              series={[{ key: 'value', name: 'Leads Count', color: '#3b82f6' }]}
              height={260}
            />
          </CardContent>
        </Card>

        {/* Lead Grid Table in Charts row */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>High Value Lead Watchlist</CardTitle>
            <CardDescription>Monitor priority client acquisitions and pipeline updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={leadColumns}
              data={leadData}
              searchColumnId="name"
              searchPlaceholder="Search leads by name..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
