import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { MessageSquare, Plus, Search, Loader2, ArrowRight, User, Clock } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { chatApi } from '../services/chatApi';

interface Conversation {
  id: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  messageCount: number;
  status: 'active' | 'pending' | 'closed';
  lastMessageAt: string;
  createdAt: string;
}

export const Chat: React.FC = () => {
  const breadcrumbs = [{ label: 'Live Chat' }];
  const toast = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [subject, setSubject] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getConversations();
      const items = res.data.data?.items || [];
      const mapped = items.map((c: any) => ({
        id: c.id,
        contactName: c.visitorName || 'Unknown',
        contactEmail: c.visitorEmail || '-',
        subject: c.sessionId || 'Live Chat',
        messageCount: c.messageCount || 0,
        status: (c.status || 'active').toLowerCase(),
        lastMessageAt: c.lastMessageAt ? c.lastMessageAt.split('T')[0] : '-',
        createdAt: c.createdAt ? c.createdAt.split('T')[0] : '',
      }));
      setConversations(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch chat conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !subject.trim()) return;
    try {
      await chatApi.createConversation({
        sessionId: `chat-${Date.now()}`,
        visitorName: contactName,
        visitorEmail: contactEmail || null,
        pageUrl: window.location.href,
      });
      toast.success('Conversation Created', 'New chat conversation started.');
      setShowNewModal(false);
      setContactName('');
      setContactEmail('');
      setSubject('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create conversation.');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      closed: 'bg-slate-50 text-slate-500 border-slate-200',
    };
    return map[status] || map.pending;
  };

  const filtered = conversations.filter(c =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Live Chat</h1>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Conversation</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading conversations...</p>
          </div>
        ) : (
          <>
            {conversations.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={conversations.length === 0 ? 'No Conversations' : 'No Matches Found'}
                  description={conversations.length === 0 ? 'Start a live chat conversation with your customers.' : 'Adjust your search query.'}
                  icon={<MessageSquare className="w-12 h-12 text-slate-300" />}
                  actionLabel={conversations.length === 0 ? 'New Conversation' : undefined}
                  onAction={() => setShowNewModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Contact</th>
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-4 py-2.5">Messages</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Last Activity</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                              <User size={12} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{c.contactName}</div>
                              <div className="text-[10px] text-slate-400">{c.contactEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">{c.subject}</td>
                        <td className="px-4 py-3 text-slate-500">{c.messageCount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${statusBadge(c.status)}`}>
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock size={11} />
                            <span>{c.lastMessageAt}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1 hover:bg-sky-50 hover:text-sky-600 rounded-lg text-slate-400">
                            <ArrowRight size={13} />
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

      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Conversation</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Start a live chat session with a contact.</p>
            <form onSubmit={handleCreate} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Name *</label>
                <input type="text" required placeholder="Jane Smith" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Email</label>
                <input type="email" placeholder="jane@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subject *</label>
                <input type="text" required placeholder="Support inquiry" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!contactName.trim() || !subject.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Start Chat</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
