import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, ShieldCheck, Sparkles, Cpu, Layers, DollarSign, CheckCircle2,
  ArrowRight, Users, Trophy, Target, Globe2, ChevronRight, Lock, Zap
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { Footer } from '../../components/public/Footer';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      id: 'ai-engine',
      badge: 'GROUNDED AI INTELLIGENCE',
      title: 'Explainable Grounded AI Engine',
      subtitle: 'Zero hallucinations. Grounded strictly in PostgreSQL data & lead SLA logs.',
      desc: 'FlowCRM AI calculates win probability, lead conversion velocity, and next-best sales actions directly from real touchpoint history and SLA metrics without relying on third-party opaque black boxes.',
      icon: Sparkles,
      metrics: [
        { label: 'Grounded Accuracy', val: '94.8%' },
        { label: 'Audit Trail', val: '100% Signed' },
        { label: 'Latency', val: '< 120ms' },
      ],
    },
    {
      id: 'lead-to-cash',
      badge: 'FINANCIAL AUTOMATION',
      title: 'Autonomous Lead-to-Cash Cycle',
      subtitle: 'From web lead to quote, order, and invoice in seconds.',
      desc: 'Seamlessly transition qualified leads into quotes, auto-create customer orders upon approval, and issue tax-compliant INR/USD invoices with automated payment reconciliation.',
      icon: DollarSign,
      metrics: [
        { label: 'Cycle Speed', val: '10x Faster' },
        { label: 'GST Compliance', val: '18% Auto' },
        { label: 'Order Sync', val: 'Instant' },
      ],
    },
    {
      id: 'security-isolation',
      badge: 'ENTERPRISE SECURITY',
      title: 'Multi-Tenant Scoping & Audit Stream',
      subtitle: 'Organization-level database boundary isolation.',
      desc: 'Built with multi-tenant context binding to guarantee strict data separation between organizations. Features TOTP Authenticator 2FA, session invalidation, and GDPR consent logging.',
      icon: ShieldCheck,
      metrics: [
        { label: 'Data Leaks', val: '0 Incident' },
        { label: 'MFA Security', val: 'TOTP 2FA' },
        { label: 'GDPR Compliance', val: 'Automated' },
      ],
    },
  ];

  const teamMembers = [
    {
      name: 'Masthan Valli',
      role: 'Founder & Principal Systems Architect',
      tag: 'ARCHITECTURE & LEADERSHIP',
      bio: 'Architect of FlowCRM AI Enterprise, specializing in multi-tenant data isolation, grounded machine intelligence, and high-velocity CRM automation.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Elena Rostova',
      role: 'VP of AI & Predictive Intelligence',
      tag: 'MACHINE LEARNING',
      bio: 'Former ML Lead designing explainable win-probability models, lead scoring heuristics, and SLA breach warning systems.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'David K. Vance',
      role: 'Head of Enterprise Infrastructure',
      tag: 'SECURITY & CLOUD',
      bio: 'Specialist in cloud security, PostgreSQL multi-tenant isolation, audit streaming, and zero-downtime microservices.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const stats = [
    { label: 'Active Business Workspaces', val: '12,400+', icon: Building2 },
    { label: 'Lead-to-Cash Transactions', val: '₹480 Cr+', icon: DollarSign },
    { label: 'Grounded AI Accuracy', val: '94.8%', icon: Sparkles },
    { label: 'Service SLA Uptime', val: '99.99%', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-25 text-slate-800 font-sans select-none relative overflow-hidden">
      {/* Background Visual Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-100/30 blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-150">
        <div onClick={() => navigate('/landing')} className="cursor-pointer">
          <Logo size="md" />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/landing')} className="!text-slate-600 hover:!text-slate-850">
            Landing Page
          </Button>
          <Button variant="glass" size="sm" onClick={() => navigate('/login')} className="!bg-brand-550 !text-white hover:!bg-brand-600 shadow-glossy">
            Sign In to CRM
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80 text-xs font-extrabold tracking-widest uppercase shadow-sm">
            <Building2 className="w-3.5 h-3.5" /> REVENUE & CUSTOMER INTELLIGENCE
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-850 tracking-tight leading-tight font-display">
            Architected for the Next Era of Enterprise Commerce
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            FlowCRM AI Enterprise unifies sales pipeline management, autonomous Lead-to-Cash billing, grounded AI analytics, and multi-tenant security into one sleek platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            className="!bg-brand-550 !text-white hover:!bg-brand-600 !px-8 !py-4 font-black text-sm shadow-glossy"
          >
            Provision Free Workspace <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={() => navigate('/checkout')}
            className="!bg-white !text-slate-800 border-slate-200/80 hover:!bg-slate-50 !px-8 !py-4 shadow-sm"
          >
            Calculate Plan Cost
          </Button>
        </motion.div>
      </section>

      {/* Global Statistics Matrix */}
      <section className="py-12 px-6 border-y border-slate-150 bg-white/80 backdrop-blur-xl">
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
                className="p-6 bg-slate-50/70 border border-slate-150 rounded-3xl text-center space-y-2 hover:border-brand-200 transition-all group shadow-glossy-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-850 font-mono tracking-tight">{st.val}</p>
                <p className="text-xs font-bold text-slate-500">{st.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Interactive Core Architecture Pillars */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-extrabold tracking-widest uppercase shadow-sm">
            <Cpu className="w-3.5 h-3.5" /> CORE SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-850 tracking-tight font-display">
            Built for High-Stakes Enterprise Performance
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
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
                    ? 'bg-brand-550 text-white shadow-glossy scale-105'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-850'
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
            className="bg-white/90 border border-slate-100 rounded-3xl p-8 sm:p-12 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-glossy-lg relative overflow-hidden"
          >
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="px-3.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-black uppercase tracking-wider">
                {pillars[activePillar].badge}
              </span>
              <div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-850">{pillars[activePillar].title}</h3>
                <p className="text-xs text-brand-600 font-bold mt-1">{pillars[activePillar].subtitle}</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {pillars[activePillar].desc}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-150">
                {pillars[activePillar].metrics.map((m, i) => (
                  <div key={i} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-150 text-center">
                    <p className="text-xs text-slate-500 font-medium">{m.label}</p>
                    <p className="text-lg font-black text-emerald-600 font-mono mt-1">{m.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full h-64 sm:h-72 rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-inner flex flex-col justify-between relative overflow-hidden text-left">
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
      <section className="py-24 px-6 bg-white/80 border-t border-slate-150">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-extrabold tracking-widest uppercase shadow-sm">
              <Users className="w-3.5 h-3.5" /> LEADERSHIP & ENGINEERING
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-850 tracking-tight font-display">
              Meet the Architects
            </h2>
            <p className="text-sm text-slate-600">
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
                className="bg-slate-50/70 border border-slate-150 rounded-3xl p-6 backdrop-blur-xl hover:border-brand-300 transition-all space-y-4 group shadow-glossy-sm text-left"
              >
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-brand-700 border border-slate-200 text-[10px] font-bold">
                    {member.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-850">{member.name}</h3>
                  <p className="text-xs font-bold text-brand-600">{member.role}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact CTA Banner */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 border border-brand-400 rounded-3xl p-10 sm:p-16 backdrop-blur-2xl text-center space-y-6 relative z-10 shadow-glossy-xl">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Supercharge Your Enterprise Sales & Support?
          </h2>
          <p className="text-sm sm:text-base text-slate-100 max-w-2xl mx-auto">
            Experience database-backed grounded AI, Lead-to-Cash automation, and multi-tenant security isolation today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="!bg-white !text-slate-900 hover:!bg-slate-100 !px-8 !py-4 font-black text-sm shadow-xl"
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
