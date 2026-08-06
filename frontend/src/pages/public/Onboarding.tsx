import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Zap, DollarSign, Target, Users, ArrowRight,
  ChevronRight, ChevronLeft, CheckCircle2, Kanban, PieChart, Lock,
  Globe2, Layers, Briefcase, Play
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

const STEPS = [
  {
    id: 'lead-to-cash',
    badge: 'AUTOMATION ENGINE',
    title: 'Autonomous Lead-to-Cash Pipeline',
    subtitle: 'From initial web lead capture to quote approval, invoice generation, and instant payment reconciliation.',
    icon: DollarSign,
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    highlights: [
      'Automatic lead scoring & SLA breach warnings',
      'One-click quote conversion into official customer orders',
      'Automated invoice generation & payment reconciliation',
      'Real-time revenue forecast tracking'
    ],
    graphic: (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] font-mono text-indigo-400">STATUS: ACTIVE PIPELINE</span>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Lead Qualified', val: '$120,000', status: 'Converted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
            { name: 'Quote Approved', val: '$85,000', status: 'Issued', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
            { name: 'Invoice Paid', val: '$85,000', status: 'Reconciled', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-extrabold text-white">{item.val}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'intelligence',
    badge: 'AI PREDICTIVE INSIGHTS',
    title: 'Grounded Deal Win Probability & Health',
    subtitle: 'No hardcoded guesses. Machine intelligence grounded strictly in deal velocity, touchpoint frequency, and historical win metrics.',
    icon: Sparkles,
    gradient: 'from-sky-500 via-indigo-600 to-purple-600',
    highlights: [
      'Explainable win-probability breakdown with key factor drivers',
      'AI-suggested next-best-action recommendations for sales reps',
      'Risk flags on quiet deals with missing activity logs',
      'Executive dashboard insights & stage conversion analysis'
    ],
    graphic: (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Enterprise AI Deal Score</span>
          <span className="text-xs font-mono font-bold text-emerald-400">92/100 (HIGH WIN PROBABILITY)</span>
        </div>
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-[92%]" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Decision Velocity</p>
            <p className="text-sm font-extrabold text-white mt-1">+35% vs Avg</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Touchpoint Score</p>
            <p className="text-sm font-extrabold text-emerald-400 mt-1">14 Activities</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'security',
    badge: 'ENTERPRISE SECURITY',
    title: 'Strict Multi-Tenant Isolation & Audit',
    subtitle: 'Zero cross-tenant data leaks. Organization-scoped database boundary controls, TOTP MFA, and tamper-evident audit logs.',
    icon: ShieldCheck,
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    highlights: [
      'Automatic Tenant Context Middleware on every backend request',
      'TOTP Authenticator MFA & step-up security verification',
      'Tamper-evident audit log streaming for compliance',
      'GDPR consent evidence tracking & automated data erasure'
    ],
    graphic: (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Multi-Tenant Boundary Shield</h4>
            <p className="text-[10px] text-slate-400">Strict Organization Context Enforced</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Session Security</span>
            <span className="text-emerald-400 font-bold">2FA Verified</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Audit Stream</span>
            <span className="text-indigo-400 font-bold">Cryptographically Signed</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'collaboration',
    badge: 'OMNICHANNEL HUB',
    title: '360° Customer Support & Service Desk',
    subtitle: 'Integrated support tickets, live chat widget, web-to-lead forms, customer portal, and automated satisfaction surveys.',
    icon: Users,
    gradient: 'from-emerald-500 via-teal-600 to-indigo-600',
    highlights: [
      'Unified view of tickets, contracts, assets, and invoices',
      'Embedded live chat and customer portal access',
      'Automated CSAT / NPS survey distribution',
      'Customizable roles & team permissions'
    ],
    graphic: (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white">Customer Support SLA Adherence</span>
          <span className="text-xs font-mono font-bold text-emerald-400">99.8%</span>
        </div>
        <div className="space-y-2">
          <div className="p-2.5 bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Critical Support Desk Ticket</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Resolved in 14m</span>
          </div>
          <div className="p-2.5 bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">CSAT Satisfaction Score</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">5.0 / 5.0 ⭐</span>
          </div>
        </div>
      </div>
    ),
  },
];

import { Logo } from '../../components/ui/Logo';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const activeStep = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/landing');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b ${activeStep.gradient} opacity-15 blur-[160px] transition-all duration-700`} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/landing')}
          className="cursor-pointer group"
        >
          <Logo size="md" />
        </motion.div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/landing')} className="!text-slate-400 hover:!text-white">
            Skip Intro
          </Button>
          <Button variant="glass" size="sm" onClick={() => navigate('/login')} className="!bg-white/10 !text-white border-white/20 hover:!bg-white/20">
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Slide Section */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold tracking-widest uppercase"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {activeStep.badge}
              </motion.span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {activeStep.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl font-normal">
                {activeStep.subtitle}
              </p>

              <div className="space-y-3 pt-2">
                {activeStep.highlights.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.08 }}
                    className="flex items-center gap-3 text-xs font-semibold text-slate-200"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Graphic Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${activeStep.gradient} opacity-30 blur-xl group-hover:opacity-50 transition-opacity`} />
                <div className="relative">
                  {activeStep.graphic}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-5">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentStep === idx
                    ? 'w-8 bg-indigo-500'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={step.title}
              />
            ))}
            <span className="ml-3 text-xs font-bold text-slate-400">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button variant="glass" size="md" onClick={handlePrev} className="!bg-slate-800 !text-white border-slate-700 hover:!bg-slate-700">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer transition-all"
            >
              {currentStep === STEPS.length - 1 ? (
                <>Get Started Now <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
