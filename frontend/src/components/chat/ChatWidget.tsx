import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Star, CheckCircle2, Bot, ShieldCheck, Minimize2 } from 'lucide-react';
import { api } from '../../services/api';

interface WidgetMessage {
  id: string;
  sender: 'bot' | 'visitor';
  text: string;
  time: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([
    { id: '1', sender: 'bot', text: 'Hello! 👋 Welcome to FlowCRM AI Enterprise. How can I help you today?', time: 'Just now' }
  ]);
  const [input, setInput] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [step, setStep] = useState<'welcome' | 'chat'>('welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    try {
      const res = await api.post('/chat/public/start', {
        sessionId: `public-chat-${Date.now()}`,
        visitorName,
        visitorEmail: visitorEmail || null,
        pageUrl: window.location.href,
      }).catch(() => null);

      if (res?.data?.data?.id) {
        setConversationId(res.data.data.id);
      }

      setStep('chat');
      setMessages(prev => [
        ...prev,
        { id: `msg-${Date.now()}`, sender: 'visitor', text: `Hi, I am ${visitorName}.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: `msg-${Date.now() + 1}`, sender: 'bot', text: `Thanks ${visitorName}! An enterprise agent will join shortly. How can we assist your business today?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (err) {
      setStep('chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsgText = input;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, sender: 'visitor', text: userMsgText, time: now }]);
    setInput('');

    if (conversationId) {
      api.post(`/chat/public/${conversationId}/messages`, { content: userMsgText }).catch(() => null);
    }

    // Auto Bot Intelligence Response
    setTimeout(() => {
      let botReply = "Thank you! Our automated Lead-to-Cash engine has recorded your inquiry.";
      const lower = userMsgText.toLowerCase();
      if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost')) {
        botReply = "Our pricing starts at ₹3,999/mo for Starter Growth and ₹8,999/mo for Professional Scale. Would you like to schedule a demo?";
      } else if (lower.includes('demo') || lower.includes('register') || lower.includes('trial')) {
        botReply = "You can instantly provision a free 14-day Enterprise workspace by clicking 'Provision Free Workspace'!";
      } else if (lower.includes('security') || lower.includes('gdpr') || lower.includes('mfa')) {
        botReply = "FlowCRM AI Enterprise features strict multi-tenant boundary isolation, TOTP MFA, and cryptographically signed audit streaming.";
      }

      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, sender: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 900);
  };

  const handleRate = async (stars: number) => {
    setRating(stars);
    if (conversationId) {
      api.patch(`/chat/public/${conversationId}/rate`, { rating: stars }).catch(() => null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-white border border-slate-100 rounded-3xl shadow-glossy-xl flex flex-col justify-between overflow-hidden relative mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight leading-none">FlowCRM Live Concierge</h4>
                  <span className="text-[10px] font-bold text-emerald-100 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online Agent Ready
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            {step === 'welcome' ? (
              <div className="p-6 flex-1 flex flex-col justify-center space-y-5 text-slate-800">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-850">Start Live Chat</h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    Connect with our sales specialists or ask our AI concierge anything about FlowCRM Enterprise.
                  </p>
                </div>

                <form onSubmit={handleStartChat} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:border-brand-550"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Work Email</label>
                    <input
                      type="email"
                      placeholder="rahul@company.com"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:border-brand-550"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!visitorName.trim()}
                    className="w-full py-3 bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-glossy cursor-pointer transition-all"
                  >
                    Start Conversation
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Chat Feed */}
                <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/40">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'visitor' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[82%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                          m.sender === 'visitor'
                            ? 'bg-brand-550 text-white rounded-br-none shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono mt-1">{m.time}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Rating Bar */}
                <div className="px-4 py-1.5 bg-slate-100/70 border-t border-slate-150 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Rate this chat:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(star)}
                        className={`cursor-pointer ${rating && rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-150 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-550"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2.5 bg-brand-550 hover:bg-brand-600 text-white rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Pill */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 rounded-full bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 text-white font-extrabold text-xs shadow-glossy-xl hover:shadow-glossy-2xl cursor-pointer flex items-center gap-2.5 border border-white/20"
      >
        <MessageSquare className="w-4 h-4 fill-white" />
        <span>Live Support Chat</span>
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
      </motion.button>
    </div>
  );
};

export default ChatWidget;
