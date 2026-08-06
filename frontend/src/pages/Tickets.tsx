import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Ticket, Plus, Search, Trash2, Loader2, MessageSquare, Clock, AlertTriangle,
  CheckCircle, ShieldAlert, Zap, Filter, RefreshCw, X, User
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { ticketApi } from '../services/ticketApi';

interface TicketItem {
  id: string;
  title: string;
  subject?: string;
  status: string;
  priority: string;
  category?: string;
  assignedTo?: { firstName?: string; lastName?: string; name?: string };
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

export default function Tickets() {
  const breadcrumbs = [{ label: 'Tickets' }];
  const toast = useToast();

  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ticketApi.list();
      const rawItems = res.data.data?.items || res.data.data || [];
      const mapped = rawItems.map((t: any) => ({
        id: t.id,
        title: t.subject || t.title || 'Support Request',
        status: (t.status || 'Open').toLowerCase(),
        priority: t.priority || 'Medium',
        category: t.category || 'Technical',
        assignedTo: t.assignedTo ? { name: `${t.assignedTo.firstName || ''} ${t.assignedTo.lastName || ''}`.trim() || 'Assigned' } : undefined,
        createdAt: t.createdAt ? t.createdAt.split('T')[0] : '',
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch tickets.');
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
      await ticketApi.create({ title, description, priority, category });
      toast.success('Ticket Created', `"${title}" has been created successfully.`);
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create ticket.');
    }
  };

  const handleDelete = async (id: string, ticketTitle: string) => {
    if (confirm(`Delete ticket "${ticketTitle}"?`)) {
      try {
        await ticketApi.delete(id);
        toast.success('Ticket Deleted', 'Ticket has been removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete ticket.');
      }
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p?.toLowerCase()) {
      case 'critical':
        return <Badge variant="custom" className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5">Critical</Badge>;
      case 'high':
        return <Badge variant="custom" className="bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold px-2 py-0.5">High</Badge>;
      case 'medium':
        return <Badge variant="custom" className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5">Medium</Badge>;
      default:
        return <Badge variant="custom" className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5">Low</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'open':
        return <Badge variant="custom" className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5">Open</Badge>;
      case 'in_progress': case 'in-progress':
        return <Badge variant="custom" className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5">In Progress</Badge>;
      case 'resolved': case 'closed':
        return <Badge variant="custom" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">Resolved</Badge>;
      default:
        return <Badge variant="custom" className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5">{s}</Badge>;
    }
  };

  const filtered = items.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.category?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'critical') return matchesSearch && t.priority.toLowerCase() === 'critical';
    return matchesSearch && t.status === activeTab;
  });

  const openCount = items.filter(i => i.status === 'open').length;
  const criticalCount = items.filter(i => i.priority.toLowerCase() === 'critical').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
            <Ticket className="text-brand-550" size={24} /> Support Operations & Escalations
          </h1>
          <p className="text-sm font-medium text-slate-400">Track client issues, SLA resolutions, priority tickets, and helpdesk cases</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" className="shadow-glossy self-start md:self-auto flex items-center gap-1.5">
          <Plus size={14} />
          <span>New Ticket</span>
        </Button>
      </motion.div>

      {/* Analytics KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Ticket size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Support Tickets</p>
              <p className="text-xl font-black text-slate-800">{openCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Escalations</p>
              <p className="text-xl font-black text-slate-800">{criticalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA Adherence</p>
              <p className="text-xl font-black text-slate-800">99.4%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Resolution Time</p>
              <p className="text-xl font-black text-slate-800">1.8 hrs</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Table Card */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-glossy-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Tickets' },
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'critical', label: 'Critical Priority' },
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
                placeholder="Search ticket subject..."
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

        {/* Tickets Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing support desk tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title={items.length === 0 ? 'No Tickets Registered' : 'No Matching Tickets'}
              description={items.length === 0 ? 'Submit your first support ticket to track resolution progress.' : 'Try resetting search or status filters.'}
              icon={<Ticket className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'New Ticket' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="px-4 py-3">Subject / Issue</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-25/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{t.title}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{t.category}</td>
                    <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                    <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        <span>{t.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{t.createdAt || 'Today'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDelete(t.id, t.title)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                          title="Delete Ticket"
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

      {/* Add Ticket Modal */}
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
                  <Ticket size={16} className="text-brand-550" /> New Support Ticket
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ticket Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Integration API Latency Issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Billing">Billing</option>
                      <option value="General">General</option>
                      <option value="Feature Request">Feature Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the issue or error observed..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!title.trim()} variant="primary" size="sm">
                    Create Ticket
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
