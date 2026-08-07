import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Zap, DollarSign, Target, Users, ArrowRight,
  ChevronRight, ChevronLeft, CheckCircle2, Kanban, PieChart, Lock,
  Globe2, Layers, Briefcase, Play, Check, Shield, Cpu, MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { SpotlightCard } from '../../components/ui/MotionComponents';

const STEPS = [
  {
    id: 'lead-to-cash',
    badge: 'LEAD-TO-CASH ENGINE',
    title: 'Autonomous Revenue Pipeline & Reconciliation',
    subtitle: 'Streamline the full lifecycle from lead capture to quote issuance, order fulfillment, tax invoicing, and instant payment reconciliation.',
    icon: DollarSign,
    gradient: 'from-brand-550/15 via-teal-500/10 to-purple-500/10',
    highlights: [
      'Automated lead qualification & SLA breach alerts',
      'One-click quote conversion into customer orders',
      'GST Tax Invoice generation & payment status syncing',
      'Real-time MRR & ARR revenue forecasting'
    ],
    graphic: (
      <SpotlightCard className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-glossy-xl backdrop-blur-xl space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-mono text-brand-600 font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200">
            STATUS: RECONCILED PIPELINE
          </span>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Lead Qualified', val: '₹1,20,000', status: 'Converted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { name: 'Quote Approved', val: '₹85,000', status: 'Issued', color: 'bg-brand-50 text-brand-700 border-brand-200' },
            { name: 'Invoice Paid', val: '₹85,000', status: 'Reconciled', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-150"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-850">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-extrabold text-slate-850">{item.val}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </SpotlightCard>
    ),
  },
  {
    id: 'intelligence',
    badge: 'PREDICTIVE AI CORE',
    title: 'Grounded Deal Win-Probability & Health',
    subtitle: 'Machine intelligence grounded strictly in historical deal velocity, touchpoint frequency, and organizational win parameters.',
    icon: Sparkles,
    gradient: 'from-purple-500/15 via-brand-550/10 to-emerald-500/10',
    highlights: [
      'Explainable win-probability score with key factor drivers',
      'AI next-best-action recommendations for sales reps',
      'Stalled opportunity risk flags & quiet lead detection',
      'Executive analytics & deal conversion forecasting'
    ],
    graphic: (
      <SpotlightCard className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-glossy-xl backdrop-blur-xl space-y-4 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Enterprise AI Deal Win Score</span>
          <span className="text-xs font-mono font-extrabold text-emerald-600">94/100 (HIGH PROBABILITY)</span>
        </div>
        <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div className="h-full bg-gradient-to-r from-brand-550 via-teal-500 to-emerald-500 rounded-full w-[94%]" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-150">
            <p className="text-[10px] text-slate-450 font-bold uppercase">Decision Velocity</p>
            <p className="text-sm font-extrabold text-slate-850 mt-1">+38% Faster</p>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-150">
            <p className="text-[10px] text-slate-450 font-bold uppercase">Touchpoints Score</p>
            <p className="text-sm font-extrabold text-emerald-600 mt-1">16 Activities</p>
          </div>
        </div>
      </SpotlightCard>
    ),
  },
  {
    id: 'security',
    badge: 'ENTERPRISE GOVERNANCE',
    title: 'Strict Multi-Tenant Isolation & Audit',
    subtitle: 'Zero cross-tenant data leaks. Organization-scoped database boundary controls, TOTP 2FA, and tamper-evident audit logs.',
    icon: ShieldCheck,
    gradient: 'from-purple-500/15 via-pink-500/10 to-brand-550/10',
    highlights: [
      'Tenant context middleware enforced on all backend requests',
      'TOTP Authenticator 2FA & encrypted recovery keys',
      'Tamper-evident audit log streaming for compliance',
      'GDPR consent evidence tracking & automated data erasure'
    ],
    graphic: (
      <SpotlightCard className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-glossy-xl backdrop-blur-xl space-y-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-850">Multi-Tenant Boundary Shield</h4>
            <p className="text-[10px] text-slate-500 font-medium">Strict Organization Scoping Enforced</p>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-150 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Session Protection</span>
            <span className="text-emerald-600 font-extrabold">2FA Verified</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Audit Stream</span>
            <span className="text-brand-600 font-extrabold">Cryptographically Signed</span>
          </div>
        </div>
      </SpotlightCard>
    ),
  },
  {
    id: 'collaboration',
    badge: 'OMNICHANNEL DESK',
    title: '360° Customer Service Desk & Chat',
    subtitle: 'Integrated support tickets, live concierge chat widget, web forms, customer portal, and satisfaction surveys.',
    icon: Users,
    gradient: 'from-teal-500/15 via-emerald-500/10 to-brand-550/10',
    highlights: [
      'Unified view of tickets, contracts, assets, and invoices',
      'Embedded live support chat and customer portal access',
      'Automated CSAT / NPS survey distribution',
      'Customizable RBAC roles & team access permissions'
    ],
    graphic: (
      <SpotlightCard className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-glossy-xl backdrop-blur-xl space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3">
          <span className="text-xs font-extrabold text-slate-850">Support SLA Compliance</span>
          <span className="text-xs font-mono font-extrabold text-emerald-600">99.8% SLA Met</span>
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-slate-50/80 rounded-2xl flex items-center justify-between text-xs border border-slate-150">
            <span className="text-slate-800 font-bold">Critical Support Ticket</span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Resolved in 12m</span>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-2xl flex items-center justify-between text-xs border border-slate-150">
            <span className="text-slate-800 font-bold">CSAT Rating Score</span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">5.0 / 5.0 ⭐</span>
          </div>
        </div>
      </SpotlightCard>
    ),
  },
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const activeStep = STEPS[currentStep];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate('/landing');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between overflow-hidden relative font-sans select-none">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b ${activeStep.gradient} blur-[170px] transition-all duration-700`} />
      </div>

      {/* Header Bar */}
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
          <Button variant="ghost" size="sm" onClick={() => navigate('/landing')} className="!text-slate-500 hover:!text-slate-800 font-bold">
            Skip Intro
          </Button>
          <Button variant="glass" size="sm" onClick={() => navigate('/login')} className="!bg-brand-550 !text-white hover:!bg-brand-600 font-extrabold shadow-glossy">
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Feature Slide Container */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200/80 text-[10px] font-extrabold tracking-widest uppercase shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                {activeStep.badge}
              </motion.span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-850 tracking-tight leading-tight font-display">
                {activeStep.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-medium">
                {activeStep.subtitle}
              </p>

              <div className="space-y-3 pt-2">
                {activeStep.highlights.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + idx * 0.06 }}
                    className="flex items-center gap-3 text-xs font-extrabold text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Graphic Preview */}
            <div className="lg:col-span-5">
              {activeStep.graphic}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="relative z-10 px-6 py-6 max-w-6xl mx-auto w-full flex items-center justify-between border-t border-slate-200/80 bg-white/50 backdrop-blur-md rounded-t-3xl shadow-sm">
        <div className="flex items-center gap-2">
          {STEPS.map((stepItem, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentStep ? 'w-10 bg-brand-550' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              title={stepItem.title}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="!text-slate-600 disabled:opacity-30 cursor-pointer font-bold"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            size="sm"
            className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs shadow-glossy cursor-pointer flex items-center gap-1.5 py-2.5 px-5 rounded-2xl"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Launch Workspace' : 'Next Feature'}</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
