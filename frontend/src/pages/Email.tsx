import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Mail, Plus, Search, Trash2, Loader2, Send, RefreshCw, Star, MessageSquare, Inbox, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { emailApi } from '../services/emailApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
}

export default function Email() {
  const breadcrumbs = [{ label: 'Omnichannel Hub' }, { label: 'Enterprise Email Inbox' }];
  const toast = useToast();

  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await emailApi.listMessages();
      const raw = res.data.data?.items || res.data.data || [];
      const mapped = raw.map((m: any) => ({
        id: m.id,
        subject: m.subject || 'Client Touchpoint Update',
        from: m.from || m.sender || 'client@enterprise.com',
        isRead: m.isRead ?? true,
        isStarred: m.isStarred ?? false,
        createdAt: m.createdAt ? m.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      setMessages(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch emails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await emailApi.sync();
      toast.success('Sync Complete', 'Email inbox synchronized.');
      loadData();
    } catch (err) {
      toast.error('Sync Failed', 'Failed to sync emails.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) return;
    try {
      await emailApi.send({ to, subject, body });
      toast.success('Email Sent! 🚀', `Message sent to ${to}.`);
      setShowSendModal(false);
      setTo('');
      setSubject('');
      setBody('');
      loadData();
    } catch (err: any) {
      toast.error('Send Failed', err.response?.data?.message || 'Failed to send email.');
    }
  };

  const handleDelete = async (id: string, msgSubject: string) => {
    if (confirm(`Delete email "${msgSubject}"?`)) {
      try {
        await emailApi.deleteAccount(id);
        toast.success('Email Deleted', 'Message removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete email.');
      }
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await emailApi.markRead(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStar = async (id: string) => {
    try {
      await emailApi.toggleStar(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = messages.filter(m =>
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.from?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = (messages || []).filter(m => !m.isRead).length;
  const starredCount = (messages || []).filter(m => m.isStarred).length;

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
            Omnichannel Email Inbox & Mail Sync
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Unified inbox for customer communications, lead inquiries, and sales sequences.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="text-xs font-bold py-3 px-4 rounded-2xl border-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Mail'}</span>
          </Button>
          <Button
            onClick={() => setShowSendModal(true)}
            className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
          >
            <Send size={16} />
            <span>Compose Email</span>
          </Button>
        </div>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Mail Messages</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{messages.length}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Synced Inbox</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Synced email conversations</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Unread Inquiries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{unreadCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Attention Required</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Pending response</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Starred Threads</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">{starredCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">Priority Deals</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Flagged lead emails</p>
        </SpotlightCard>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-black text-slate-850">Inbox Messages</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sender or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Mail Server...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={messages.length === 0 ? 'Inbox Empty' : 'No Matching Messages'}
              description={messages.length === 0 ? 'Your email inbox is up to date.' : 'Try adjusting your search parameters.'}
              icon={<Inbox className="w-12 h-12 text-slate-300" />}
              actionLabel={messages.length === 0 ? 'Compose First Email' : undefined}
              onAction={() => setShowSendModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Star</th>
                  <th className="px-5 py-3.5">Sender</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Received Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((m) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggleStar(m.id)} className="text-amber-400 hover:text-amber-500 cursor-pointer">
                        <Star className={`w-4 h-4 ${m.isStarred ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-850">{m.from}</td>
                    <td className="px-5 py-4 text-slate-700 font-semibold">{m.subject}</td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{m.createdAt}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(m.id, m.subject)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Compose Email</h3>
            <form onSubmit={handleSend} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">To Address *</label>
                <input type="email" required placeholder="client@company.com" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Subject *</label>
                <input type="text" required placeholder="Enterprise Proposal Follow-up" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Body Message</label>
                <textarea rows={4} placeholder="Type message body..." value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:border-brand-550" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowSendModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!to.trim() || !subject.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Send Email</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
