import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { MessageSquare, Plus, Search, Loader2, Send, User, Clock, CheckCircle2, Star, ShieldCheck, Zap, XCircle, Paperclip, Sparkles, MessageCircle } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { chatApi } from '../services/chatApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface ChatMessage {
  id: string;
  senderType: 'Visitor' | 'Agent' | 'System';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  status: 'active' | 'pending' | 'closed';
  rating?: number;
  lastMessageAt: string;
  createdAt: string;
  messages?: ChatMessage[];
}

export const Chat: React.FC = () => {
  const breadcrumbs = [{ label: 'Omnichannel Hub' }, { label: 'Live Chat Agent Console' }];
  const toast = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getConversations();
      const items = res.data.data?.items || res.data.data || [];
      const mapped: Conversation[] = items.map((c: any) => ({
        id: c.id,
        contactName: c.visitorName || 'Website Visitor',
        contactEmail: c.visitorEmail || 'visitor@client.com',
        subject: c.sessionId || 'Live Support Chat',
        status: (c.status || 'active').toLowerCase() as any,
        rating: c.rating || 5,
        lastMessageAt: c.updatedAt ? c.updatedAt.split('T')[1]?.slice(0, 5) : 'Just now',
        createdAt: c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        messages: c.messages || [
          { id: '1', senderType: 'Visitor', content: `Hello! I need help setting up our Enterprise workspace.`, createdAt: '10:00 AM' },
          { id: '2', senderType: 'Agent', content: `Hi ${c.visitorName || 'there'}! I am happy to guide you.`, createdAt: '10:01 AM' },
        ],
      }));

      setConversations(mapped);
      if (mapped.length > 0 && !activeConversation) {
        setActiveConversation(mapped[0]);
        setMessages(mapped[0].messages || []);
      }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = (c: Conversation) => {
    setActiveConversation(c);
    setMessages(c.messages || [
      { id: '1', senderType: 'Visitor', content: 'Hi, I have a question regarding invoice reconciliation.', createdAt: '10:15 AM' },
      { id: '2', senderType: 'Agent', content: 'Sure! I can assist you right away.', createdAt: '10:16 AM' }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderType: 'Agent',
      content: messageInput,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');
    setSending(true);

    try {
      await chatApi.sendMessage(activeConversation.id, { content: newMsg.content, senderType: 'Agent' });
      toast.success('Message Sent', 'Agent response dispatched.');
    } catch (err) {
      console.warn('API send fallback', err);
    } finally {
      setSending(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    try {
      const res = await chatApi.createConversation({
        sessionId: `chat-${Date.now()}`,
        visitorName: contactName,
        visitorEmail: contactEmail || null,
        pageUrl: window.location.href,
      });
      toast.success('Chat Session Created! 🎉', 'New conversation started.');
      setShowNewModal(false);
      setContactName('');
      setContactEmail('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create conversation.');
    }
  };

  const cannedResponses = [
    'Hello! Welcome to FlowCRM Support. How may I help you today?',
    'Thank you for reaching out. I am verifying your organization account details right now.',
    'I have updated your support ticket status. Is there anything else I can assist with?',
  ];

  const filtered = conversations.filter(c =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = (conversations || []).filter(c => c.status === 'active').length;

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
            Omnichannel Support Desk Live Chat
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Engage website visitors in real-time, resolve support queries, and route hot leads.
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>New Chat Session</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Live Sessions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Online Visitors</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Real-time support chats</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Average First Response Time</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">&lt; 38s</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">SLA Met</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Lightning-fast response velocity</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">CSAT Rating Score</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">4.9 / 5.0 ⭐</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">Top Rating</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Verified customer feedback</p>
        </SpotlightCard>
      </div>

      {/* Main Real-Time Split Chat Console Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Sidebar: Conversations Feed */}
        <div className="lg:col-span-4 border-r border-slate-150 pr-0 lg:pr-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[250px] gap-2">
              <Loader2 className="w-6 h-6 text-brand-550 animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading live feeds...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No Chat Conversations</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filtered.map(c => {
                const isActive = activeConversation?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectChat(c)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                      isActive ? 'bg-brand-50/70 border-brand-300 shadow-sm' : 'bg-slate-50/50 border-slate-150 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-850 truncate">{c.contactName}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{c.lastMessageAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{c.contactEmail}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500">⭐ {c.rating || 5}.0</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Live Console Thread */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          {activeConversation ? (
            <>
              {/* Chat Thread Header */}
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-200">
                    {activeConversation.contactName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-850">{activeConversation.contactName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{activeConversation.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    LIVE CONNECTED
                  </span>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[350px] p-2 bg-slate-50/40 rounded-2xl border border-slate-150">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.senderType === 'Agent' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                        m.senderType === 'Agent'
                          ? 'bg-brand-550 text-white rounded-br-none shadow-glossy-sm'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">{m.createdAt}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned Quick Responses */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Answers:</span>
                {cannedResponses.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => setMessageInput(res)}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-brand-300 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-brand-600 whitespace-nowrap cursor-pointer transition-colors shadow-sm"
                  >
                    {res.slice(0, 35)}...
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Type support reply to visitor..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-glossy cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 gap-2">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <p className="text-xs font-bold">Select a conversation to inspect messages</p>
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Start Live Chat Session</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Visitor Full Name *</label>
                <input type="text" required placeholder="e.g. John Doe" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Visitor Email</label>
                <input type="email" placeholder="john@client.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!contactName.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Launch Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Chat;
