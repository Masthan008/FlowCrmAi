import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Zap, DollarSign, Target, Users, ArrowRight,
  Kanban, BarChart3, Lock, Globe2, Layers, Briefcase, CheckCircle2,
  TrendingUp, Award, Star, Compass, Play, ChevronRight, MessageSquare,
  FileText, ArrowUpRight, Cpu, Activity
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

import SplashScreen from '../../components/public/SplashScreen';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'intelligence' | 'leads' | 'tickets'>('pipeline');
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('flowcrm_splash_viewed');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('flowcrm_splash_viewed', 'true');
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans">
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} autoDismissMs={2600} />
      )}

      {/* ─── Top Navbar ────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white font-display">FlowCRM</span>
              <span className="text-[10px] font-extrabold text-indigo-400 block -mt-1 tracking-widest">AI ENTERPRISE</span>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <button onClick={() => navigate('/landing')} className="hover:text-white transition-colors cursor-pointer text-white">
              Overview
            </button>
            <button onClick={() => navigate('/onboarding')} className="hover:text-white transition-colors cursor-pointer">
              Interactive Tour
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
              About Us
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="!text-slate-300 hover:!text-white hover:!bg-slate-800/60"
            >
              Sign In
            </Button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-5 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all"
            >
              Start Free Trial
            </motion.button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* Background Glow Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-[180px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-2xl backdrop-blur-xl"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>FlowCRM AI Enterprise v2.5 Released</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto font-display"
          >
            The Autonomous{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Lead-to-Cash & Customer AI Platform
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            Unify your enterprise sales pipelines, revenue forecasting, support desk, and multi-tenant security into a single, lightning-fast workspace with grounded AI intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-extrabold rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-2.5 px-7 py-4 text-sm font-bold rounded-2xl bg-slate-900 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:text-white shadow-xl backdrop-blur-xl cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" /> Interactive Feature Tour
            </motion.button>
          </motion.div>

          {/* KPI Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { val: '$4.2B+', label: 'Pipeline Volume Managed' },
              { val: '99.99%', label: 'Enterprise Uptime SLA' },
              { val: '15,000+', label: 'Active Business Users' },
              { val: '4.9 / 5', label: 'Customer CSAT Score' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.val}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Interactive Product Preview ───────────────────────── */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">Experience the Enterprise Intelligence</h2>
            <p className="text-sm text-slate-400">Click tabs to preview real-time CRM capabilities.</p>

            <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
              {[
                { id: 'pipeline', label: 'Sales Pipeline', icon: Kanban },
                { id: 'intelligence', label: 'AI Forecasting', icon: Sparkles },
                { id: 'leads', label: 'Lead Scoring', icon: Target },
                { id: 'tickets', label: 'Support Desk', icon: ShieldCheck },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative group rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative">
              {activeTab === 'pipeline' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white">Enterprise Kanban Pipeline</h3>
                      <p className="text-xs text-slate-400">Drag-and-drop opportunity management with probability velocity</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">$1,450,000 Volume</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Qualification ($450k)', 'Proposal Sent ($600k)', 'Negotiation ($400k)'].map((col, i) => (
                      <div key={i} className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-2">
                        <span className="text-[11px] font-bold text-slate-300 block">{col}</span>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-white">Acme Global Cloud</p>
                          <p className="text-[10px] text-slate-400">$180,000 • 85% Win Prob</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'intelligence' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white">Grounded Win Probability Engine</h3>
                      <p className="text-xs text-slate-400">Calculated strictly from engagement, decision speed, and deal age</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-400">Accuracy Score: 94.2%</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Weighted Pipeline</p>
                      <p className="text-xl font-extrabold text-white mt-1">$945,000</p>
                    </div>
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Win Rate</p>
                      <p className="text-xl font-extrabold text-emerald-400 mt-1">68.4%</p>
                    </div>
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Sales Cycle</p>
                      <p className="text-xl font-extrabold text-indigo-400 mt-1">18 Days</p>
                    </div>
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Risk Alerts</p>
                      <p className="text-xl font-extrabold text-amber-400 mt-1">2 Deals</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white">Automated Lead Routing & Scoring</h3>
                      <p className="text-xs text-slate-400">Instant assignment based on territory, deal size, and workload</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Enterprise FinTech Opportunity</p>
                      <p className="text-[10px] text-slate-400">Assigned to Sarah Connor (Sales Exec)</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                      Score: 96 / 100
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white">360° Omnichannel Support Desk</h3>
                      <p className="text-xs text-slate-400">Integrated tickets, live chat, knowledge base, and CSAT</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">SLA Critical Ticket #TK-8891</p>
                      <p className="text-[10px] text-slate-400">Resolved in 8 mins • CSAT 5.0 Rating</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full">
                      SLA Met
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-300">FlowCRM AI Enterprise</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <button onClick={() => navigate('/landing')} className="hover:text-white transition-colors cursor-pointer">Landing</button>
            <button onClick={() => navigate('/onboarding')} className="hover:text-white transition-colors cursor-pointer">Onboarding</button>
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">About Us</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Sign In</button>
          </div>

          <p className="text-[11px] text-slate-500">© 2026 FlowCRM AI Enterprise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
