import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Zap, Globe2, Layers, Briefcase, Award, CheckCircle2,
  Cpu, Lock, Activity, Users, ArrowRight, ChevronRight, Server, Terminal,
  Database, Flame, Heart, Shield, RefreshCw
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import Footer from '../../components/public/Footer';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      id: 'grounded-ai',
      title: 'Grounded AI Intelligence',
      subtitle: 'Deterministic Probability Calculation Engine',
      icon: Cpu,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      badge: 'Zero Hallucinations',
      desc: 'FlowCRM AI Enterprise replaces static placeholders with dynamic machine calculation models strictly evaluated from actual stage velocity, touchpoint frequency, deal age, and historical win rates.',
      metrics: [
        { label: 'Forecast Accuracy', val: '94.8%' },
        { label: 'Calculation Latency', val: '<12ms' },
        { label: 'Data Grounding', val: '100% Real DB' },
      ],
    },
    {
      id: 'multi-tenant',
      title: 'Multi-Tenant Security Scoping',
      subtitle: 'Cryptographic Boundary Enforcement',
      icon: ShieldCheck,
      gradient: 'from-emerald-500 via-teal-500 to-indigo-500',
      badge: 'Enterprise Isolation',
      desc: 'Organization-scoped context middleware ensures multi-tenant database isolation, TOTP MFA authenticator enforcement, RBAC permissions, and tamper-evident audit logging.',
      metrics: [
        { label: 'Tenant Isolation', val: 'Row-Level' },
        { label: 'MFA Support', val: 'TOTP 2FA' },
        { label: 'Audit Compliance', val: 'SOC2 Ready' },
      ],
    },
    {
      id: 'lead-to-cash',
      title: 'Lead-to-Cash Automation',
      subtitle: 'Quote → Order → Invoice → Payment Reconciliation',
      icon: Zap,
      gradient: 'from-pink-500 via-rose-500 to-amber-500',
      badge: 'End-to-End Workflow',
      desc: 'Zero manual data entry. Quote approvals auto-trigger Order creation, Order creation auto-issues Invoices, and payments automatically reconcile invoice status.',
      metrics: [
        { label: 'Workflow Triggers', val: 'Automated' },
        { label: 'Manual Errors', val: '0%' },
        { label: 'Time Saved', val: '18 hrs/wk' },
      ],
    },
  ];

  const teamMembers = [
    {
      name: 'Masthan Valli',
      role: 'Founder & Principal Architect',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Pioneering autonomous CRM systems and grounded machine intelligence architectures.',
      tag: 'Enterprise Core',
    },
    {
      name: 'Sarah Connor',
      role: 'Head of Sales Engineering',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'Scaling global revenue workflows and Lead-to-Cash automation across 50+ enterprise teams.',
      tag: 'Revenue Operations',
    },
    {
      name: 'Alex Mercer',
      role: 'VP of Product & Security',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Overseeing multi-tenant security scoping, GDPR erasure protocols, and TOTP 2FA.',
      tag: 'Security & Trust',
    },
  ];

  const stats = [
    { label: 'Real-Time CRM Records', val: '10M+', icon: Database },
    { label: 'Lead-to-Cash Velocity', val: '4.8x', icon: Flame },
    { label: 'Uptime SLA Guarantee', val: '99.99%', icon: Server },
    { label: 'AI Accuracy Score', val: '94.8%', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div onClick={() => navigate('/landing')} className="cursor-pointer group">
            <Logo size="md" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <button onClick={() => navigate('/landing')} className="hover:text-white transition-colors cursor-pointer">
              Overview
            </button>
            <button onClick={() => navigate('/onboarding')} className="hover:text-white transition-colors cursor-pointer">
              Interactive Tour
            </button>
            <button onClick={() => navigate('/checkout')} className="hover:text-white transition-colors cursor-pointer">
              Pricing Calculator
            </button>
            <button onClick={() => navigate('/about')} className="text-white font-extrabold cursor-pointer">
              About Us
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="!text-slate-300 hover:!text-white">
              Sign In
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigate('/register')}
              className="!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white border-none shadow-lg shadow-indigo-500/30 hover:opacity-90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/20 to-transparent blur-[160px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-extrabold tracking-widest uppercase shadow-md"
          >
            <Globe2 className="w-4 h-4 text-indigo-400" /> REINVENTING ENTERPRISE CRM
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-7xl font-black tracking-tight leading-tight font-display"
          >
            Engineered for Real Velocity.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Grounded in Machine Intelligence.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed"
          >
            FlowCRM AI Enterprise bridges the gap between traditional static database software and non-deterministic AI wrappers. Built on clean multi-tenant PostgreSQL architecture, grounded win probabilities, and Lead-to-Cash execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="!bg-gradient-to-r !from-indigo-500 !via-purple-500 !to-pink-500 !px-8 !py-4 shadow-xl shadow-indigo-500/30"
            >
              Take Interactive Product Tour <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="!bg-slate-900 !text-white border-slate-700 hover:!bg-slate-800 !px-8 !py-4"
            >
              Calculate Plan Cost
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Global Statistics Matrix */}
      <section className="py-12 px-6 border-y border-slate-900 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((st, i) => {
            const Icon = st.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-2 hover:border-slate-700 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{st.val}</p>
                <p className="text-xs font-bold text-slate-400">{st.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Interactive Core Architecture Pillars */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-extrabold tracking-widest uppercase">
            <Cpu className="w-3.5 h-3.5" /> CORE SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            Built for High-Stakes Enterprise Performance
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Click through our architectural pillars below to inspect how FlowCRM AI Enterprise guarantees reliability.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center gap-3 flex-wrap">
          {pillars.map((pil, idx) => {
            const Icon = pil.icon;
            const active = activePillar === idx;
            return (
              <button
                key={pil.id}
                onClick={() => setActivePillar(idx)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{pil.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Card Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl relative overflow-hidden"
          >
            <div className="lg:col-span-7 space-y-6">
              <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
                {pillars[activePillar].badge}
              </span>
              <div>
                <h3 className="text-2xl sm:text-4xl font-black text-white">{pillars[activePillar].title}</h3>
                <p className="text-xs text-indigo-400 font-bold mt-1">{pillars[activePillar].subtitle}</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {pillars[activePillar].desc}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                {pillars[activePillar].metrics.map((m, i) => (
                  <div key={i} className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-400 font-medium">{m.label}</p>
                    <p className="text-lg font-black text-emerald-400 font-mono mt-1">{m.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full h-64 sm:h-72 rounded-3xl bg-slate-950 p-6 border border-slate-800 shadow-inner flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">core.service.ts</span>
                </div>
                <div className="space-y-2 font-mono text-xs text-indigo-300 pt-2">
                  <p><span className="text-slate-500">1</span> const winScore = await calcGroundedProb(deal);</p>
                  <p><span className="text-slate-500">2</span> const order = await autoCreateOrder(quote);</p>
                  <p><span className="text-slate-500">3</span> await issueInvoice(order);</p>
                  <p className="text-emerald-400 pt-2"><span className="text-slate-500">4</span> // Status: 100% Verified & Reconciled</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified</span>
                  <span className="font-mono text-indigo-400">0.002s</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Leadership & Engineering Grid */}
      <section className="py-24 px-6 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-extrabold tracking-widest uppercase">
              <Users className="w-3.5 h-3.5" /> LEADERSHIP & ENGINEERING
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              Meet the Architects
            </h2>
            <p className="text-sm text-slate-400">
              Passionate systems engineers building high-velocity software for modern revenue teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-all space-y-4 group"
              >
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-indigo-300 border border-slate-700 text-[10px] font-bold">
                    {member.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{member.name}</h3>
                  <p className="text-xs font-bold text-indigo-400">{member.role}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact CTA Banner */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-pink-900/60 border border-indigo-500/40 rounded-3xl p-10 sm:p-16 backdrop-blur-2xl text-center space-y-6 relative z-10 shadow-2xl shadow-indigo-500/20">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Supercharge Your Enterprise Sales & Support?
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto">
            Experience database-backed grounded AI, Lead-to-Cash automation, and multi-tenant security isolation today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="!bg-white !text-slate-950 hover:!bg-slate-100 !px-8 !py-4 font-black text-sm shadow-xl"
            >
              Calculate Your Plan & Start Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Multi-Column Enterprise Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
