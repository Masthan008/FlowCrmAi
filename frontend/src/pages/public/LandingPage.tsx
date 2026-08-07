import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Zap, DollarSign, Target, Users, ArrowRight,
  Kanban, BarChart3, Lock, Globe2, Layers, Briefcase, CheckCircle2,
  TrendingUp, Award, Star, Compass, Play, ChevronRight, MessageSquare,
  FileText, ArrowUpRight, Cpu, Activity, Smartphone, Check, HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

import SplashScreen from '../../components/public/SplashScreen';
import PhoneMockupBasic from '../../components/ui/phone-mockups-1';
import PricingCalculator from '../../components/public/PricingCalculator';
import Footer from '../../components/public/Footer';
import ChatWidget from '../../components/chat/ChatWidget';

import { Logo } from '../../components/ui/Logo';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'intelligence' | 'omnichannel' | 'security'>('pipeline');
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('flowcrm_splash_viewed');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('flowcrm_splash_viewed', 'true');
    setShowSplash(false);
    navigate('/onboarding');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-550 selection:text-white overflow-x-hidden font-sans select-none">
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} autoDismissMs={2600} />
      )}

      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/landing')}
            className="cursor-pointer group"
          >
            <Logo size="md" />
          </motion.div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <button onClick={() => navigate('/landing')} className="hover:text-white transition-colors cursor-pointer text-white font-extrabold">
              Overview
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer font-extrabold">
              Core Capabilities
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer font-extrabold">
              INR Pricing Calculator
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer font-extrabold">
              About Us
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="!text-slate-300 hover:!text-white hover:!bg-slate-800/60 font-bold"
            >
              Sign In
            </Button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 text-white shadow-glossy hover:shadow-glossy-lg cursor-pointer transition-all border border-white/20"
            >
              Provision Free Workspace
            </motion.button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* Background Glow Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-brand-550/20 via-teal-600/20 to-purple-600/10 rounded-full blur-[180px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-brand-500/30 text-brand-300 text-xs font-bold shadow-2xl backdrop-blur-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>FlowCRM AI Enterprise — Reconciled Lead-to-Cash Ready</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto font-display"
          >
            The Autonomous{' '}
            <span className="bg-gradient-to-r from-brand-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Lead-to-Cash & Customer AI Engine
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium"
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
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-extrabold rounded-2xl bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 text-white shadow-glossy-xl hover:shadow-glossy-2xl cursor-pointer transition-all border border-white/20"
            >
              <span>Provision Free Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('features')}
              className="inline-flex items-center gap-2.5 px-7 py-4 text-xs font-extrabold rounded-2xl bg-slate-900 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:text-white shadow-xl backdrop-blur-xl cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 text-brand-400 fill-brand-400" /> Explore Capabilities
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
              { val: '₹420Cr+', label: 'Pipeline Managed' },
              { val: '99.8%', label: 'Support SLA Met' },
              { val: '100%', label: 'Tax Reconciled' },
              { val: '0.00ms', label: 'Cross-Tenant Leak' },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.val}</span>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Interactive Feature Capabilities Section ───────────────── */}
      <section id="features" className="py-24 px-6 relative bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-extrabold uppercase tracking-wider">
              ENTERPRISE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              Autonomous Growth Engine for Modern Teams
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-medium">
              Click through core modules to preview real-time pipeline automation, deal win scores, and security controls.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'pipeline', label: 'Lead-to-Cash Engine', icon: DollarSign },
              { id: 'intelligence', label: 'Grounded AI Win Score', icon: Sparkles },
              { id: 'omnichannel', label: 'Support Desk & Chat', icon: Users },
              { id: 'security', label: 'Multi-Tenant Shield', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-550 to-teal-600 text-white shadow-glossy-lg border border-white/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Preview Display */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {activeTab === 'pipeline' && (
                <motion.div
                  key="pipeline"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-4 text-left">
                    <h3 className="text-2xl font-black text-white">Full Lifecycle Revenue Reconciliation</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Automate lead qualification, quote generation, customer order processing, GST tax invoices, and instant subscription payment reconciliation in INR.
                    </p>
                    <div className="space-y-2 pt-2">
                      {['Automatic lead scoring & SLA breach warnings', 'One-click quote conversion into official customer orders', 'Automated GST tax invoice generation & payment status syncing'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800">
                      <span>Pipeline Event</span>
                      <span>Status</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Lead Qualified: Acme Tech</span>
                      <span className="font-bold">₹1,20,000</span>
                    </div>
                    <div className="flex justify-between text-brand-300">
                      <span>Quote Approved: Enterprise Scope</span>
                      <span className="font-bold">Issued</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>GST Tax Invoice Reconciled</span>
                      <span className="font-bold">Paid (INR)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'intelligence' && (
                <motion.div
                  key="intelligence"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-4 text-left">
                    <h3 className="text-2xl font-black text-white">Grounded AI Opportunity Win Predictions</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Machine intelligence grounded strictly in historical deal velocity, touchpoint frequency, and sales rep activity logs. No black-box guesswork.
                    </p>
                    <div className="space-y-2 pt-2">
                      {['Explainable win-probability score with key factor drivers', 'AI next-best-action recommendations for sales reps', 'Stalled opportunity risk flags & quiet lead detection'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between text-xs text-white font-extrabold">
                      <span>AI Win Probability</span>
                      <span className="text-emerald-400 font-mono">94 / 100 (HIGH WIN SCORE)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-brand-550 to-emerald-500 rounded-full w-[94%]" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono">Decision velocity +38% faster than baseline</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'omnichannel' && (
                <motion.div
                  key="omnichannel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-4 text-left">
                    <h3 className="text-2xl font-black text-white">360° Omnichannel Support Desk & Live Chat</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Unify customer support tickets, live concierge chat, web forms, customer portal logins, and NPS satisfaction surveys into one agent workspace.
                    </p>
                    <div className="space-y-2 pt-2">
                      {['Support SLA response velocity tracking (< 38s)', 'Embedded visitor live chat concierge with public API', 'Automated CSAT / NPS survey distribution'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Support SLA Met</span>
                      <span className="text-emerald-400 font-bold">99.8% Adherence</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Average CSAT Score</span>
                      <span className="text-amber-400 font-bold">5.0 / 5.0 ⭐</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-4 text-left">
                    <h3 className="text-2xl font-black text-white">Multi-Tenant Isolation & Security Shield</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Strict organization-scoped database boundary controls, TOTP 2FA authenticator verification, and tamper-evident audit log streaming.
                    </p>
                    <div className="space-y-2 pt-2">
                      {['Automatic Tenant Context Middleware on every backend request', 'TOTP Authenticator MFA & encrypted recovery keys', 'Tamper-evident audit log streaming for compliance'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-emerald-400">
                      <span>Tenant Boundary</span>
                      <span className="font-bold">0 Cross-Tenant Leak</span>
                    </div>
                    <div className="flex justify-between text-brand-300">
                      <span>Authentication</span>
                      <span className="font-bold">TOTP MFA Active</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── Mobile Interactive Mockup Section ────────────────────── */}
      <section className="py-24 px-6 relative bg-slate-950">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
              MOBILE & WEB SYNCHRONIZATION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              FlowCRM Mobile Companion
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
              Access deals, review quotes, approve invoices, and chat with clients directly from your iOS and Android devices.
            </p>
          </div>

          <PhoneMockupBasic />
        </div>
      </section>

      {/* ─── Real Feature INR Pricing Section ───────────────────── */}
      <section id="pricing" className="py-24 px-6 relative bg-slate-950/80 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Interactive Pricing Calculator */}
          <PricingCalculator />
        </div>
      </section>

      {/* ─── Multi-Column Enterprise Footer ───────────────────── */}
      <Footer />

      {/* Floating Live Chat Concierge Widget */}
      <ChatWidget />
    </div>
  );
};

export default LandingPage;
