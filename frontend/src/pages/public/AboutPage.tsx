import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Zap, DollarSign, Target, Users, ArrowRight,
  Globe2, Layers, Briefcase, Award, CheckCircle2, Cpu, Lock, Activity,
  CalendarDays, Heart, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
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
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <button onClick={() => navigate('/landing')} className="hover:text-white transition-colors cursor-pointer">
              Overview
            </button>
            <button onClick={() => navigate('/onboarding')} className="hover:text-white transition-colors cursor-pointer">
              Interactive Tour
            </button>
            <button onClick={() => navigate('/about')} className="text-white font-extrabold cursor-pointer">
              About Us
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="!text-slate-300 hover:!text-white">
              Sign In
            </Button>
            <Button variant="glass" size="sm" onClick={() => navigate('/register')} className="!bg-indigo-600 !text-white border-indigo-500 hover:!bg-indigo-500">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-extrabold tracking-widest uppercase">
            <Globe2 className="w-3.5 h-3.5" /> OUR MISSION & ARCHITECTURE
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Building the World's Most Reliable{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Autonomous CRM
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            FlowCRM AI Enterprise was engineered to bridge the gap between static traditional database tools and non-deterministic AI wrappers. We build deterministic, multi-tenant software with grounded machine intelligence.
          </p>
        </div>
      </section>

      {/* Tech Pillars Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-12">Core Technological Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Cpu,
              title: 'Grounded Explainable AI',
              desc: 'No fake static numbers or hallucinated suggestions. All predictions are calculated from real historical velocity, touchpoint frequency, and pipeline data.',
              color: 'from-indigo-500 to-violet-600',
            },
            {
              icon: ShieldCheck,
              title: 'Multi-Tenant Security',
              desc: 'Built with organization-scoped context middleware, TOTP authenticator MFA, and cryptographically verifiable audit logging.',
              color: 'from-purple-500 to-pink-600',
            },
            {
              icon: Zap,
              title: 'Zero-Latency UX',
              desc: 'Powered by React, Vite, Framer Motion, and Tailwind CSS for instant transitions, glassmorphic UI, and responsive mobile control.',
              color: 'from-pink-500 to-rose-600',
            },
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl hover:border-slate-700 transition-all space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pillar.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-indigo-500/30 rounded-3xl p-10 sm:p-14 backdrop-blur-2xl relative z-10 space-y-6">
          <h2 className="text-3xl font-black text-white">Ready to Transform Your Sales & Support Operations?</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join thousands of revenue professionals using FlowCRM AI Enterprise.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')} className="!px-8 !py-3">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-400">© 2026 FlowCRM AI Enterprise</span>
          <div className="flex gap-4 text-xs text-slate-400">
            <button onClick={() => navigate('/landing')} className="hover:text-white cursor-pointer">Landing</button>
            <button onClick={() => navigate('/onboarding')} className="hover:text-white cursor-pointer">Onboarding</button>
            <button onClick={() => navigate('/login')} className="hover:text-white cursor-pointer">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
