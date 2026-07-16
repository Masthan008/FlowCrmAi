import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Ticket, Plus, Search, Trash2, Loader2, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { ticketApi } from '../services/ticketApi';

interface TicketItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: { name: string };
  createdAt: string;
}

export default function Tickets() {
  const breadcrumbs = [{ label: 'Tickets' }];
  const toast = useToast();

  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ticketApi.list();
      setItems(res.data.data?.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await ticketApi.create({ title, description, priority });
      toast.success('Ticket Created', `"${title}" has been created.`);
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

  const getPriorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case 'critical': case 'high': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low': return 'bg-sky-50 text-sky-700 border-sky-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'in_progress': case 'in-progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'resolved': case 'closed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filtered = items.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Tickets</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
          <Plus size={14} />
          <span>New Ticket</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading tickets...</p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={items.length === 0 ? 'No Tickets' : 'No Matches Found'}
                  description={items.length === 0 ? 'Create your first support ticket.' : 'Adjust search parameters.'}
                  icon={<Ticket className="w-12 h-12 text-slate-300" />}
                  actionLabel={items.length === 0 ? 'New Ticket' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Priority</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Assigned To</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{t.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStatusColor(t.status)}`}>{t.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{t.assignedTo?.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{t.createdAt?.split('T')[0]}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(t.id, t.title)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Delete"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Ticket</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Create a support ticket.</p>
            <form onSubmit={handleCreate} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Title *</label>
                <input type="text" required placeholder="e.g. Login issue" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <textarea placeholder="Describe the issue..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!title.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
