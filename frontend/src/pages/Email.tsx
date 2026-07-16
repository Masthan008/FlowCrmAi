import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Mail, Plus, Search, Trash2, Loader2, Send, RefreshCw, Star, MessageSquare } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { emailApi } from '../services/emailApi';

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
}

export default function Email() {
  const breadcrumbs = [{ label: 'Email' }];
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
      setMessages(res.data.data?.items || []);
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
      toast.success('Sync Complete', 'Email inbox synced.');
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
      toast.success('Email Sent', `Message sent to ${to}.`);
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
        toast.success('Email Deleted', 'Message has been removed.');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Email Inbox</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync'}</span>
          </Button>
          <Button onClick={() => setShowSendModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy">
            <Send size={14} />
            <span>Compose</span>
          </Button>
        </div>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading inbox...</p>
          </div>
        ) : (
          <>
            {messages.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search emails..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={messages.length === 0 ? 'Inbox Empty' : 'No Matches Found'}
                  description={messages.length === 0 ? 'Sync your email accounts to see messages here.' : 'Adjust search parameters.'}
                  icon={<Mail className="w-12 h-12 text-slate-300" />}
                  actionLabel={messages.length === 0 ? 'Sync Now' : undefined}
                  onAction={handleSync}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5 w-8"></th>
                      <th className="px-4 py-2.5">From</th>
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-4 py-2.5">Received</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((m) => (
                      <tr key={m.id} className={`hover:bg-slate-50/30 cursor-pointer ${!m.isRead ? 'font-bold' : ''}`} onClick={() => handleMarkRead(m.id)}>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStar(m.id); }}
                            className={`p-1 rounded-lg ${m.isStarred ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
                            title={m.isStarred ? 'Unstar' : 'Star'}
                          >
                            <Star size={13} fill={m.isStarred ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{m.from}</td>
                        <td className={`px-4 py-3 text-slate-800 dark:text-slate-200 ${!m.isRead ? 'font-bold' : ''}`}>{m.subject || '(No Subject)'}</td>
                        <td className="px-4 py-3 text-slate-500">{m.createdAt?.split('T')[0]}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(m.id, m.subject); }}
                            className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {showSendModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Compose Email</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Send a new email message.</p>
            <form onSubmit={handleSend} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">To *</label>
                <input type="email" required placeholder="recipient@example.com" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subject *</label>
                <input type="text" required placeholder="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Body</label>
                <textarea placeholder="Write your message..." value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 resize-none" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowSendModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!to.trim() || !subject.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Send Email</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
